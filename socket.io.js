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
// const clients = { ...objBase }

const clientMsgs = { ...objBase }

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
                {
                    $match :
                    {
                        $or : [
                            { read : { $exists : false }},
                            { read : false }
                        ]
                    }
                },
                {
                    $group : {
                        _id : { email : '$email', name : '$name' },
                        messages : { $push : '$$ROOT' }
                    }
                },
                {
                    $project : {
                        _id : 1,
                        messages : { $slice : [ '$messages', -50 ]},
                    }
                }
            ])

            clients.forEach(({ _id, messages : msgs }) => {
                const { name, email } = _id

                const messages = msgs.map(({ msg : text, to : type, timestamp, read }) => ({ timestamp, type, text, read }))

                // clientMsgs[ `${name}:${email}` ] = {
                clientSockets[ `${name}:${email}` ] = {
                    online : false,
                    name,
                    email,
                    messages,
                    newMessages : messages.length,
                    isTyping : false,
                    isFocus : false
                }
            })

            // console.log(clientSockets)

            return socket.emit('server:offline messages', { clients : { ...clientSockets }})
        } catch (e) {
            console.log(e)
        }
    }

    socket.on('disconnect', () => {
        debugger;
        delete adminSockets[ socket.id ]
    })

    socket.on('admin:new message', async ({ id, text : msg }) => {
        debugger;
        const { socket : socketClient, name, email } = clientSockets[ id ]

        const dbMsg = {
            from : 'company',
            to : 'client',
            timestamp : Date.now(),
            msg,
            name,
            email,
            read : true,
        }

        try {
            await new ChatMessage({ ...dbMsg }).save()
            await ChatMessage.update({ name, email, $or : [{ read : { $exists : false }}, { read : false }] }, { read : true }, { multi : true })

            const message = constructMessage('company', msg)
            socket.emit('server:new message', { id, message : { ...message, type : 'client', read : true } })

            if(socketClient) socketClient.emit('new message', message)
        } catch (e) {
            console.log(e)
        }
        // }
    })

    socket.on('admin:set messages to read', async ({ name, email }) => {
        debugger;
        try {
            const messages = await ChatMessage.update({ name, email, $or : [{ read : { $exists : false }}, { read : false }] }, { $set : { read : true }}, { multi : true })

            const newMsgs = await ChatMessage.count({ name, email, read : false })

            const id = `${name}:${email}`

            // console.log(adminSockets)
            // console.log(clientSockets)
            // console.log(clientSockets[ id ])

            if(!clientSockets[ id ].online) {
                console.log('deleting the object...')

                delete clientSockets[ id ]
            }
        } catch (e) {
            console.log(e)
        }
    })

    getOldMessages()
}

function clientSocketFunctions(socket) {
    const { id } = socket
    let isFirstMessageSent = false

    // clientSockets[ id ] = { socket, userData : { name : '', email : '' }}

    //#region functions
    function onDisconnect() {
        let nameEmail = null
        // for(let [ne, { socket : sckt }] of clientSockets) {
        //     if(sckt.id === socket.id) {
        //         nameEmail = ne
        //         break
        //     }
        // }

        // console.log(nameEmail)
        // emitMessageToSockets(adminSockets, 'server:client disconnect', nameEmail)
        for(let [ne, { socket : sckt }] of clientSockets) {
            if(sckt)
                if(sckt.id === socket.id) {
                    delete clientSockets[ ne ].socket
                    nameEmail = ne

                    break
                }
        }

        emitMessageToSockets(adminSockets, 'server:client disconnect', nameEmail)
    }

    // TODO: Come here, set messages properly
    async function onNewMessage({ name, email, msg }) {
        const id = `${name}:${email}`
        const message = constructMessage('client', msg)

        emitMessageToSockets(adminSockets, 'server:new message',  { id, message : {  ...message, type : 'company' }})
        socket.emit('new message', message)

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
            // console.log('message of client saved!')
        } catch(e) { console.log(e) }
    }

    async function onSetSocketStats({ isFocus, email, name, isTyping }) {
        const id = `${name}:${email}`

        const stats = { online : true, isFocus, email, name, isTyping }

        clientSockets[ id ] = { ...clientSockets[ id ], socket, ...stats }

        try {
            const msgs = await ChatMessage.find({ name, email }).sort({ timestamp : -1 }).limit(100).exec()
            const newMessages = await ChatMessage.count({ name, email, read : false })

            const messages = msgs.map(({ msg : text, to : type, timestamp, read }) => ({ timestamp, type, text, read })).reverse()

            emitMessageToSockets(adminSockets, 'server:chat stats', { id, ...stats, messages })
        } catch (err) {
            console.log(err)
        }
    }

    async function onGetRecentMessages({ name, email }) {
        // debugger;
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
// exports.chatSockets = clients

exports.server = server => {
    const sockets = io(server)

    sockets.of('/admin').on('connection', adminSocketFunctions)
    sockets.of('/chat').on('connection', clientSocketFunctions)
}
