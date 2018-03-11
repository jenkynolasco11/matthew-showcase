var Router = require('express').Router
var fs = require('fs')
var path = require('path')

var route = Router()
var buildCar = Router()
var file = fs.readFileSync(path.resolve(__dirname, '../cars-file.json'), 'utf8')

var cars = JSON.parse(file)

function getCarsByModel(year, make, model) {
    var modelsByMake = cars[ year ][ make ]

    return modelsByMake.filter(function(car) {
        return car.Model === model
    })
}

function getOptions(options) {
    var [ year, make, model, msrp, dest, invoice, trim, optionsPrice, ...selectedOptions ] = options

    return {
        year : year,
        make : make,
        model : model,
        invoice : invoice,
        dest : dest,
        msrp : msrp,
        trim : trim,
        optionsPrice : optionsPrice,
        selectedOptions : selectedOptions
    }
}

route.get('/', function(req, res) {
    var query = req.query
    var year = query.year
    var make = query.make
    var model = query.model

    if(year && !make && !model) {
        var makesByYear = cars[ year ]
        var makes = Object.keys(makesByYear).sort(function(a,b) {
            return a.toLowerCase().localeCompare(b.toLowerCase())
        })

        return res.send({ makes : [].concat(makes) })
    } else if(year && make) {
        var modelsByMake = cars[ year ][ make ]
        var modelsSet = new Set([])

        modelsByMake.forEach(function(car) {
            modelsSet.add(car.Model)
        })

        var models = Array.from(modelsSet).sort(function(a,b) {
            return a.toLowerCase().localeCompare(b.toLowerCase())
        })

        if(!model) return res.send({ models : [].concat(models) })

        // It never gets here... This is more an API call

        var modelsSelected = getCarsByModel(year, make, model)

        var content = { make : make, year : year, model : model, carOptions : [].concat(modelsSelected) }

        return res.redirect('/trim')
    }

    return res.redirect(301, '/')
})

route.get('/trim', function(req, res) {
    var query = req.query
    var options = query.options.split('|')

    var { year, make, model } = getOptions(options)

    if(!query.build) return res.redirect('/')

    var modelsByMake = cars[ year ][ make ]

    var modelsSelected = getCarsByModel(year, make, model)

    var trims = modelsSelected.reduce(function(p, n) {
        if(p[ n.Trim ]) return { ...p, [ n.Trim ] : [].concat(p[ n.Trim ], n) }

        return { ...p, [ n.Trim ] : [ n ] }
    }, {})

    return res.render('build-car/trim', { trims : trims, make : make, model : model, year : year })
})

route.get('/options', function(req, res) {
    var query = req.query
    var options = query.options.split('|')

    var { year, make, model, msrp, dest, invoice, trim } = getOptions(options)

    var modelsSelected = getCarsByModel(year, make, model)
    var modelSelected = modelsSelected.filter(function(model) { return model.Trim === trim }).pop()

    var data = {
        year : year,
        make : make,
        model : model,
        invoice : invoice,
        dest : dest,
        msrp : msrp,
        trim : trim,
        options : modelSelected.Options,
        hiddenOpt : query.options
    }

    return res.render('build-car/options', data)
})

route.get('/review', function(req, res) {
    var query = req.query
    var options = getOptions(query.options.split('|'))
    var selectedOptions = options.selectedOptions

    var opts = {}

    selectedOptions.forEach(function(option) {
        var item = option.match(/\{(.*)\}(.*)/)
        var key = item[ 1 ].replace(/_/g, ' ')
        var desc = item[ 2 ]

        if(opts[ key ]) return opts[ key ].push(desc)
        return opts[ key ] = [ desc ]
    })

    options.selectedOptions = opts
    options.hiddenOpt = query.options

    return res.render('build-car/review', options)
})

route.post('/review', function(req, res) {
    var body = req.body

    return res.end('hi')
})



buildCar.use('/build-car', route)

module.exports = buildCar
