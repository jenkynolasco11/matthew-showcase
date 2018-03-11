$(document).ready(function() {
    var navItems = $('.nav-item')
    var tabs = $('.tab-tops span')
    var form = $('form.form-options')

    $(form).on('submit', function(e){
        e.preventDefault()

        console.log('submitted')
    })

    $(navItems).each(function(nav) {
        $(navItems[ nav ]).on('click', function() {
            var navOption = $(this).data('option')

            if(navOption === 'back') return window.history.go(-1)

            $(form)[ 0 ].submit(function(e) {
                console.log(e)
                e.preventDefault()
                // $()
            })
        })
    })

    $(tabs).each(function() {
        $(this).on('click', function() {
            $(tabs).each(function() {
                $(this).removeClass('selected')
            })

            $(this).addClass('selected')

            var contents = $('.content > div')
            var contentToShow = $(this).data('content')

            $(contents).each(function() {
                $(this).removeClass('show')
            })

            $('#' + contentToShow).addClass('show')
        })
    })
})
