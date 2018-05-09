const io = require('socket.io')
const Chat = require('./models')

const { ChatMessage, ChatStates } = Chat
// const proxyHandler = {
//     set(target, key, val) {
//         if(!target[ key ]) {
//             if(target.length) target.length += 1
//             else target.length = 1
//         }

//         return target[ key ] = val
//     },
//     deleteProperty(target, key) {
//         if(target.length) return target.length -= 1
//     }
// }

const objBase = {
    [Symbol.iterator] : function* () {
        for(let key in this) {
            yield [key, this[ key ]]
        }
    }
}

const adminSockets = { ...objBase }
const clientSockets = { ...objBase }

function emitMessageToSockets(sockets, event, data = {}) {
    for(const [id, { socket }] of sockets) {
        socket.emit(event, data)
    }
}

function constructMessage(type, text) {
    const timestamp = new Date()

    const newMsg = { timestamp, text, type }

    return newMsg
}

function adminSocketFunctions(socket) {
    adminSockets[ socket.id ] = { socket }

    async function getOldMessages() {
        try {
            const clients = await ChatMessage.aggregate([
                { $match : { $or : [{ read : { $exists : false }}, { read : false }]}},
                {
                    $group : {
                        _id : { email : '$email', name : '$name' },
                        messages : { $push : '$$ROOT' }
                    }
                },
                {
                    $project : {
                        _id : 1,
                        messages : { $slice : [ '$messages', -50 ]}
                    }
                }
            ])

            socket.emit('server:offline messages', { clients })
        } catch (e) {
            console.log(e)
        }

        return null
    }

    socket.on('disconnect', () => {
        delete adminSockets[ socket.id ]
    })

    socket.on('admin:new message', async ({ id, text : msg }) => {
        const { socket : socketClient, userData } = clientSockets[ id ]
        const { name, email } = userData

        if(socketClient) {
            const message = constructMessage('company', msg)

            console.log(message)

            socketClient.emit('new message', message)
            socket.emit('server:new message', { id, message : { ...message, type : 'client' } })

            const dbMsg = {
                from : 'company',
                to : 'client',
                timestamp : Date.now(),
                msg,
                name,
                email,
                read : false,
            }

            try {
                // TODO: Messages aren't being saved... wtf?
                await new ChatMessage({ ...dbMsg }).save()
                console.log('message saved!')
            } catch (e) {
                console.log(e)
            }
        }
    })

    // socket.on('admin:get offline messages', async () => {
    //     try {
    //         const msgs = await getOldMessages()

    //         console.log(msgs)
    //     } catch (e) {
    //         console.log(e)
    //     }
    // })

    socket.on('admin:set messages to read', async ({ id, name, email }) => {
        try {
            await ChatMessage.update({ name, email, read : false }, { read : true }, { multi : true })
        } catch (e) {
            console.log(e)
        }
    })

    getOldMessages()
}

function clientSocketFunctions(socket) {
    const { id } = socket
    let isFirstMessageSent = false

    clientSockets[ id ] = { socket, userData : { name : '', email : '' }}

    //#region functions
    function onDisconnect() {
        delete clientSockets[ id ]

        emitMessageToSockets(adminSockets, 'server:client disconnect', id)
    }

    async function onNewMessage({ msg }) {
        const message = constructMessage('client', msg)

        // const message = { ...newMsg, type : 'client' }

        emitMessageToSockets(adminSockets, 'server:new message',  { id, message : {  ...message, type : 'company' } })
        socket.emit('new message', message)

        const { userData } = clientSockets[ id ]
        const { name, email } = userData

        const dbMsg = {
            from : 'client',
            to : 'company',
            timestamp : Date.now(),
            name,
            email,
            msg,
            read : false
        }

        try {
            await new ChatMessage({ ...dbMsg }).save()
            // TODO: Messages aren't being saved... wtf?
            console.log('message of client saved!')
        } catch(e) { console.log(e) }
    }

    async function onSetSocketStats({ isFocus, email, name, isTyping }) {
        const { userData : ud } = clientSockets[ id ]

        const userData = { ...ud, isFocus, email, name, isTyping }

        clientSockets[ id ].userData = { ...userData }

        try {
            const msgs = await ChatMessage.find({ email }).sort({ timestamp : -1 }).limit(100)

            const messages = msgs.map(({ msg : text, to : type, timestamp }) => ({ timestamp, type, text })).reverse()

            emitMessageToSockets(adminSockets, 'server:chat stats', { id, ...userData, messages })
        } catch (err) {
            console.log(err)
        }
    }

    async function onGetRecentMessages({ name, email }) {
        try {
            const orClause = { $or : [{ read : { $exists : false }}, { read : false }] }
            const findClause = { name, email, ...orClause }

            const messages = await ChatMessage.find(findClause).sort({ timestamp : -1 }).limit(25).exec()

            const msgTemplate = ({ msg : text, from : type, timestamp }) => ({ timestamp, type, text })

            const oldMessages = messages.map(msgTemplate)

            socket.emit('server:old messages', oldMessages)
        } catch (err) {
            console.log(err)
        }
    }
    //#endregion functions

    socket.on('disconnect', onDisconnect)
    socket.on('new message', onNewMessage)
    socket.on('chat:chat stats', onSetSocketStats)
    socket.on('chat:get old messages', onGetRecentMessages)
}

exports.sockets = adminSockets
exports.chatSockets = clientSockets

exports.server = server => {
    const sockets = io(server)

    sockets.of('/admin').on('connection', adminSocketFunctions)
    sockets.of('/chat').on('connection', clientSocketFunctions)
}
