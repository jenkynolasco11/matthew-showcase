const io = require('socket.io')

const availSockets = {
    [Symbol.iterator] : function* () {
        for(let key in this) {
            yield [key, this[ key ]]
        }
    }
}

exports.sockets = availSockets

exports.server = server => {
    const sockets = io(server)

    sockets.on('connection', socket => {
        console.log('New Connection: ' + socket.id)
        availSockets[ socket.id ] = socket

        socket.emit('id', socket.id)

        socket.on('disconnect', () => {
            delete availSockets[ socket.id ]
        })
    })
}
