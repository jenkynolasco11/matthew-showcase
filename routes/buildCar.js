var Router = require('express').Router
var fs = require('fs')
var path = require('path')

var route = Router()
var buildCar = Router()
var file = fs.readFileSync(path.resolve(__dirname, '../cars-file.json'), 'utf8')

var cars = JSON.parse(file)

route.get('/', function(req, res) {
    var query = req.query
    var year = query.year
    var make = query.make
    var model = query.model

    if(year && !make && !model) {
        var makesByYear = cars[ year ]
        var makes = Object.keys(makesByYear)

        return res.send({ makes : [].concat(makes) })
    } else if(year && make) {
        var modelsByMake = cars[ year ][ make ]
        var modelsSet = new Set([])

        modelsByMake.forEach(function(car) {
            modelsSet.add(car.Model)
        })

        var models = Array.from(modelsSet)

        if(!model) return res.send({ models : [].concat(models) })

        // var modelsSelected = modelsByMake.filter(function(car) {
        //     return car.Model === model
        // })

        // return res.redirect('admin', { make : make, year : year, model : model, carOptions : [].concat(modelsSelected) })
        // return res.redirect(301, '/build-car-options?year=' + year + '&make=' + make + '&model=' + model)
        return res.redirect('/admin')
    }
})

route.get('/options', function(req, res) {
    var query = req.query
    var year = query.year
    var make = query.make
    var model = query.model

    console.log(query)

    return res.send('ok')
})


buildCar.use('/build-car', route)

module.exports = buildCar
