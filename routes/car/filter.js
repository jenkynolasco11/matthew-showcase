const Router = require('express').Router

const Car = require('../../models').Car

const route = Router()
const filter = Router()

filter.get('/make/models', (req, res) => {
    const make = req.query.make || null

    if(make) {
        Car.aggregate([
            { $match : { make : make }},
            { $group :
                {
                    _id : '$model',
                    maxYear : { $max : '$year' },
                    minYear : { $min : '$year' }
                }
            },
        ], (err, data) => {

            // Comment this line to return models and years
            const models = data.map(item => item._id).sort((a,b) => a.localeCompare(b))

            // console.log('Strings sorted => ', models)

            return res.send(models)
        })
    }
})

filter.get('/all', (req, res) => {
    const { sortBy, limit, skip, make, model, years, prices, fuel, transmission = '', bodyType } = req.query
    const [ year1, year2 ] = years.split(',')//.sort()
    const [ price1, price2 ] = prices.split(',')//.sort()

    const testItem = item => {
        return /^all/i.test(item)
    }

    const conditions = {
        year : { $gte : Number(year1), $lte : Number(year2) },
        price : { $gte : Number(price1), $lte : Number(price2) }
    }

    if(!testItem(fuel)) conditions.fuel = fuel
    if(!testItem(bodyType)) conditions.bodyType = bodyType
    if(!testItem(make)) conditions.make = make
    if(!testItem(model)) conditions.model = model
    if(transmission) conditions.transmission = { $in : transmission.split(',') }

    // console.log(JSON.stringify(conditions, null, 3))
    // // console.log(limit)
    // // console.log(skip)
    // // console.log(sortBy)

    Car.find(conditions)
        .skip(+skip * limit || 0)
        .limit(+limit || 10)
        .sort({ make : sortBy || '-1', model : sortBy || '-1' })
        .exec()
        .then(docs => {
            return Promise.all([ docs, Car.count(conditions) ])
        })
        .then(vals => {
            const [ cars, count ] = vals

            return res.send({ ok : true, cars, count })
        })
        .catch(err => {
            console.log(err)

            return res.send('error')
        })
})

route.use('/filter', filter)

module.exports = route
