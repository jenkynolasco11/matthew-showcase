$(document).ready(function() {
    var url = window.location.href.split('/')
    var id = url[ url.length - 1 ]
    var isReminded = window.localStorage.getItem(id)

    // console.log(url, id, isReminded)

    if(isReminded !== 'true') {
        setTimeout(function() {
            var overlay = $('.popup-overlay')
            var closeHandler = $('.close-form')
            var stayInTouchForm = $('#stay-in-touch-form')

            if(overlay) $(overlay).css('display','flex').hide().fadeIn(500)
            if(closeHandler) $(closeHandler).on('click', function() {
                $(overlay).fadeOut(500)
            })

            if(stayInTouchForm) $(stayInTouchForm).submit(function(e) {
                e.preventDefault()

                var arr = $(this).serializeArray()
                var data = arr.reduce(function(p,n) {
                    var x = $.extend({}, p)

                    x[n.name] = n.value

                    return x
                }, {})

                $.post('/deal-subs/new-subscription', data, function(data) {
                    if(data.ok) window.localStorage.setItem(id, 'true')
                })

                $(overlay).fadeOut(500)
            })
        }, 500)
    }
})
