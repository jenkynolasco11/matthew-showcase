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

function emitMessageToSockets(sockets, msg, data) {
    for(const [id, { socket }] of sockets) {
        socket.emit(msg, data)
    }
}

function constructMessage(type, text) {
    const timestamp = new Date()

    const newMsg = { timestamp, text, type }

    return newMsg
}

function adminSocketFunctions(socket) {
    // console.log('New Connection on Admin => ' + socket.id)
    adminSockets[ socket.id ] = { socket }

    socket.on('disconnect', () => {
        delete adminSockets[ socket.id ]
    })

    socket.on('admin:get list connected', () => {
        const entries = Object.keys(clientSockets).map(id => {
            const { userData } = clientSockets[ id ]

            console.log(userData)

            return { id, ...userData }
        })

        socket.emit('server:list connected clients', [ ...entries ])
    })

    // TODO: Save the messages into the DB
    socket.on('admin:new message', ({ id, text }) => {
        const socketClient = clientSockets[ id ].socket

        if(socketClient) {
            const message = constructMessage('company', text)

            socketClient.emit('new message', message)
            socket.emit('server:new message', { id, message : { ...message, type : 'client' } })
        }
    })
}

function clientSocketFunctions(socket) {
    const { id } = socket

    clientSockets[ id ] = { socket, /*messages : []*/ }

    //#region functions
    function onDisconnect() {
        delete clientSockets[ id ]

        emitMessageToSockets(adminSockets, 'server:client disconnect', id)
    }

    // TODO: Save the messages into the DB
    function onNewMessage({ msg }) {
        const newMsg = constructMessage('client', msg)

        const message = { ...newMsg, type : 'company' }

        // clientSockets[ id ].messages.push(message)

        emitMessageToSockets(adminSockets, 'server:new message',  { id, message })
        socket.emit('new message', newMsg)
    }

    function setSocketData({ name, email, isFocus }) {
        clientSockets[ id ].userData = { email, name, isFocus }

        emitMessageToSockets(adminSockets, 'server:new connection', { id, email, name, isFocus })
    }

    function chatStat(name, val){
        clientSockets[ id ][ name ] = val

        emitMessageToSockets(adminSockets, 'server:chat stat', { id, [ name ] : val })
    }
    //#endregion functions

    socket.on('disconnect', onDisconnect)
    socket.on('new message', onNewMessage)
    socket.on('chat:set data', setSocketData)
    socket.on('chat:chat focus', ({ focus }) => chatStat('isFocus', focus))
    socket.on('chat:chat typing', ({ typing }) => chatStat('isTyping', typing))
}

// setInterval(() => {
//     console.log('sending...')
//     for([_, s] of chatSockets) s.emit('new message', { timestamp : Date.now(), text : 'this is a test' , type : 'company' })
// }, 1000)

exports.sockets = adminSockets
exports.chatSockets = clientSockets

exports.server = server => {
    const sockets = io(server)

    sockets.of('/admin').on('connection', adminSocketFunctions)
    sockets.of('/chat').on('connection', clientSocketFunctions)
}
