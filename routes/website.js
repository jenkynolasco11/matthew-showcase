const Router = require('express').Router
const jydEmailDefaults = require('../mailConfig').keys.jydDefaults
const sendEmail = require('../mailer').sendEmail
const templates = require('../email-templates')
const models = require('../models')

const sockets = require('../socket.io').sockets
// const IO = require('socket.io')

const Car = models.Car
const BuiltCar = models.BuiltCar
const SellCar = models.SellCar
const Message = models.Message
const CreditApp = models.CreditApp
const DealSubscription = models.DealSubsription
const Refer = models.Refer
const Newsletter = models.Newsletter
const Submission = models.Submission;

const path = require('path')
// const instagram = require('./instagram').getFeed

const route = Router()
const web = Router()

const paths = [
    'sell-car',
    'sell-car-test',
    'credit-app',
    'credit-app-test',
    'contact-us',
    'contact-us-test',
    'admin',
    'details',
    // 'dashboard',
    // 'listing',
    'services',
    'refer-a-friend'
]
const titles = {
    'contact-us': 'Contact Us',
    'credit-app': 'Credit App',
    'admin': 'Admin Panel',
    'details': 'Car Details',
    'sell-car': 'Sell Us Your Car',
    'listing': 'Search',
    'services': 'Services',
    'refer-a-friend' : 'Refer a Friend'
}

const checkIfAuth = (req, res, next) => {
    if(req.isAuthenticated()) return next()

    else return res.send({ ok : false, msg : 'You arent not authorized to access this route' })
}

function getCurrentDate() {
    const today = new Date()
    const dd = today.getDate()
    const mm = today.getMonth()+1 //January is 0!
    const yyyy = today.getFullYear()

    today = ('0'+mm).slice(-2) + '-' + ('0'+dd).slice(-2) + '-' + yyyy

    return today
}

function saveToDatabase(body) {
    const data = { body : {} }

    switch(body.type) {
        case 'Credit App':
            data.body.code = body['Salesman\'s Name']
            data.body.firstname = body['First Name']
            data.body.lastname = body['Last Name']
            data.body.middlename = body['Middle Name']
            data.phoneNumber = body['Day Time Phone']
            data.body.dob = new Date(+body['DOB Year'], +body['DOB Month'] - 1, +body['DOB Day'])
            data.body.ssn = body['SSN']
            data.email = body['email']
            data.body.street = body['Address']
            data.body.city = body['City']
            data.body.state = body['State']
            data.body.zip = body['ZIP Code']
            data.body.homeOwnership = body['Home Type'].toUpperCase()
            data.body.yearsLivingInPlace = body['Years Living There']
            data.body.monthsLivingInPlace = body['Months Living There']
            data.body.monthlyRent = body['Monthly Payment']
            data.body.previousAddress = body['Previous Address']
            data.body.driverLicense = {
                number : body['Driver\'s Licence Number'],
                stateIssued : body['Driver\'s State'],
                expirationDate : new Date(body['Driver\'s License Expiration Date Year'], body['Driver\'s License Expiration Date Month']-1, body['Driver\'s License Expiration Date Day']),
            }
            data.body.employement = {
                employerName : body['Employer\'s Name'],
                employerAddress : body['Employer\'s Address'],
                employerContact : body['Employer\'s Phone'],
                employerYearsAtWork : body['Employee Years'],
                employerMonthsAtWork : body['Employee Months'],
                jobTitle: body['Job Title'],
                montlyIncome : body['Monthly Income'],
            }
            data.body.previousEmployer = body['Previous Employer']
            data.body.agreed = body['agree'] !== '0'
            data.body.reachedOut = false

            const credit = new Submission({ ...data, type: 'credit' }).save((err, doc) => {
                if(err) return console.log(err)

                // return console.log(doc)
            })

            break
        case 'Contact Us':
            const messageData = body;

            messageData.body = {};
            messageData.body.subject = body['subject'];
            messageData.body.message = body['message'];

            const message = new Submission({ ...messageData, type : 'message', read : false }).save((err, doc) => {
                if(err) return console.log(err)

                // return console.log(doc)
            })

            break
        case 'Cash For Cars':
            data.body.firstname = body['First Name']
            data.body.lastname = body['Last Name']
            data.phoneNumber = body.phone
            data.email = body.email
            data.body.condition = body.vCondition
            data.body.mileage = body.vMileage
            data.body.model = body.vModel
            data.body.make = body.vMake
            data.body.year = body.vYear
            data.body.vin = body.VIN

            const sellcar = new Submission({ ...data, type : 'sell' }).save((err, doc) => {
                if(err) return console.log(err)

                // return console.log(doc)
            })

            break
    }

    // console.log(sockets)

    // Let sockets know that there is a new message
    for(let [ socketId ] of sockets) {
        // console.log(socketId)
        sockets[ socketId ].socket.emit('server:new email')
    }
}

function stripData(data, cb) {
    let name = ''
    const emailData = {}

    if (!data.email) return null

    if (data['First Name'] && data['Last Name']) name = `${ data['First Name'] } ${ data['Last Name'] }`
    else if (data.name) name = data.name

    emailData.from = `'${ name }' <${ data.email }>`
    emailData.to = jydEmailDefaults.to
    emailData.bcc = jydEmailDefaults.bcc
    emailData.subject = `${ data.type } - ${ name }`

    const body =
        data.type === 'Credit App' ?
        templates.creditApp(data) :
        data.type === 'Contact Us' ?
        templates.contactUs(name, data.email, data.message, ('subject' in data), ('subject' in data) ? data.subject : data.phone) :
        templates.sellCar(name, data.email, data.phone, data.vYear, data.vMake, data.vModel, data.vMileage, data.VIN, data.vCondition)

    // convertToPDF(body, function(err, stream) {
        // if(err) return null

    emailData.html = body

    saveToDatabase(data)

    // console.log(data)
    // console.log(JSON.stringify(emailData, null, 5))
        // emailData.attachments = [
            // {
                // filename : data.type + ' - ' + name + ' ' + getCurrentDate(),
                // content : stream
            // }
        // ]

    return cb(emailData)
    // }, true)
}

function filterCarData(car) {
    let mainImg = ''
    const imgs = car.imgs.forEach( img => {
        if (img.main) {
            mainImg = img
            return
        }
    })

    if (!mainImg) mainImg = imgs[0]
    car.img = mainImg
    car.price = ('' + car.price).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
    car.msrp = ('' + car.msrp).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")

    return car
}

route.get('/:route', (req, res, next) => {
    const route = req.params.route
    const user = req.isAuthenticated() ? req.user : ''

    // console.log(req.isAuthenticated())
    // console.log(req.user)

    if (route.match(/^service-/)) {
        const view = route.slice(8)

        return res.render('services/' + view, { title: 'JYD - Services', user, isAuth : req.isAuthenticated() })
    } else if (route === 'listing') {
        const data = {}

        Car.distinct('make').then(makes => {
            data.makes = makes.sort((a,b) => a.localeCompare(b))

            return Car.distinct('transmission')
        }).then(trans => {
            data.trans = trans

            return Car.distinct('fuel')
        }).then(fuels => {
            data.fuels = fuels

            return res.render('listing', { ...data, title: 'JYD - Listings', user, isAuth : req.isAuthenticated() })
            // return res.render('listing', data)
        }).catch(console.log)

    } else if (paths.includes(route)) {
        const title = titles[route]

        return res.render(route, { title: `JYD - ${ title }`, user, isAuth : req.isAuthenticated() })
    } else if(route === 'dashboard') {
        console.log(`So this is the Route=> ${route}`)
        // const title = titles[route]

        // console.log(res.isAuthenticated())

        if(!req.isAuthenticated()) return res.redirect('/')

        return res.render('user-dashboard', { title : `Dashboard - ${ user.name }`, user, isAuth : req.isAuthenticated() })
    }

    else return next()
})

// TODO: Check this one out!
route.post('/data', (req, res) => {
    const body = req.body

    stripData(body, data => {
        if (!data) return res.send('ok')

        sendEmail(data, (err, c) => {
            if (err) return console.log(err)

            // TODO: Save in database
            console.log('Email sent!')
        })

        return res.send('ok')
    })

})

route.get('/details/(:id?)', (req, res) => {
    const { id } = req.params
    const user = req.isAuthenticated() ? req.user : ''

    if (!id) return res.render('listing', { ...data, title: 'JYD - Listings', user, isAuth : req.isAuthenticated() })

    Car.findOne({ id }, (err, car) => {
        if (err) return res.status(200).send({ ok: false })

        Car.aggregate([
            // { $match : { bodyType : car.bodyType }},
            {
                $sample: {
                    size: 3
                }
            },
        ]).exec((err, related) => {
            if (err) return res.status(200).send({ ok: false, car: {}, related: [] })

            const cars = related.map(filterCarData)
            const featured = filterCarData(car._doc)

            const featImg = featured.imgs.filter(img => img.main )

            const detailsData = {
                ok: true,
                car: featured,
                related: cars,
                featImg : featImg[ 0 ]
            }

            return res.render('details', { ...detailsData, user, isAuth : req.isAuthenticated() })
        })
    })
})

route.get('/', function (req, res) {
    const user = req.isAuthenticated() ? req.user : ''

    Car.find({ isFeatured : true }, (err, docs) => {
        const authInfo = { user, isAuth : req.isAuthenticated() }

        if (err) return res.render('index', { cars: [], ...authInfo })

        const cars = docs.map(filterCarData)

        return res.render('index', { cars, ...authInfo })
    })
})

// route.get('/stats', checkIfAuth, (req, res) => {
// route.get('/stats', async (req, res) => {
//     console.log('hey, listen!!\n\n\n\n')

//     try {
//         const cars = await Car.count({})
//         const builds = await BuiltCar.count({ $or : [ { reviewed : false }, { reviewed : { $exists : false }} ]})
//         const toSell = await SellCar.count({ $or : [ { reviewed : false }, { reviewed : { $exists : false }} ]})
//         const credAppMsgs = await CreditApp.count({ $or : [ { reviewed : false }, { reviewed : { $exists : false }} ]})
//         const regMsgs = await Message.count({ read : false })
//         const interested = await DealSubscription.count({ $or : [ { reviewed : false }, { reviewed : { $exists : false }} ]})

//         var data = { cars, builds, toSell, inbox : credAppMsgs + regMsgs, interested }

//         return res.send({ ok : true, data })
//     } catch (e) {
//         console.log(e)
//     }

//     return res.send({ ok : false })
// })

web.use('/', route)

module.exports = web
