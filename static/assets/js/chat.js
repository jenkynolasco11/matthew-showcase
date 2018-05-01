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
var chatStatsOnClient = {
    // newMessages : 0,
    messages : [],
    isFocus : false,
    isTyping : false,
    name : '',
    email : '',
    id : ''
}
var socketInterval = null
var isTypingPromise = null

function sendStats() {
    var isTyping = chatStatsOnClient.isTyping
    var isFocus = chatStatsOnClient.isFocus
    var email = chatStatsOnClient.email
    var name = chatStatsOnClient.name
    var id = chatStatsOnClient.id

    var stats = { isFocus : isFocus, email : email, name : name, id : id, isTyping : isTyping }

    socketIO.emit('chat:chat stats', stats)
}

function startSocketInterval() {
    if(socketInterval) clearInterval(socketInterval)

    socketInterval = setInterval(sendStats, 500)
}

function socketFuncs(socket) {
    function msgTemplate(type, timestamp, msg) {
        var dt = new Date(timestamp)

        var tmstmp = dt.toLocaleDateString() + ' ' + dt.toLocaleTimeString()

        return `
            <div class="message ${ type }">
                <p class="timestamp">${ tmstmp }</p>
                <p class="text">${ msg }</p>
            </div>
        `
    }

    // This only triggers when it's refreshed
    socket.on('server:old messages', function(data) {
        data.forEach(function(msg) {
            var newMsg = $(msgTemplate(msg.type, msg.timestamp, msg.text || ''))

            messageWindow.append(newMsg.fadeIn(200))
        })
    })

    socket.on('new message', function(msg) {
        var newMsg = $(msgTemplate(msg.type, msg.timestamp, msg.text))

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

        if(!checkIfCached()) return

        var isFocus = /open/.test(chatBox.attr('class'))

        return startSocketInterval()
    })
}

function sendChatMessage() {
    var msg = messageBox.val()

    if(msg) {
        messageBox.val('')

        socketIO.emit('new message', { msg : msg })

        clearTimeout(isTypingPromise)
        chatStatsOnClient.isTyping = false
    }
}

function hideOverlay() {
    $('#overlay-data').fadeOut(400, function() {
        $(this).addClass('is-cached')
    })
}

// Submit chat data from email/name
function submitChatInfo(e) {
    e.preventDefault()

    var name = inputName.val()
    var email = inputEmail.val()

    console.log(name, email)

    window.sessionStorage.setItem('chat:name', name)
    window.sessionStorage.setItem('chat:email', email)

    hideOverlay()

    socketIO.emit('chat:get old messages', { name : name, email : email })
    return startSocketInterval()
}

function checkIfCached() {
    var name = window.sessionStorage.getItem('chat:name') || ''
    var email = window.sessionStorage.getItem('chat:email') || ''

    return name !== '' && email !== ''
}

function setTypingStat() {
    clearTimeout(isTypingPromise)

    isTypingPromise = setTimeout(() => chatStatsOnClient.isTyping = false, 3000)

    chatStatsOnClient.isTyping = true
}

closeChat.on('click', function() {
    $(chatBox).removeClass('open')
    chatStatsOnClient.isFocus = false

    if(checkIfCached()) socketIO.emit('chat:chat focus', { focus : false })
})

handle.on('click', function () {
    $(chatBox).addClass('open')
    $(handle).removeClass('wiggle')
    $(messagesCount).removeClass('show-count')

    if(checkIfCached()) {
        chatStatsOnClient.isFocus = true
        socketIO.emit('chat:chat focus', { focus : true })

        newMessagesCount = 0
    }

    //TODO: send a message through socket saying person is typing
})

messageBox.keyup(function(e){
    if(e.keyCode === 13) sendChatMessage()
    else setTypingStat()
})

sendButton.on('click', sendChatMessage)
chatForm.on('submit', submitChatInfo)

$(document).ready(function() {
    // Mount socket handlers
    socketFuncs(socketIO)

    if(!checkIfCached()) return

    var name = window.sessionStorage.getItem('chat:name')
    var email = window.sessionStorage.getItem('chat:email')
    var isFocus = /open/.test(chatBox.attr('class'))

    chatStatsOnClient.name = name
    chatStatsOnClient.email = email
    chatStatsOnClient.isFocus = isFocus

    $('#overlay-data').addClass('is-cached')

    socketIO.emit('chat:get old messages', { name : name, email : email })
    return startSocketInterval()
})
