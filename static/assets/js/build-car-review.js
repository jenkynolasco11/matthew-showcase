$(document).ready(function() {
    var navItems = $('.nav-item')
    var tabs = $('.tab-tops span')
    var form = $('form.form-options')

    setTimeout(function() {
        var flashyTab = $('[data-content=proceed-form]')

        if(!flashyTab.attr('class')) flashyTab.addClass('flash')
    }, 5000)

    $(form).on('submit', function(e){
        e.preventDefault()
        var data = {}

        var items = $(this).serializeArray()

        $.ajax({
            type : 'POST',
            url : '/car/build/new',
            data : items,
            success : function(d) {
                if(d) {
                    function returnToIndex() { window.location.href = '/' }

                    var tmout = setTimeout(returnToIndex, 3400)

                    openModal(returnToIndex)
                }
            }
        })
    })

    $(navItems).each(function(nav) {
        $(navItems[ nav ]).on('click', function() {
            var navOption = $(this).data('option')

            if(navOption === 'back') return window.history.go(-1)
        })
    })

    $(tabs).each(function() {
        $(this).on('click', function() {
            $(tabs).each(function() {
                $(this).removeClass('selected')
            })

            $(this).addClass('selected')
            $(this).removeClass('flash')

            var contents = $('.content > div')
            var contentToShow = $(this).data('content')

            $(contents).each(function() {
                $(this).removeClass('show')
            })

            $('#' + contentToShow).addClass('show')
        })
    })
})
