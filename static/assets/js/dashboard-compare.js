var compareForm = $('#user-compare form')
var compareYear = $('.compare-select-year')
var compareMake = $('.compare-select-make')
var compareModel = $('.compare-select-model')
var compareTrim = $('.compare-select-trim')

var photoPlaceholder = '/assets/images/no-car-selected.png'

var alreadyStoredCars = {}
var comparingItems = {
    car1 : {
        year : '',
        make : '',
        model : '',
        trim : '',
    },
    car2 : {
        year : '',
        make : '',
        model : '',
        trim : '',
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

    var car1 = comparingItems.car1
    var car2 = comparingItems.car2

    if(car1.year !== 'none' && car1.make !== 'none' && car1.model !== 'none' && car2.year !== 'none' && car2.make !== 'none' && car2.model !== 'none') {
        var car1Stats = `${ car1.year },${ car1.make },${ car1.model },${ car1.trim }`
        var car2Stats = `${ car2.year },${ car2.make },${ car2.model },${ car2.trim }`

        window.location.href = `/dashboard?comparing=true&car1=${ car1Stats }&car2=${ car2Stats }`
    }

    console.log(comparingItems)
}

function onSavedCompareChange(e) {
    var itm = $(this).find(':selected').val()

    var parent = $(this).parent()
    var key = parent.data('car')

    var imgUrl = itm !== 'none' ? alreadyStoredCars[ itm ].img : photoPlaceholder

    $(parent).children('.image-content').children('img').attr('src', imgUrl)

    if(itm !== 'none') {
        var opts = itm.split('|')

        comparingItems[ key ].year = opts[ 0 ]
        comparingItems[ key ].make = opts[ 1 ]
        comparingItems[ key ].model = opts[ 2 ]
        comparingItems[ key ].trim = opts[ 3 ]

        $(parent).children('[class*=compare-select-]:not([class*=-trim])').children('select').attr('disabled', true)

        if(!opts[ 3 ]) {
            $.get(`/car/compare/stats?get=modelTrim&make=${ opts[ 1 ] }&year=${ opts[ 0 ] }&model=${ opts[ 2 ] }`, function(data) {
                var trimsSelect = parent.children('.compare-select-trim').children('select')

                if(data.ok) {
                    var trims = data.data
                    console.log(trims)
                    console.log(trims.length)

                    if(trims.length === 0) return trimsSelect.html('<option value="none trim">No Trims Available</option>')

                    trimsSelect.html('<option value="none">Select Trim</option>')

                    trims.forEach(function(trim) {
                        trimsSelect.append(`<option value="${ trim }">${ trim }</option>`)
                    })
                } else trimsSelect.append('<option value="none trim">No Trims Available</option>')
            })
        }
    } else {
        $(parent).children('.compare-select-year').children('select').val('none')
        $(parent).children('.compare-select-make').children('select').html('<option value="none">Select Make</option>')
        $(parent).children('.compare-select-trim').children('select').html('<option value="none">Select Trim</option>')
        $(parent).children('.compare-select-model').children('select').html('<option value="none">Select Model</option>')

        comparingItems[ key ].year = 'none'
        comparingItems[ key ].make = 'none'
        comparingItems[ key ].model = 'none'
        comparingItems[ key ].trim = 'none'

        $(parent).children('[class*=compare-select-]').children('select').removeAttr('disabled')
    }

    console.log(comparingItems)
}

function setDefaultValues() {
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

    $.get('/car/compare/saved', function(resA) {
        if(resA.ok) {
            var cars = resA.cars
            console.log(cars)

            var select = $('.saved-compare-select select')

            addToOptGroup('Lease Specials', cars, select, 'append')
        }
    })

    $.get('/car/build/compare/saved', function(resB) {
        if(resB.ok) {
            var builds = resB.builds

            console.log(builds)

            var select = $('.saved-compare-select select')

            addToOptGroup('Saved Builds', builds, select, 'append')
        }
    })
}

function onYearChange() {
    var select = $(this).children('select')
    var key = select.attr('name').slice(-1) === 'a' ? 'car1' : 'car2'
    var year = select.val()

    var parent = $(this).parent()
    parent.children('.compare-select-make').children('select').html('<option value="none">Select Make</option>')
    parent.children('.compare-select-model').children('select').html('<option value="none">Select Model</option>')
    parent.children('.compare-select-trim').children('select').html('<option value="none">Select Trim</option>')

    $.get(`/car/compare/stats?get=modelMakeId&year=${ year }`, function(data) {
        if(data.ok) {
            var makes = data.data

            var makesSelect = parent.children('.compare-select-make').children('select')
            makes.forEach(function(make) {
                makesSelect.append(`<option value="${ make }">${ make }</option>`)
            })

            parent.children('.image-content').children('img').attr('src', photoPlaceholder)
        }
    })

    comparingItems[ key ].year = year
    console.log(comparingItems)
}

function onMakeChange() {
    var select = $(this).children('select')
    var key = select.attr('name').slice(-1) === 'a' ? 'car1' : 'car2'
    var make = select.val()

    var parent = $(this).parent()
    var year = parent.children('.compare-select-year').children('select').val()

    parent.children('.compare-select-model').children('select').html('<option value="none">Select Model</option>')
    parent.children('.compare-select-trim').children('select').html('<option value="none">Select Trim</option>')

    $.get(`/car/compare/stats?get=model&make=${ make }&year=${ year }`, function(data) {
        if(data.ok) {
            var models = data.data

            var modelsSelect = parent.children('.compare-select-model').children('select')
            models.forEach(function(model) {
                modelsSelect.append(`<option value="${ model }">${ model }</option>`)
            })

            parent.children('.image-content').children('img').attr('src', photoPlaceholder)
        }
    })

    comparingItems[ key ].make = make
    // console.log(key)
    console.log(comparingItems)
}

function onModelChange() {
    var select = $(this).children('select')
    var key = select.attr('name').slice(-1) === 'a' ? 'car1' : 'car2'
    var model = select.val()

    var parent = $(this).parent()
    var year = parent.children('.compare-select-year').children('select').val()
    var make = parent.children('.compare-select-make').children('select').val()

    // parent.children('.compare-select-model').children('select').html('<option value="none">Select Model</option>')
    // parent.children('.compare-select-trim').children('select').html('<option value="none">Select Trim</option>')

    // $.get(`/car/compare/stats?get=modelTrim&make=${ make }&year=${ year }&model=${ model }`, function(data) {
    //     if(data.ok) {
    //         var trims = data.data

    //         var trimsSelect = parent.children('.compare-select-trim').children('select')
    //         trims.forEach(function(trim) {
    //             trimsSelect.append(`<option value="${ trim }">${ trim }</option>`)
    //         })
    //     } else trimsSelect.append('<option value="none trim">No Trims</option>')
    // })

    $.get(`/car/build/compare/stats/img?make=${ make }&year=${ year }&model=${ model }`, function(data) {
        if(data.ok) parent.children('.image-content').children('img').attr('src', data.photo)
        else parent.children('.image-content').children('img').attr('src', photoPlaceholder)
    })

    comparingItems[ key ].model = model
    console.log(comparingItems)
}

// function onTrimChange() {
//     var select = $(this).children('select')
//     var key = select.attr('name').slice(-1) === 'a' ? 'car1' : 'car2'
//     var trim = select.val()

//     var parent = $(this).parent()
//     var year = parent.children('.compare-select-year').children('select').val()
//     var make = parent.children('.compare-select-make').children('select').val()
//     var model = parent.children('.compare-select-model').children('select').val()

//     $.get(`/car/build/compare/stats?trim=${ trim }&make=${ make }&year=${ year }&model=${ model }`, function(data) {
//         if(data.ok) {
//             console.log(data)
//         }
//     })

//     comparingItems[ key ].trim = trim
// }

$(document).ready(function() {
    compareForm.submit(onCompareFormSubmit)
    setDefaultValues()

    $('.saved-compare-select').on('change', onSavedCompareChange)

    $(compareYear).on('change', onYearChange)
    $(compareMake).on('change', onMakeChange)
    $(compareModel).on('change', onModelChange)
    // $(compareTrim).on('change', onTrimChange)
})

comparingItems = Object.assign({}, comparingItems, setAllData())
