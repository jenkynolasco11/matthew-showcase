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
const file = fs.readFileSync(path.resolve(__dirname, './cars-file.json'), 'utf8')

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

    return res.render('build-car/trim', { trims, make, model, year })
})

route.get('/options', (req, res) => {
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
        options : modelSelected.Options,
        hiddenOpt : query.options
    }

    return res.render('build-car/options', data)
})

route.get('/review', (req, res) => {
    const query = req.query
    const options = getOptions(query.options.split('|'))
    const selectedOptions = options.selectedOptions

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

    return res.render('build-car/review', options)
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

const extractPath = req => {
    // Escaping user input to be treated as a literal
    // string within a regular expression accomplished by
    // simple replacement
    const escapeRegExp = str => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1')

    // Replace utility function
    const replaceAll = (str, find, replace) => str.replace(new RegExp(escapeRegExp(find), 'g'), replace)

    return replaceAll(req.get('referer'), req.get('origin'), '');
}

route.post('/new', (req, res) => {
    const body = req.body
    const url = extractPath(req)

    const emailData = {}

    const options = getOptions(body.options.split('|'))
    const data = { ...body, ...options, url }

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
    BuiltCar.aggregate([
        { $sample : { size : 1 }}
    ]).then(docs => {
        const builts = docs.map(car => car.options )

        console.log(cars)

        return res.send({ ok : true, builts })

    }).catch(err => {
        // console.log(err)

        return res.send({ ok : false })
    })
})

route.get('/all', (req, res) => {
    BuiltCar.find({
        $or : [  {reviewed : false }, { reviewed : { $exists : false }} ]
    }).then(builds => {
        return res.send({ ok : true, builds })
    })
    .catch(err => {
        console.log(err)

        return res.send({ ok : false })
    })
})

buildCar.use('/build', route)

module.exports = buildCar
