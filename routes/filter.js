var Router = require('express').Router
var models = require('../models')
var Car = models.Car
// var fs = require('fs')
// var path = require('path')

var route = Router()
var filter = Router()

filter.get('/desc', function(req, res) {
    var make = req.query.make || null

    if(make) {
        // Car.find({ make : make }, console.log)
        Car.aggregate([
            { $match : { make : make }},
            { $group :
                {
                    _id : '$model',
                    maxYear : { $max : '$year' },
                    minYear : { $min : '$year' }
                }
            }
        ], function(err, data) {

            // Comment this line to return models and years
            var models = data.map(function(item) { return item._id })

            console.log(models)
            return res.send(models)

            // return res.send( data )
        })
    }
})

filter.get('/request', function(req, res) {
    const { sortBy, limit, skip, make, model, years, prices, fuel, transmission = '', bodyType } = req.query
    const [ year1, year2 ] = years.split(',').sort()
    const [ price1, price2 ] = prices.split(',').sort()

    function testItem(item) {
        return /^all/i.test(item)
    }

    const conditions = {
        year : { $gte : year1, $lte : year2 },
        price : { $gte : price1, $lte : price2 }
    }

    if(!testItem(fuel)) conditions.fuel = fuel
    if(!testItem(bodyType)) conditions.bodyType = bodyType
    if(!testItem(make)) conditions.make = make
    if(!testItem(model)) conditions.model = model
    if(transmission) conditions.transmission = { $in : transmission.split(',') }

    console.log(JSON.stringify(conditions, null, 3))
    console.log(limit)
    console.log(skip)
    console.log(sortBy)

    Car.find(conditions)
        .skip(+skip || 0)
        .limit(+limit || 10)
        .sort({ make : sortBy || '-1' })
        .exec()
        .then(function(docs) {
            return Promise.all([ docs, Car.count(conditions) ])
        })
        .then(function(vals) {
            var [ cars, count ] = vals

            return res.send({ ok : true, cars : cars, count : count })
        })
        .catch(function(err){
            console.log(err)

            return res.send('error')
        })
})

route.use('/filter', filter)

module.exports = route
