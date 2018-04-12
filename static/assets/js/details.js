$(document).ready(function() {
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

            var data = $(this).serializeArray()

        })
    }, 500)
})
