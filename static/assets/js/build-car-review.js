$(document).ready(function() {
    var navItems = $('.nav-item')

    $(navItems).each(function(nav) {
        $(navItems[ nav ]).on('click', function() {
            var navOption = $(this).data('option')

            if(navOption === 'back') return window.history.go(-1)
        })
    })
})
