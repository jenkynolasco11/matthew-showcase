$(document).ready(function() {
    var trim = $('#trim')
    var msrp = $('#msrp')
    var dest = $('#dest')
    var opts = $('#options')
    var invc = $('#invoice')
    var navItems = $('.nav-item')

    var options = $('[name=option-select')
    var selected = $('[name="option-select"]:checked').val()

    function appendData(item) {
        var data = item.split('|')

        trim.html('  ' + data[3])
        msrp.html('  $ ' + data[0])
        dest.html('  $ ' + data[1])
        invc.html('  $ ' + data[2])
        opts.html('  $ 0')
    }

    $(navItems).each(function(nav) {
        $(navItems[ nav ]).on('click', function() {
            var navOption = $(this).data('option')

            if(navOption === 'back') return window.history.go(-1)

            // $.get('/build-car/options', { options : selected }, function(data) {
            var link = '/build-car/options?options=' + selected + '&build=' + (100000000000000 * Math.random()).toString(16)

            // window.history.pushState(null, null, link)
            window.location.href = link
            // })
        })
    })

    options.on('change', function() {
        selected = $('[name="option-select"]:checked').val()

        appendData(selected)
    })

    appendData(selected)
})
