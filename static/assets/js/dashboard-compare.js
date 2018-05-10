var compareForm = $('#user-compare form')
var itemCompareA = $('.comparing-box-a')
var itemCompareB = $('.comparing-box-b')
var alreadyStoredCars = {}

function onCompareFormSubmit(e) {
    e.preventDefault()
}

function onSelectChange(e) {
    console.log($(this).val())
}

$(document).ready(function() {
    // var alreadyClear = false
    compareForm.submit(onCompareFormSubmit)

    function addToOptGroup(label, options, select, appendOrPrepend) {
        var optgroup = $('<optgroup label="' + label + '"></optgroup>')
        var options = options.forEach(function(o, i) {
            optgroup.append($(`
                <option value="${o.year}|${o.make}|${o.model}">${o.year} ${o.make} ${o.model}</option>
            `))
        })

        $(select)[ appendOrPrepend ]($(optgroup))
    }

    $.get('/car/saved/compare', function(resA) {
        if(resA.ok) {
            var cars = resA.cars

            var select = $('.compare-select-saved select')

            // if(!alreadyClear) $(select).html('')
            // alreadyClear = true

            addToOptGroup('Lease Specials', cars, select, 'append')
        }
    })

    $.get('/car/build/saved/compare', function(resB) {
        if(resB.ok) {
            var builds = resB.builds

            var select = $('.compare-select-saved select')

            // if(!alreadyClear) $(select).html('')
            // alreadyClear = true

            addToOptGroup('Saved Builds', builds, select, 'append')
        }
    })

    // $(itemCompare)
})
