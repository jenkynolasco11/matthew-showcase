var Router = require('express').Router
var models = require('../models')
var Car = models.Car
var Meta = models.Meta
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

var createNewID = function(cb) {
    Meta.findOne({}, function(err, meta) {

        if(err) {
            console.log('There is an error -1')
            return cb(new Error('Uh oh...' + err.msg))
        }

        var lastId = meta.lastCarId++
        var d = new Date()

        var lastCarId = (
            'JYD-' +
            ('0' + d.getMonth()).slice(-2) +
            ('0' + d.getDate()).slice(-2) +
            ('0' + d.getFullYear()).slice(-2) +
            (('00000'+ lastId).slice(-5))
        )

        meta.save()

        return cb(null,lastCarId)
    })
}
//#endregion

//#region Routes
route.get('/all', function(req, res) {
    try {
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
    } catch (e) {
        console.log(e)
        return res.status(200).send({ ok : false, cars : [] })
    }
})

route.get('/featured', function(req, res) {
    try {
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
    } catch (e) {
        console.log(e)
        return res.status(200).send({ ok : false, cars : [] })
    }
})

route.get('/edit/:id', function(req, res) {
    var id = req.params.id

    try {
        Car.findOne({ id : id }, function(err, c) {
            if(c) {
                var car = c._doc
                var description = car.description.join('\n')
                var extraFeatures = car.extraFeatures.join('\n')
                var imgs = car.imgs.reduce(function(prev, img) {
                    var newObj = {}
                    newObj.src = img.src
                    newObj.main = img.main
                    newObj.name = img.name

                    prev[ img.name ] = newObj

                    return prev
                }, {})

                var newState = {
                    description : description,
                    extraFeatures : extraFeatures,
                    imgs : imgs
                }

                car = Object.assign({}, car, newState)

                return res.status(200).send({ ok : true, car : car })
            }
            else if(err) console.log(err)
            else console.log('Something weird happened....')

            return res.status(200).send({ ok : false })
        })
    } catch (e) {
        console.log(e)
        return res.status(200).send({ ok : false, car : {} })
    }
})

route.post('/new', function(req, res) {
    var body = req.body

    var imgs = extractImages(body.imgs)
    var features = body.extraFeatures.split('\n')
    var description = body.description.split('\n')
    var price = body.price.replace(/\D/g,'')
    var newCar = Object.assign({}, body, { price : +price }, { imgs : imgs }, { extraFeatures : features })

    try {
        createNewID(function(err, id) {
            if(err) {
                console.log('There is an error 0')
                console.log(err)
                return res.status(200).send({ ok : false, car : [] })
            }

            newCar.id = id
            // console.log('Right here.... 1')
            // console.log(newCar)

            new Car(newCar)
            .save(function(err, doc) {
                if(err) {
                    console.log('There is an error 1')
                    console.log(err)
                    return res.status(200).send({ ok : false, car : [] })
                }

                // console.log('Right here.... 2')
                // console.log(doc)

                getAllCars(function(_, cars) {
                    return res.status(200).send({ ok : !!err, cars : [].concat(cars) })
                })
            })
    })
    } catch (e) {
        console.log(e)
        return res.status(200).send({ ok : false, cars : [] })
    }
})

route.put('/edit/:id', function(req, res) {
    var id = req.params.id
    var body = req.body

    var imgs = extractImages(body.imgs)
    var features = body.extraFeatures.split('\n')
    var description = body.description.split('\n')
    var editCar = Object.assign({}, body, { imgs : imgs }, { extraFeatures : features })

    try {
        Car.findOneAndUpdate({ id : id }, { $set : editCar }, function(err, doc) {
            if(err) return res.status(200).send({ ok : false })

            getAllCars(function(_, cars) {
                return res.status(200).send({ ok : !!err, cars : [].concat(cars) })
            })
        })
    } catch (e) {
        console.log(e)
        return res.status(200).send({ ok : false, cars : [] })
    }
})

route.delete('/delete/:id', function(req, res) {
    var id = req.params.id

    try {
        Car.findOneAndRemove({ id : id }, function(err, rs) {
            if(err) {
                console.log(err)
                return res.status(200).send({ ok : false })
            }

            getAllCars(function(err, cars) {
                return res.status(200).send({ ok : !!err, cars : [].concat(cars)  })
            })
        })
    } catch (e) {
        console.log(e)
        return res.status(200).send({ ok : false, cars : [] })
    }
})
//#endregion

car.use('/car', route)

module.exports = car
