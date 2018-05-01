const io = require('socket.io')
const ChatMessage = require('./models').ChatMessage
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

    socket.on('disconnect', () => {
        delete adminSockets[ socket.id ]
    })

    socket.on('admin:new message', ({ id, text }) => {
        const { socket : socketClient, userData } = clientSockets[ id ]
        const { name, email } = userData

        if(socketClient) {
            const message = constructMessage('company', text)

            socketClient.emit('new message', message)
            socket.emit('server:new message', { id, message : { ...message, type : 'client' } })

            const dbMsg = {
                from : 'company',
                to : 'client',
                timestamp : Date.now(),
                msg : text,
                name,
                email,
            }

            new ChatMessage( dbMsg ).save()
        }
    })
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

    function onNewMessage({ msg }) {
        const newMsg = constructMessage('client', msg)

        const message = { ...newMsg, type : 'company' }

        // clientSockets[ id ].messages.push(message)

        emitMessageToSockets(adminSockets, 'server:new message',  { id, message })
        socket.emit('new message', newMsg)

        const { userData } = clientSockets[ id ]

        const { name, email } = userData

        const dbMsg = {
            from : 'client',
            to : 'company',
            timestamp : Date.now(),
            name,
            email,
            msg,
        }

        new ChatMessage( dbMsg ).save()
    }

    // function onSetSocketData({ name, email, isFocus }) {
    //     clientSockets[ id ].userData = { email, name, isFocus }

    //     console.log('here')

    //     setTimeout(() => {
    //         const msg = {
    //             text : `Welcome to JYD, ${ name }! How can we help you out today?`,
    //             timestamp : Date.now(),
    //             type : 'company'
    //         }

    //         socket.emit('new message', newMsg)
    //     }, 1000)

    //     emitMessageToSockets(adminSockets, 'server:new connection', { id, email, name, isFocus })
    // }

    async function onSetSocketStats({ isFocus, email, name, isTyping }) {
        const { userData : ud } = clientSockets[ id ]

        const userData = { ...ud, isFocus, email, name, isTyping }

        clientSockets[ id ].userData = { ...userData }

        try {
            const msgs = await ChatMessage.find({ name, email }).limit(100)

            const messages = msgs.map(({ msg : text, to : type, timestamp }) => ({ timestamp, type, text }))

            emitMessageToSockets(adminSockets, 'server:chat stats', { id, ...userData, messages })
        } catch (err) {
            console.log(err)
        }

    }

    async function onGetRecentMessages({ name, email }) {
        try {
            const messages = await ChatMessage.find({ name, email }).limit(25).exec()

            const oldMessages = messages.map(({ msg : text, to : type, timestamp }) => ({ timestamp, type, text }))

            socket.emit('server:old messages', oldMessages)
        } catch (err) {
            console.log(err)
        }
    }
    //#endregion functions

    socket.on('disconnect', onDisconnect)
    socket.on('new message', onNewMessage)
    // socket.on('chat:set data', onSetSocketData)
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
