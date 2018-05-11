var compareForm = $('#user-compare form')
var compareYear = $('.compare-select-year')
var compareMake = $('.compare-select-make')
var compareModel = $('.compare-select-model')
var compareTrim = $('.compare-select-trim')

var alreadyStoredCars = {}
var comparingItems = {
    car1 : {
        year : '',
        make : '',
        trim : '',
        model : '',
    },
    car2 : {
        year : '',
        make : '',
        trim : '',
        model : '',
    }
}

function setAllData() {
    var years = $(compareYear).children('select')
    var makes = $(compareMake).children('select')
    var models = $(compareModel).children('select')
    var trims = $(compareYear).children('select')

    var newObj = {
        car1 : {
            year : $(years[0]).val(),
            make : $(makes[0]).val(),
            trim : $(trims[0]).val(),
            model : $(models[0]).val()
        },
        car2 : {
            year : $(years[1]).val(),
            make : $(makes[1]).val(),
            trim : $(trims[1]).val(),
            model : $(models[1]).val()
        }
    }

    // console.log(comparingItems)

    return newObj
}

function querify(obj) {
    return Object.keys(obj).reduce(function(p,key){ return p + key + '=' + obj[ key ] + '&' },'')
}

function onCompareFormSubmit(e) {
    e.preventDefault()
}

function onSelectChange(e) {
    var itm = $(this).find(':selected').val()

    var parent = $(this).parent()
    var key = parent.data('car')

    var imgUrl = itm !== 'none' ? alreadyStoredCars[ itm ].img : '/assets/images/no-car-selected.png'

    $(parent).children('.image-content').children('img').attr('src', imgUrl)

    if(itm !== 'none') {
        var opts = itm.split('|')

        comparingItems[ key ].year = opts[ 0 ]
        comparingItems[ key ].make = opts[ 1 ]
        comparingItems[ key ].model = opts[ 2 ]
        comparingItems[ key ].trim = opts[ 3 ]

        $(parent).children('[class*=compare-select-]:not([class*=-trim])').children('select').attr('disabled', true)
    } else {
        $(parent).children('.compare-select-year').children('select').val('none')
        $(parent).children('.compare-select-make').children('select').val('none')
        $(parent).children('.compare-select-trim').children('select').val('none')
        $(parent).children('.compare-select-model').children('select').val('none')

        $(parent).children('[class*=compare-select-]').children('select').removeAttr('disabled')
    }
}

function onNextSelect(selectClass, prop) {
    var val = $(this).find(':selected').val()
    var key = $(this).parent().data('car')

    var nextSelect = $(this).parent().children(selectClass).children('select')

    var vals = $(this).parent().children('[class*=compare-select-]').children('select')

    comparingItems[ key ][ prop ] = val

    $.get('/car/compare/' + querify(comparingItems[ key ]), function(data) {
        console.log(data)
    })
}

$(document).ready(function() {
    compareForm.submit(onCompareFormSubmit)

    function addToOptGroup(label, options, select, appendOrPrepend) {
        var optgroup = $('<optgroup label="' + label + '"></optgroup>')
        var options = options.forEach(function(o, i) {
            var val = `${o.year}|${o.make}|${o.model}${o.trim? `|${o.trim}` : ''}`
            alreadyStoredCars[ val ] = o

            optgroup.append($(`
                <option value="${val}">${o.year} ${o.make} ${o.model}</option>
            `))
        })

        $(select)[ appendOrPrepend ]($(optgroup))
    }

    $.get('/car/saved/compare', function(resA) {
        if(resA.ok) {
            var cars = resA.cars

            var select = $('.saved-compare-select select')

            // if(!alreadyClear) $(select).html('')
            // alreadyClear = true

            addToOptGroup('Lease Specials', cars, select, 'append')
        }
    })

    $.get('/car/build/saved/compare', function(resB) {
        if(resB.ok) {
            var builds = resB.builds

            var select = $('.saved-compare-select select')

            // if(!alreadyClear) $(select).html('')
            // alreadyClear = true

            addToOptGroup('Saved Builds', builds, select, 'append')
        }
    })

    $('.saved-compare-select').on('change', onSelectChange)

    $(compareYear).on('change', function() {
        // onNextSelect('.compare-select-make').bind(this)
        onNextSelect.call(this, '.compare-select-make', 'year')
    })

    $(compareMake).on('change', function() {
        // onNextSelect('.compare-select-model').bind(this)
        onNextSelect.call(this, '.compare-select-model', 'make')
    })

    $(compareModel).on('change', function() {
        // onNextSelect('.compare-select-trim').bind(this)
        onNextSelect.call(this,'.compare-select-trim', 'model')
    })

    $(compareTrim).on('change', function() {
        onNextSelect.call(this)//, '.compare')
    })
})

comparingItems = Object.assign({}, comparingItems, setAllData())

console.log(comparingItems)
