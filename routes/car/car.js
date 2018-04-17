const Router = require('express').Router
const models = require('../../models')

const Car = models.Car
const Meta = models.Meta
const fs = require('fs')
const path = require('path')

const imgRoute = '../../static/image-uploads'

const route = Router()
const car = Router()

//#region Aux Functions
const extractImages = images => {
    const imgs = Object.keys(images).map(key => {
        const img = images[ key ]
        const newImg = {}

        fs.writeFile(
            path.resolve(__dirname, imgRoute, img.name),
            img.src.split(/data:image\/(png|jpg|jpeg);base64,/i).pop(),
            'base64',
            err => {
                if(err) console.log(err)
                console.log('Finished creating file for ' + img.name)
        })

        newImg.src = `/image-uploads/${ img.name }`
        newImg.name = img.name
        newImg.main = img.main

        return newImg
    })

    // If there is no main, I'll take the first one
    if(!imgs.some(o => o.main)) imgs[ 0 ].main = true

    return imgs
}

const getAllCars = cb => {
    const projection = { _id : 0, year: 1, make : 1, model : 1, bodyType : 1, outColor : 1, price : 1, status : 1 }

    Car.find({}, projection, cb)
}

const createNewID = cb => {
    Meta.findOne({}, (err, meta) => {
        if(err) {
            console.log('There is an error -1')

            return cb(new Error(`Uh oh... ${ err.msg }`))
        }

        const lastId = meta.lastCarId++
        const d = new Date()

        const lastCarId = (
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
route.get('/all', (req, res) => {
    try {
        Car.find({}, (err, docs) => {
            if(err) return res.status(200).send({ ok : false })

            const cars = docs.map(doc => {
                const car = doc._doc

                car.price = (''+car.price).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
                car.msrp = (''+car.msrp).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")

                return { ...car }
            })


            return res.status(200).send({ ok : true, cars })
        })
    } catch (e) {
        console.log(e)

        return res.status(200).send({ ok : false, cars : [] })
    }
})

route.get('/featured', (req, res) => {
    try {
        Car.find({ isFeatured : true }, (err, docs) => {
            if(err) return res.status(200).send({ ok : false })

            const cars = docs.map(doc => {
                const car = doc._doc

                car.price = (''+car.price).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
                car.msrp = (''+car.msrp).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")

                return { ...car }
            })


            return res.status(200).send({ ok : true, cars })
        })
    } catch (e) {
        console.log(e)

        return res.status(200).send({ ok : false, cars : [] })
    }
})

route.get('/edit/:id', (req, res) => {
    const { id } = req.params

    try {
        Car.findOne({ id : id }, (err, c) => {
            if(c) {
                const car = c._doc
                const description = car.description.join('\n')
                const extraFeatures = car.extraFeatures.join('\n')
                const imgs = car.imgs.reduce((prev, img) => {
                    const newObj = {}
                    newObj.src = img.src
                    newObj.main = img.main
                    newObj.name = img.name

                    prev[ img.name ] = newObj

                    return prev
                }, {})

                const newState = {
                    description : description,
                    extraFeatures : extraFeatures,
                    imgs : imgs
                }

                const newEdit = { ...car, ...newState }

                return res.status(200).send({ ok : true, car : newEdit })
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

// TODO: Refactor this together with /edit route
route.post('/new', (req, res) => {
    const { body } = req

    const imgs = extractImages(body.imgs)
    const features = body.extraFeatures.split('\n').filter(item => item.length)
    const description = body.description.split('\n').filter(item => item.length)
    const price = Number(body.price.replace(/[^0-9.]/g,'')) || 0
    const newCar = { ...body, price : +price, imgs, extraFeatures : features }

    try {
        createNewID((err, id) => {
            if(err) {
                console.log('There is an error 0')
                console.log(err)

                return res.status(200).send({ ok : false, car : [] })
            }

            newCar.id = id

            new Car(newCar)
            .save((err, doc) => {
                if(err) {
                    console.log('There is an error 1')
                    console.log(err)

                    return res.status(200).send({ ok : false, car : [] })
                }

                getAllCars((_, cars) => {
                    return res.status(200).send({ ok : !!err, cars })
                })
            })
        })
    } catch (e) {
        console.log(e)

        return res.status(200).send({ ok : false, cars : [] })
    }
})

route.put('/edit/:id', (req, res) => {
    const { id } = req.params
    const { body } = req

    const imgs = extractImages(body.imgs)
    const features = body.extraFeatures.split('\n')
    const description = body.description.split('\n')
    const editCar = { ...body, imgs, extraFeatures : features }

    try {
        Car.findOneAndUpdate({ id }, { $set : editCar }, (err, doc) => {
            if(err) return res.status(200).send({ ok : false })

            getAllCars((_, cars) => {
                return res.status(200).send({ ok : !!err, cars })
            })
        })
    } catch (e) {
        console.log(e)

        return res.status(200).send({ ok : false, cars : [] })
    }
})

route.delete('/delete/:id', (req, res) => {
    const { id } = req.params

    try {
        Car.findOneAndRemove({ id }, (err, rs) => {
            if(err) {
                console.log(err)

                return res.status(200).send({ ok : false })
            }

            getAllCars((err, cars) => {
                return res.status(200).send({ ok : !!err, cars })
            })
        })
    } catch (e) {
        console.log(e)

        return res.status(200).send({ ok : false, cars : [] })
    }
})
//#endregion

car.use('/', route)

module.exports = car
