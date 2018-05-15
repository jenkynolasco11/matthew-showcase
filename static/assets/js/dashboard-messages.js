var openChatButton = $('#open-chat')

var handlers = {
    chat: {
        total: 0,
        skip: 0,
        limit: 8,
    },
    msg: {
        total: 0,
        skip: 0,
        limit: 8,
    }
}

var emailMessages = []
var chatMessages = []

var paginationTemplate = function (items) {
    return `
        <li class="paginate-item paginate-nav" data-increase="-1">
            <a href=#>
                <i class="icon fa fa-angle-double-left"></i>
            </a>
        </li>
        ${ items }
        <li class="paginate-item paginate-nav" data-increase="1">
            <a href=#>
                <i class="icon fa fa-angle-double-right"></i>
            </a>
        </li>
    `
}

function renderPaginationOn(element, hndl, getFunction) {
    var pages = Math.ceil(handlers[hndl].total / handlers[hndl].limit)
    var itms = []

    var page = handlers[hndl].skip / handlers[hndl].limit
    var offset = 2

    for (var i = 1; i <= pages; i++) {
        itms.push(`
            <li class="page-item paginate-page ${ i-1 === handlers[ hndl ].skip ? 'active' : '' }" data-skip=${ i - 1 }>
                <a class="page-link" href=#>
                    ${ i }
                </a>
            </li>
        `)
    }

    // function getOffset(paginationItems){
    //   if(page < 5 - offset) return paginationItems.slice(0, 5)
    //   else if(page > offset && page < pages - offset) return paginationItems.slice(page - offset, page + offset + 1)
    //   else return paginationItems.slice(-5)
    // }

    // var pageItems = getOffset(itms)

    // console.log(pageItems)

    $(element).children('.pagination').html('')
    $(element).children('.pagination').append(paginationTemplate(itms.join('')))

    $(element).children('.pagination').children('.paginate-nav').each(function () {
        $(this).on('click', function (e) {
            e.preventDefault()

            var i = $(this).data('increase')

            if (handlers[hndl].skip + i >= 0 && handlers[hndl].skip + i < pages) {
                handlers[hndl].skip += i

                return getFunction()
            }
        })
    })

    $(element).children('.pagination').children('.paginate-page').on('click', function (e) {
        e.preventDefault()

        handlers[hndl].skip = $(this).data('skip')

        return getFunction()
    })

    // console.log(handlers)
}

// function getEmailMessages() {
//     var url = `/user/email-messages?skip=${ handlers[ 'msg' ].skip * handlers[ 'msg' ].limit }&limit=${ handlers[ 'msg' ].limit }`

//     $.get(url, function (data) {
//         if (data.ok) {
//             // console.log(data.messages)
//             var table = $('.messages-section .email-messages')
//             var tbody = table.children('table').children('tbody')
//             var rows = ''

//             data.messages.forEach(function (msg) {
//                 rows += `
//             <tr>
//                 <td>${ msg.type }</td>
//                 <td>${ new Date(msg.createdBy).toLocaleDateString() + ' ' + new Date(msg.createdBy).toLocaleTimeString() }</td>
//             </tr>
//           `
//             })

//             tbody.html('')
//             tbody.append($(rows))

//             renderPaginationOn(table, 'msg', getEmailMessages)
//         }
//     })
// }

function getChatMessages() {
    var url = `/user/chat-messages?skip=${ handlers[ 'chat' ].skip * handlers[ 'chat' ].limit }&limit=${ handlers[ 'chat' ].limit }`

    $.get(url, function (data) {
        if (data.ok) {
            var table = $('.messages-section .chat-messages')
            var tbody = table.children('table').children('tbody')
            var rows = ''

            data.chatMessages.forEach(function (msg) {
            //     rows += `
            //     <tr>
            //         <td>${ msg.from }</td>
            //         <td>${ msg.msg.length > 50 ? msg.msg.slice(0, 50) + '...' : msg.msg }</td>
            //         <td>${ new Date(msg.timestamp).toLocaleDateString() + ' ' + new Date(msg.timestamp).toLocaleTimeString() }</td>
            //     </tr>
            // `
                rows += `
                    <tr>
                        <td>${ msg.from }</td>
                        <td>${ msg.msg }</td>
                        <td>${ new Date(msg.timestamp).toLocaleDateString() + ' ' + new Date(msg.timestamp).toLocaleTimeString() }</td>
                    </tr>
                `
            })

            tbody.html('')
            tbody.append($(rows))

            renderPaginationOn(table, 'chat', getChatMessages)
        }
    })
}

$(document).ready(function () {
    // $(settingsForm).submit(onSubmitSettings)

    $.get('/user/messages/count', function (data) {
        if (data.ok) {
            handlers['chat'].total = data.chatCount
            handlers['msg'].total = data.msgCount

            getChatMessages()
            // getEmailMessages()
        }
    })

    // openChatButton.on('click', )

})
