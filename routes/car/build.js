const Router = require('express').Router
const fs = require('fs')
const path = require('path')

const jydEmailDefaults = require('../../mailConfig').keys.jydDefaults
const templates = require('../../email-templates')
const sendEmail = require('../../mailer').sendEmail
const models = require('../../models')

const convertToPDF = templates.convertToPDFBuffer
const buildAppTemplate = templates.buildApp
const BuiltCar = models.BuiltCar
const Car = models.Car

const route = Router()
const buildCar = Router()
const file = fs.readFileSync(path.resolve(__dirname, './cars-file-2.json'), 'utf8')

const cars = JSON.parse(file)

const getCurrentDate = () => {
    const today = new Date()
    const dd = today.getDate()
    const mm = today.getMonth()+1 //January is 0!
    const yyyy = today.getFullYear()

    today = ('0'+mm).slice(-2) + '-' + ('0'+dd).slice(-2) + '-' + yyyy

    return today
}

const getCarsByModel = (year, make, model) => {
    const modelsByMake = cars[ year ][ make ]

    return modelsByMake.filter((car) => car.Model === model)
}

const getOptions = options => {
    const [
        year, make, model, msrp, dest, invoice, trim, optionsPrice, ...selectedOptions
    ] = options

    return { year, make, model, invoice, dest, msrp, trim, optionsPrice, selectedOptions }
}

const ascendingSort = (a,b) => a.toLowerCase().localeCompare(b.toLowerCase())

route.get('/', (req, res) => {
    const query = req.query
    const year = query.year
    const make = query.make
    const model = query.model

    if(year && !make && !model) {
        const makesByYear = cars[ year ]
        const makes = Object.keys(makesByYear).sort(ascendingSort)

        return res.send({ makes })
    } else if(year && make) {
        const modelsByMake = cars[ year ][ make ]
        const modelsSet = new Set([])

        modelsByMake.forEach(car => modelsSet.add(car.Model))

        const models = Array.from(modelsSet).sort(ascendingSort)

        if(!model) return res.send({ models })

        // It never gets here... This is more an API call

        const modelsSelected = getCarsByModel(year, make, model)

        const content = { make, year, model, carOptions : [].concat(modelsSelected) }

        return res.redirect('/trim')
    }

    return res.redirect(301, '/')
})

route.get('/trim', (req, res) => {
    const user = req.user
    const query = req.query
    const options = query.options.split('|')

    const { year, make, model } = getOptions(options)

    if(!query.build) return res.redirect('/')

    const modelsByMake = cars[ year ][ make ]

    const modelsSelected = getCarsByModel(year, make, model)

    const trims = modelsSelected.reduce((p, n) => {
        if(p[ n.Trim ]) return { ...p, [ n.Trim ] : [].concat(p[ n.Trim ], n) }

        return { ...p, [ n.Trim ] : [ n ] }
    }, {})

    // console.log(trims)

    return res.render('build-car/trim', { trims, make, model, year, user, isAuth : req.isAuthenticated() })
})

route.get('/options', (req, res) => {
    const user = req.user
    const query = req.query
    const options = query.options.split('|')

    const { year, make, model, msrp, dest, invoice, trim } = getOptions(options)

    const modelsSelected = getCarsByModel(year, make, model)
    const modelSelected = modelsSelected.filter(model => model.Trim === trim).pop()

    const data = {
        year,
        make,
        model,
        invoice,
        dest,
        msrp,
        trim,
        img : modelSelected.Photo,
        options : modelSelected.Options,
        hiddenOpt : query.options,
        user,
        isAuth : req.isAuthenticated()
    }

    return res.render('build-car/options', data)
})

route.get('/review', (req, res) => {
    const query = req.query
    const options = getOptions(query.options.split('|'))
    const selectedOptions = options.selectedOptions
    const user = req.user

    const { year, make, model } = options

    const img = getCarsByModel(year, make, model).filter(c => c.Model === model)[ 0 ].Photo

    const opts = {}

    selectedOptions.forEach(option => {
        const item = option.match(/\{(.*)\}(.*)/)
        const key = item[ 1 ].replace(/_/g, ' ')
        const desc = item[ 2 ]

        if(opts[ key ]) return opts[ key ].push(desc)
        return opts[ key ] = [ desc ]
    })

    options.selectedOptions = opts
    options.hiddenOpt = query.options
    options.img = img

    return res.render('build-car/review', { ...options, isReview : true, user, isAuth : req.isAuthenticated() })
})

const saveBuiltInDB = data => {
    const { firstname, lastname, phone, email, hasLease, hasTradeIn, isVeteran, isGraduate, downPayment, url, ...options } = data

    new BuiltCar({
        firstname,
        lastname,
        phone,
        email,
        hasLease,
        hasTradeIn,
        isGraduate,
        isVeteran,
        downPayment,
        options,
        url,
    }).save((err, doc) => {
        if(err) return console.log(err)

        return console.log(doc)
    })
}

route.get('/user', async (req, res) => {
    const { email } = req.user
    const { skip = 0, limit = 10 } = req.query

    /*
    get the ids stored inside the car model likedBy Array
    then check if the req.user.id is  == to queried id

    */
    email.toLowerCase()
    try {
        // console.log(`email goes here: ${email}`)
        const blds = await BuiltCar.find({ email }).skip(skip).limit(limit).lean()
        const likedCars = await Car.find({ likedBy: req.user._id }).lean()

        const builds = blds.map(b => ({...b, imgurl : cars[ b.options.year ][ b.options.make ].filter(n => ((n.Trim === b.options.trim) && n.Model === b.options.model))[ 0 ].Photo }))

        // console.log(builds)

        return res.send({ ok : true, builds, likedCars, user: req.user })
    } catch (e) {
        console.log(e)
    }

    return res.send({ ok : false })
})

route.post('/new', (req, res) => {
    const body = req.body
    const url = '/car/build/review?options=' + body.options

    const emailData = {}

    if((!body.firstname || !body.lastname || !body.phone || !body.email) && req.isAuthenticated()) {
        body.firstname = req.user.name.split(' ')[ 0 ]
        body.lastname = req.user.name.split(' ')[ 1 ]
        body.phone = req.user.phoneNumber
        body.email = req.user.email
    }

    const options = getOptions(body.options.split('|'))
    const data = { ...body, ...options, url }

    // console.log(data)

    const name = `${ data.firstname } ${ data.lastname }`
    const htmlBody = buildAppTemplate(data)

    emailData.from = `'${ name }' <${ data.email }>`
    emailData.to = jydEmailDefaults.to
    emailData.bcc = jydEmailDefaults.bcc
    emailData.subject = `Requesting a Quote for a ${ data.year } ${ data.make }${ data.model }`
    emailData.html = htmlBody

    saveBuiltInDB(data)

    sendEmail(emailData, err => {
        if(err) return console.log(err)

        return console.log('Email sent!')
    })

    return res.end('ok')
})

route.get('/trending', (req, res) => {
    // Car.aggregate([
    BuiltCar.find({}).sort({ createdBy : -1 }).limit(6).then(docs => {
        const builts = docs.map(car => car.options )

        // console.log(cars)

        return res.send({ ok : true, builts })

    }).catch(err => {
        // console.log(err)

        return res.send({ ok : false })
    })
})

route.get('/all', async (req, res) => {
    // console.log('right here....')
    try {
        const builds = await BuiltCar.find({
            $or : [  {reviewed : false }, { reviewed : { $exists : false }} ]
        }).sort({ createdBy : -1 })

        return res.send({ ok : true, builds })

    } catch (e) {
        console.log(e)
    }

    return res.send({ ok : false })
})

route.get('/compare/stats', async (req, res) => {
    const { trim = 'none', make = 'none', year = 'none', model = 'none'} = req.query

    try {
        const carsInYears = cars[ year ]

        if(!carsInYears) return res.send({ ok : false })

        const selections = carsInYears[ make ]

        if(selections) {
            const car = selections.find(t => t.Model === model && t.Trim === trim)

            if(car) {
                // console.log(`Car => ${JSON.stringify(car, null, 3)}`)

                return res.send({ ok : true, car })
            }
        }
    } catch(e) {
        console.log(e)
    }

    return res.send({ ok : false })
})

route.get('/compare/stats/img', async (req, res) => {
    const { make = 'none', year = 'none', model = 'none'} = req.query

    try {
        const carsInYears = cars[ year ]

        if(!carsInYears) return res.send({ ok : false })

        const selections = carsInYears[ make ]

        if(selections) {
            const photo = selections.find(t => new RegExp(t.Model,'i').test(model)).Photo

            if(photo) {
                console.log(`Car => ${photo}`)

                return res.send({ ok : true, photo })
            }
        }
    } catch(e) {
        console.log(e)
    }

    return res.send({ ok : false })
})

route.get('/compare/saved', async (req, res) => {
    if(!req.isAuthenticated()) return res.send({ ok : false })

    const { email, _id } = req.user

    try {
        const builds = await BuiltCar.find({ email })
        const selected = builds.map(c => c.toObject())
                                .map(({ options, url }) => ({ year : options.year, make : options.make, model : options.model, trim : options.trim, url }))
                                .map(JSON.stringify)

        const buildsX = [ ...new Set(selected) ].map(JSON.parse)
                        .map(({ make, model, year, trim, url }) => ({ make, model, year, trim, img : cars[ year ][ make ].find(t => {
                            return t.Trim === trim
                        }).Photo }))

        return res.send({ ok : true, builds : buildsX })
    } catch (e) {
        console.log(e)
    }

    return res.send({ ok : false })
})

// console.log(cars[2018]['Acura'].find(t => t.Trim === 'SH-AWD V6 A-Spec Red' ).Photo)//.find(t => t.Trim === 'MDX')


buildCar.use('/build', route)

module.exports = buildCar
