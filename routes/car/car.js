const Router = require('express').Router
const models = require('../../models')

const Builds = models.BuiltCar
const Car = models.Car
const ReferenceCar = models.ReferenceCar
const Meta = models.Meta
const fs = require('fs')
const path = require('path')

const imgRoute = '../../static/image-uploads'

const route = Router()
const car = Router()

const file = fs.readFileSync(path.resolve(__dirname, './cars-file-2.json'), 'utf8')
const cars = JSON.parse(file)

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

route.post('/autofill', async (req, res) => {
    const query = {
        model:  new RegExp(req.body.model, 'i') ,
        make: new RegExp(req.body.make, 'i'),
        year: new RegExp(req.body.year, 'i')
    }

    const car = await ReferenceCar.find({ modelMakeId : query.make, modelYear: query.year, model: query.model, modelSoldInUS: true }).lean();
    res.send(car);
});

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

route.put('/:id/like/:user', async (req, res) => {
    const { id, user } = req.params
    // console.log('liked the car!')
    // console.log(user);
    const criteria = {}


    if(id.match(/^[0-9a-fA-F]{24}$/)) criteria._id = id
    else criteria.id = id

    try {
        const car = await Car.findOne(criteria)

        if(!car.likedBy) {
            await Car.findByIdAndUpdate(car._id, { likedBy : [ user ] })

        } else {
            const pullOrPush = car.likedBy.includes(user) ? '$pull' : '$push'

            await Car.findByIdAndUpdate(car._id, { [ pullOrPush ] : { likedBy : user }})
        }

        // console.log(user)
        return res.send({ ok : true })
    } catch (e) {
        console.log(e)
    }

    return res.send({ ok : false })
})

route.get('/compare/saved', async (req, res) => {
    if(!req.isAuthenticated()) return res.send({ ok : false })

    const { email, _id : likedBy } = req.user

    try {
        const cars = await Car.find({ /*likedBy*/ }, { make : 1, year : 1, model : 1, imgs : 1 })
        const selected = cars
                            .map(c => c.toObject())
                            .map(({ _id, year, make, model, imgs }) => ({ _id, year, make, model, img : imgs.find(i => i.main).src }))

        return res.send({ ok : true, cars : selected })
    } catch (e) {
        console.log(e)
    }

    return res.send({ ok : false })
})

route.get('/compare/stored-stats', async (req, res) => {
    const { year, make, model, trim } = req.query

    const query = {}
    const projection = { trim : 1, year : 1, model : 1, make : 1, _id : 0 }

    if(year && year !== 'none') query.year = year
    if(make && make !== 'none') query.make = make
    if(model && model !== 'none') query.model = model
    if(trim && trim !== 'none') query.trim = trim

    try {
        const cars = await ReferenceCar.find(query, trim && trim !== 'none' ? projection : {}).lean()

        // console.log(cars)

        return res.send({ ok : true, cars })
    } catch (e) {
        console.log(e)
    }

    return res.send({ ok : false })
})

route.get('/compare/stats', async (req, res) => {
    const {
        get = 'year',
        year = 'none',
        make = 'none',
        model = 'none',
        trim = 'none'
    } = req.query

    const query = {}

    if(year !== 'none') query.modelYear = year
    if(make !== 'none') query.modelMakeId = make
    if(model !== 'none') query.model = model
    if(trim !== 'none') query.modelTrim = trim

    try {
        // const cars = await ReferenceCar.find(query)
        const data = await ReferenceCar.distinct(get, query)

        return res.send({ ok : true, data })
    } catch (e) {
        console.log(e)
    }

    return res.send({ ok : false })
})

route.get('/compare/results', async (req, res) => {
    if(!req.isAuthenticated()) return res.redirect('/')

    const user = req.user

    const { car1, car2 } = req.query

    const [ year1, make1, model1 /*, trim1*/ ] = car1.split(',')
    const [ year2, make2, model2 /*, trim2*/ ] = car2.split(',')

    const query1 = { model : model1, modelMakeDisplay : make1, modelYear : year1 }
    const query2 = { model : model2, modelMakeDisplay : make2, modelYear : year2 }

    try {
        const car1Stats = await ReferenceCar.aggregate([
            { $match : query1 }
        ])
        const car2Stats = await ReferenceCar.aggregate([
            { $match : query2 }
        ])

        // console.log(car1Stats[ 0 ])
        // console.log(car2Stats[ 0 ])
        const c1 = car1Stats[ 0 ]
        const c2 = car2Stats[ 0 ]

        const cars1 = cars[ year1 ][ make1 ]
        const cars2 = cars[ year2 ][ make2 ]

        if(cars1.length === 0 || cars2.length === 0) return res.redirect('/dashboard')
        if(!c1 || !c2) return res.redirect('/dashboard')

        const prices1 = []
        const prices2 = []
        let img1 = '/assets/images/no-car-selected.png'
        let img2 = '/assets/images/no-car-selected.png'

        cars1.forEach(c => {
            prices1.push(+c.MSRP.replace(/\D/,''))
            if(new RegExp(c.Model.split(' ')[0].toLowerCase(), 'i').test(model1.toLowerCase())) img1 = c.Photo
        })
        cars2.forEach(c => {
            prices2.push(+c.MSRP.replace(/\D/,''))
            if(new RegExp(c.Model.split(' ')[0].toLowerCase(), 'i').test(model2.toLowerCase())) img2 = c.Photo
        })

        const maxPrice1 = Math.max(...prices1)
        const maxPrice2 = Math.max(...prices2)
        const minPrice1 = Math.min(...prices1)
        const minPrice2 = Math.min(...prices2)

        c1.minPrice = (''+minPrice1).replace(/(\d)(?=(\d{3})+$)/g, '$1,')
        c2.minPrice = (''+minPrice2).replace(/(\d)(?=(\d{3})+$)/g, '$1,')
        c1.maxPrice = (''+maxPrice1).replace(/(\d)(?=(\d{3})+$)/g, '$1,')
        c2.maxPrice = (''+maxPrice2).replace(/(\d)(?=(\d{3})+$)/g, '$1,')
        c1.img = img1
        c2.img = img2

        return res.render('comparison', { c1, c2, isAuth : req.isAuthenticated(), user })
        // return res.send({ ok : true })
    } catch (e) {
        console.log(e)
    }
})
//#endregion

car.use('/', route)

module.exports = car
