var Router = require('express').Router
var sendEmail = require('../mailer').sendEmail
var templates = require('../email-templates')
var Car = require('../models').Car
var path = require('path')

var route = Router()
var web = Router()

var paths = [
    'contact-us',
    'credit-app',
    'admin',
    'details',
    'sell-car',
    'listing',
    'services'
]
var titles = {
    'contact-us': 'Contact Us',
    'credit-app': 'Credit App',
    'admin': 'Admin Panel',
    'details': 'Car Details',
    'sell-car': 'Sell Us Your Car',
    'listing': 'Search',
    'services': 'Services'
}

function getCurrentDate() {
    var today = new Date()
    var dd = today.getDate()
    var mm = today.getMonth()+1 //January is 0!
    var yyyy = today.getFullYear()

    today = ('0'+mm).slice(-2) + '-' + ('0'+dd).slice(-2) + '-' + yyyy

    return today
}

function stripData(data, cb) {
    var name = ''
    var emailData = {}
    var convertToPDF = templates.convertToPDFBuffer

    if (!data.email) return null

    if (data['First Name'] && data['Last Name']) name = data['First Name'] + ' ' + data['Last Name']
    else if (data.name) name = data.name

    emailData.from = `'${ name }' <${ data.email }>`
    // emailData.to = 'info@jydautoleasing.com'
    // emailData.bcc = 'jenky@leadfire.com'
    emailData.to = 'jenky@leadfire.com'
    emailData.subject = data.type + ' - ' + name

    var body =
        data.type === 'Credit App' ?
        templates.creditApp(data) :
        data.type === 'Contact Us' ?
        templates.contactUs(name, data.email, data.message, ('subject' in data), ('subject' in data) ? data.subject : data.phone) :
        templates.sellCar(name, data.email, data.phone, data.vYear, data.vMake, data.vModel, data.vMileage, data.VIN, data.vCondition)

    convertToPDF(body, function(err, stream) {
        if(err) return null

        emailData.html = body
        emailData.attachments = [
            {
                filename : data.type + ' - ' + name + ' ' + getCurrentDate(),
                content : stream
            }
        ]

        return cb(emailData)
    }, true)
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

    if (paths.includes(route)) {
        var title = titles[route]

        return res.render(route, {
            title: 'JYD - ' + title
        })
    } else if (route.match(/^service-/)) {
        var view = route.slice(8)

        console.log(view)

        return res.render('services/' + view, {
            title: 'JYD - Services'
        })
    }

    return next()
})

route.post('/data', function (req, res) {
    var body = req.body

    // stripData(body, function(data) {
        // if (!data) return res.send('ok')

        sendEmail(data, function (err, c) {
            if (err) return console.log(err)
            console.log('Email sent!')
        })

        return res.send('ok')
    // })

})

route.get('/details/(:id?)', function (req, res) {
    var id = req.params.id
    if (!id) return res.render('listing', {
        title: 'JYD - Search'
    })

    Car.findOne({
        id: id
    }, function (err, car) {
        // console.log(err)
        if (err) return res.status(200).send({
            ok: false
        })
        // console.log(car._doc)

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

            return res.render('details', {
                ok: true,
                car: featured,
                related: cars
            })
        })
    })
})

route.get('/', function (req, res) {
    Car.find({
        isFeatured: true
    }, function (err, docs) {
        // console.log(docs)
        if (err) return res.render('index', {
            cars: []
        })

        var cars = docs.map(filterCarData)

        return res.render('index', {
            cars: cars
        })
    })
})

web.use('/', route)

module.exports = web
