$(document).ready(function() {
    var trim = $('#trim')
    var msrp = $('#msrp')
    var dest = $('#dest')
    var opts = $('#options')
    var invc = $('#invoice')
    var navItems = $('.nav-item')
    var labelItems = $('h5.options-group_label')

    var options = $('.selected-options')

    function changeInvoiceOptionsPrice(inv, prc) {
        opts.html('$ ' + prc.replace(/(\d)(?=(\d{3})+$)/g, '$1,'))
        invc.html('$ ' +('' + (parseInt(inv) + parseInt(prc))).replace(/(\d)(?=(\d{3})+$)/g, '$1,'))
    }

    function getCurrentPrices() {
        var optionVars = $('#base-vars')
        var optsDummy = ''
        var price = 0
        var invoice = 0

        var selected = $('.selected-options:checked').each(function(){
            optsDummy = $(this).data('value')
            var value = optsDummy.split('|')

            price += parseInt(value.pop().replace(',',''))
            invoice = parseInt(value[ 5 ])
        })

        var newOpts = optsDummy.split('|')
        newOpts[newOpts.length - 1] = price
        newOpts[ 5 ] = invoice + price

        optionVars.html(newOpts.join('|'))

        changeInvoiceOptionsPrice('' + invoice, '' + price)
    }

    $(options).each(function() {
        $(this).on('change', getCurrentPrices)
    })

    $(labelItems).each(function() {
        $(this).on('click', function() {
            $(this).toggleClass('open')
        })
    })

    $(navItems).each(function(nav) {
        $(navItems[ nav ]).on('click', function() {
            var navOption = $(this).data('option')

            if(navOption === 'back') return window.history.go(-1)

            var optionVars = $('#base-vars').html()
            var optionsSelected = []

            $('.selected-options:checked').each(function(){
                optionsSelected.push($(this).data('name'))
            })

            optionsSelected.push('{Color}' + ($('#desired-color').val().toLowerCase() || 'Any'))

            console.log(!!$('#desired-color').val())

            var selected = optionVars + '|' + optionsSelected.join('|')

            var link = '/build-car/review?options='  + encodeURIComponent(selected) + '&build=' + (100000000000000 * Math.random()).toString(16)

            window.location.href = link
            // console.log(selected)
        })
    })

    getCurrentPrices()
})
