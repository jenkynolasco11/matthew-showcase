var Router = require('express').Router
var Car = require('../models').Car
var fs = require('fs')
var path = require('path')

var imgRoute = '../static/image-uploads'

var route = Router()
var car = Router()

//#region Aux Functions
var extractImages = function(images) {
    var imgs = Object.keys(images).map(function(key) {
        var img = images[ key ]
        console.log(img.name)
        var newImg = {}

        fs.writeFile(
            path.resolve(__dirname, imgRoute, img.name),
            img.src.split(/data:image\/(png|jpg|jpeg);base64,/i).pop(),
            'base64',
            function(err) {
                if(err) console.log(err)
                console.log('Finished creating file for ' + img.name)
        })

        newImg.src = '/image-uploads/' + img.name
        newImg.name = img.name
        newImg.main = img.main

        return newImg
    })

    // If there is no main, I'll take the first one
    if(!imgs.some(function(o) { return o.main })) imgs[ 0 ].main = true

    return imgs
}

var getAllCars = function(cb) {
    var projection = { _id : 0,	year: 1, make : 1, model : 1, bodyType : 1, outColor : 1, price : 1, status : 1 }

    Car.find({}, projection, cb)
}
//#endregion

//#region Routes
route.get('/all', function(req, res) {
    Car.find({}, function(err, docs) {
        if(err) return res.status(200).send({ ok : false })

        var cars = docs.map(function(doc) {
            var car = doc._doc
            car.price = (''+car.price).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
            car.msrp = (''+car.msrp).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")

            return Object.assign({}, car)
        })


        return res.status(200).send({ ok : true, cars : [].concat(cars) })
    })
})

route.get('/featured', function(req, res) {
    Car.find({ isFeatured : true }, function(err, docs) {
        if(err) return res.status(200).send({ ok : false })

        var cars = docs.map(function(doc) {
            var car = doc._doc
            car.price = (''+car.price).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
            car.msrp = (''+car.msrp).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")

            return Object.assign({}, car)
        })


        return res.status(200).send({ ok : true, cars : [].concat(cars) })
    })
})

route.post('/new', function(req, res) {
    var body = req.body

    var imgs = extractImages(body.imgs)
    var features = body.extraFeatures.split('\n')
    var description = body.description.split('\n')
    var newCar = Object.assign({}, body, { imgs : imgs }, { extraFeatures : features })

    console.log(newCar)

    new Car(newCar)
    .save(function(err, doc) {
        if(err) return console.log(err)
        console.log(doc)
        getAllCars(function(_, cars) {
            return res.status(200).send({ ok : !!err, cars : [].concat(cars) })
        })
    })
})

/**TODO: NOT IMPLEMENTED YET */
route.put('/edit', function(req, res) {
    /* */
    return res.status(200).send({ ok : true })
})

/**TODO: NOT IMPLEMENTED YET */
route.delete('/delete/:vin', function(req, res) {
    var vin = req.params.vin

    Car.findOneAndRemove({ vin : vin }, function(err, rs) {
        if(err) {
            console.log(err)
            return res.status(200).send({ ok : false })
        }

        getAllCars(function(err, cars) {
            return res.status(200).send({ ok : !!err, cars : [].concat(cars)  })
        })
    })
})
//#endregion

car.use('/car', route)

module.exports = car
