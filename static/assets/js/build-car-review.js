$(document).ready(function() {
    var navItems = $('.nav-item')
    var tabs = $('.tab-tops span:not(#compare-button):not(#save-button)')
    var form = $('form.form-options')

    var saveBtn = $('#save-button')
    var compareBtn = $('#compare-button')

    var isSaved = false

    setTimeout(function() {
        var flashyTab = $('[data-content=proceed-form]')

        flashyTab.addClass('flash')
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

    $('.save-item').on('click', function(e) {
        e.preventDefault()

        var usr = JSON.parse(window.sessionStorage.getItem('user'))

        // console.log(usr)

        if(usr) {
            $.post('/car/build/save', function(data) {
                if(data.ok) {
                    console.log('data saved!')
                }
            })
        } else return openAuth()
    })

    $('.compare-item').on('click', function(e) {
        e.preventDefault()

        //TODO: Add the compare build action in here
    })

    saveBtn.on('click', function(e) {
        if(!isSaved) {
            var user = JSON.parse(window.sessionStorage.getItem('user'))

            if(!user) return openAuth()
            
            var data = $(form).serializeArray()

            $.ajax({
                type : 'POST',
                url : '/car/build/new',
                data : data,
                success : function(d) {
                    if(d) {
                        isSaved = true

                        saveBtn.css('backgroundColor', 'green')
                        saveBtn.css('color', 'white')
                    }
                }  
            })
        }
    })

    compareBtn.on('click', function(e) {
        var user = JSON.parse(window.sessionStorage.getItem('user'))

        if(!user) return openAuth()

        var options = $('input[name=options]').val().split('|')
        var year = options[ 0 ]
        var make = options[ 1 ]
        var model = options[ 2 ]
        
        window.location.href = `/dashboard?compare=true&year=${ year }&make=${ make }&model=${ model }`
    })

    checkAuthentication()
})
