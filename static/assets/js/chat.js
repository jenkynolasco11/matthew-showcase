var socketIO = io('/chat')

var handle = $('#chat-handle')
var chatBox = $('#chat-box')
var messageBox = $('.message-box [type=text]')
var sendButton = $('.message-box .send-button')
var messageWindow = $('#chat .messages')
var closeChat = $('.close-chat .close')
var inputName = $('#overlay-data .inputs [type=text]')
var inputEmail = $('#overlay-data .inputs [type=email]')
var chatForm = $('.inputs')

var messagesCount = $('#chat-handle .messages-count')
var newMessagesCount = 0

// TODO: Set chat stats from here in case there is not going to be any chat logging
var chatStats = {
    messages : [],
    isFocus : false,
    id : ''
}

function socketFuncs(socket) {
    function template(type, timestamp, msg) {
        var dt = new Date(timestamp)

        var tmstmp = dt.toLocaleDateString() + ' ' + dt.toLocaleTimeString()

        return `
            <div class="message ${ type }">
                <p class="timestamp">${ tmstmp }</p>
                <p class="text">${ msg }</p>
            </div>
        `
    }

    socket.on('new message', function(msg) {
        var newMsg = $(template(msg.type, msg.timestamp, msg.text))

        if(!/open/.test(chatBox.attr('class')) && msg.type === 'company') {
            newMessagesCount += 1

            $(messagesCount).html(newMessagesCount)
            $(messagesCount).addClass('show-count')
            $(handle).addClass('wiggle')
        }

        messageWindow.append(newMsg.fadeIn(200))

        messageWindow.scrollTop($(messageWindow)[0].scrollHeight)
        // messageWindow.animate({ scrollTop : newMsg.offset().top }, 400)
    })

    socket.on('connect', function() {
        var name = window.sessionStorage.getItem('chat:name')
        var email = window.sessionStorage.getItem('chat:email')

        if(!name && !email) return

        var isFocus = /open/.test(chatBox.attr('class'))

        return socketIO.emit('chat:set data', { name : name, email : email, isFocus : isFocus })
    })
}

function sendChatMessage() {
    var msg = messageBox.val()
    messageBox.val('')

    if(msg) socketIO.emit('new message', { msg : msg })
}

function hideOverlay() {
    $('#overlay-data').fadeOut(400, function() {
        $(this).addClass('is-cached')
    })
}

function submitChatInfo(e) {
    e.preventDefault()

    var name = inputName.val()
    var email = inputEmail.val()

    window.sessionStorage.setItem('chat:name', name)
    window.sessionStorage.setItem('chat:email', email)

    hideOverlay()

    socketIO.emit('chat:set data', { name : name, email : email, isFocus : true })
}

function checkIfCached() {
    var name = window.sessionStorage.getItem('chat:name') || ''
    var email = window.sessionStorage.getItem('chat:email') || ''

    return name !== '' && email !== ''
}

closeChat.on('click', function() {
    $(chatBox).removeClass('open')

    if(checkIfCached()) socketIO.emit('chat:chat focus', { focus : false })
})

handle.on('click', function () {
    $(chatBox).addClass('open')
    $(handle).removeClass('wiggle')
    $(messagesCount).removeClass('show-count')

    if(checkIfCached()) {
        socketIO.emit('chat:chat focus', { focus : true })

        newMessagesCount = 0
    }

    //TODO: send a message through socket saying person is typing
})

messageBox.keyup(function(e){
    if(e.keyCode === 13) return sendChatMessage()
})

sendButton.on('click', sendChatMessage)
chatForm.on('submit', submitChatInfo)

socketFuncs(socketIO)

$(document).ready(function() {
    if(!checkIfCached()) return

    var name = window.sessionStorage.getItem('chat:name')
    var email = window.sessionStorage.getItem('chat:email')
    var isFocus = /open/.test(chatBox.attr('class'))

    $('#overlay-data').addClass('is-cached')
    return socketIO.emit('chat:set data', { name : name, email : email, isFocus : isFocus })
})
