var Router = require('express').Router
var jydEmailDefaults = require('../mailConfig').keys.jydDefaults
var sendEmail = require('../mailer').sendEmail
var templates = require('../email-templates')
var models = require('../models')
var Car = models.Car

var path = require('path')
// var instagram = require('./instagram').getFeed

var route = Router()
var web = Router()

var paths = [
    'sell-car',
    'credit-app',
    'contact-us',
    'sell-car-test',
    'contact-us-test',
    'credit-app-test',
    'admin',
    'details',
    // 'listing',
    'services',
    'refer-a-friend'
]
var titles = {
    'contact-us': 'Contact Us',
    'credit-app': 'Credit App',
    'admin': 'Admin Panel',
    'details': 'Car Details',
    'sell-car': 'Sell Us Your Car',
    'listing': 'Search',
    'services': 'Services',
    'refer-a-friend' : 'Refer a Friend'
}

function getCurrentDate() {
    var today = new Date()
    var dd = today.getDate()
    var mm = today.getMonth()+1 //January is 0!
    var yyyy = today.getFullYear()

    today = ('0'+mm).slice(-2) + '-' + ('0'+dd).slice(-2) + '-' + yyyy

    return today
}

function saveToDatabase(body) {
    var data = {}

    switch(body.type) {
        case 'Credit App':
            var CreditApp = models.CreditApp

            data.code = body['Salesman\'s Name']
            data.firstname = body['First Name']
            data.lastname = body['Last Name']
            data.middlename = body['Middle Name']
            data.phoneNumber = body['Day Time Phone']
            data.dob = new Date(+body['DOB Year'], +body['DOB Month'] - 1, +body['DOB Day'])
            data.ssn = body['SSN']
            data.email = body['email']
            data.street = body['Address']
            data.city = body['City']
            data.state = body['State']
            data.zip = body['ZIP Code']
            data.homeOwnership = body['Home Type']
            data.yearsLivingInPlace = body['Years Living There']
            data.monthsLivingInPlace = body['Months Living There']
            data.monthlyRent = body['Monthly Payment']
            data.previousAddress = body['Previous Address']
            data.driverLicense = {
                number : body['Driver\'s Licence Number'],
                stateIssued : body['Driver\'s State'],
                expirationDate : new Date(body['Driver\'s License Expiration Date Year'], body['Driver\'s License Expiration Date Month']-1, body['Driver\'s License Expiration Date Day']),
            }
            data.employement = {
                employerName : body['Employer\'s Name'],
                employerAddress : body['Employer\'s Address'],
                employerYearsAtWork : body['Employee Years'],
                employerMonthsAtWork : body['Employee Months'],
                montlyIncome : body['Monthly Income'],
            }
            data.previousEmployer = body['Previous Employer']
            data.agreed = body['agree'] !== '0'
            data.reachedOut = false

            var credit = new CreditApp({ ...data }).save(function(err, doc) {
                if(err) return console.log(err)

                return console.log(doc)
            })

            break
        case 'Contact Us':
            var Message = models.Message

            console.log(body)

            var message = new Message({ ...body, read : false }).save(function(err, doc) {
                if(err) return console.log(err)

                return console.log(doc)
            })

            break
        case 'Cash For Cars':
            var SellCar = models.SellCar

            data.firstname = body['First Name']
            data.lastname = body['Last Name']
            data.phoneNumber = body.phone
            data.email = body.email
            data.condition = body.vCondition
            data.mileage = body.vMileage
            data.model = body.vModel
            data.make = body.vMake
            data.year = body.vYear
            data.vin = body.VIN

            var sellcar = new SellCar({ ...data }).save(function(err, doc) {
                if(err) return console.log(err)

                return console.log(doc)
            })

            break
    }
}

function stripData(data, cb) {
    var name = ''
    var emailData = {}
    // var convertToPDF = templates.convertToPDFBuffer

    if (!data.email) return null

    if (data['First Name'] && data['Last Name']) name = data['First Name'] + ' ' + data['Last Name']
    else if (data.name) name = data.name

    emailData.from = `'${ name }' <${ data.email }>`
    emailData.to = jydEmailDefaults.to
    emailData.bcc = jydEmailDefaults.bcc
    emailData.subject = data.type + ' - ' + name

    var body =
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
    var mainImg = ''
    var imgs = car.imgs.forEach(function (img) {
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

route.get('/:route', function (req, res, next) {
    var route = req.params.route

    if (route.match(/^service-/)) {
        var view = route.slice(8)

        return res.render('services/' + view, {
            title: 'JYD - Services'
        })
    } else if (route === 'listing') {
        var data = {}

        Car.distinct('make').then(function(makes) {
            data.makes = makes.sort((a,b) => a.localeCompare(b))

            return Car.distinct('transmission')
        }).then(function(trans) {
            data.trans = trans

            return Car.distinct('fuel')
        }).then(function(fuels) {
            data.fuels = fuels

            return res.render('listing', data)
        }).catch(console.log)

    } else if (paths.includes(route)) {
        var title = titles[route]

        return res.render(route, {
            title: 'JYD - ' + title
        })
    }

    else return next()
})

// TODO: Check this one out!
route.post('/data', function (req, res) {
    var body = req.body

    stripData(body, function(data) {
        if (!data) return res.send('ok')

        sendEmail(data, function (err, c) {
            if (err) return console.log(err)

            // TODO: Save in database
            console.log('Email sent!')
        })

        return res.send('ok')
    })

})

route.get('/details/(:id?)', function (req, res) {
    var id = req.params.id

    if (!id) return res.render('listing', {
        title: 'JYD - Search'
    })

    Car.findOne({
        id: id
    }, function (err, car) {
        if (err) return res.status(200).send({
            ok: false
        })

        Car.aggregate([
            // { $match : { bodyType : car.bodyType }},
            {
                $sample: {
                    size: 3
                }
            },
        ]).exec(function (err, related) {
            if (err) return res.status(200).send({
                ok: false,
                car: {},
                related: []
            })

            var cars = related.map(filterCarData)
            var featured = filterCarData(car._doc)

            var featImg = featured.imgs.filter(function(img) { return img.main })

            // console.log(JSON.stringify(featImg, null, 3))

            return res.render('details', {
                ok: true,
                car: featured,
                related: cars,
                featImg : featImg[ 0 ]
            })
        })
    })
})

route.get('/', function (req, res) {
    Car.find({
        isFeatured: true
    }, function (err, docs) {
        if (err) return res.render('index', {
            cars: []
        })

        var cars = docs.map(filterCarData)

        return res.render('index', {
            cars: cars,
        })
        // }, '')

    })
})

web.use('/', route)

module.exports = web
