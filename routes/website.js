const Router = require('express').Router
const jydEmailDefaults = require('../mailConfig').keys.jydDefaults
const sendEmail = require('../mailer').sendEmail
const templates = require('../email-templates')
const models = require('../models')
const fs = require('fs')
const path = require('path')

const sockets = require('../socket.io').sockets
// const IO = require('socket.io')

const Car = models.Car
const ReferenceCar = models.ReferenceCar
const BuiltCar = models.BuiltCar
const SellCar = models.SellCar
const Message = models.Message
const CreditApp = models.CreditApp
const DealSubscription = models.DealSubsription
const Refer = models.Refer
const Newsletter = models.Newsletter
const Submission = models.Submission

const file = fs.readFileSync(path.resolve(__dirname, './car/cars-file-2.json'), 'utf8')
const cars = JSON.parse(file)

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
    'comparison',
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
    'comparison': 'Comparing Cars',
    'refer-a-friend': 'Refer a Friend'
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

async function saveToDatabase(body) {
    const data = { body : {} }

    switch(body.type) {
        case 'credit app':
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

            try {
                console.log(data)
                const credit = new Submission({ ...data, type: 'credit' })

                console.log(credit)

                await credit.save()
            } catch (e) {
                return console.log(e)
            }

            break
        case 'contact us':
            const messageData = body;

            messageData.body = {};
            messageData.body.subject = body['subject'];
            messageData.body.message = body['message'];

            try {
                const message = new Submission({ ...messageData, type : 'message', read : false })

                await messages.save()
            } catch (e) {
                return console.log(e)
            }

            break
        case 'cash for cars':
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

            try {
                const sellcar = new Submission({ ...data, type : 'sell' })

                await sellcar.save()
            } catch (e) {
                return console.log(e)
            }

            break
    }

    for(let [ socketId ] of sockets) {
        // console.log(socketId)
        sockets[ socketId ].socket.emit('server:new email')
    }
}

function toLowerCase(obj) {
    const data = {}

    Object.keys(obj).forEach(k => {
        if(typeof obj[ k ] === 'obj' && !Array.isArray(obj[ k ])) data [ k ] = toLowerCase(obj[ k ])

        else data[ k ] = obj[ k ].toLowerCase()
    })

    return data
}

function stripData(rawData, cb) {
    let name = ''
    const emailData = {}

    const data = toLowerCase(rawData)

    // console.log(data)

    if (!data.email) return null

    if (data['First Name'] && data['Last Name']) name = `${ data['First Name'] } ${ data['Last Name'] }`
    else if (data.name) name = data.name

    emailData.from = `'${ name }' <${ data.email }>`
    emailData.to = jydEmailDefaults.to
    emailData.bcc = jydEmailDefaults.bcc
    emailData.subject = `${ data.type } - ${ name }`

    const body =
        data.type === 'credit app' ?
        templates.creditApp(data) :
        data.type === 'contact us' ?
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

// async function getBuildsForCompare(email) {
//     try {
//         const builds = await BuiltCar.find({ email })
//         const selected = builds.map(c => c.toObject())
//                                 .map(({ options, url }) => ({ year : options.year, make : options.make, model : options.model, trim : options.trim, url }))
//                                 .map(JSON.stringify)

//         const buildsX = [ ...new Set(selected) ].map(JSON.parse)
//                         .map(({ make, model, year, trim, url }) => ({ make, model, year, trim, img : cars[ year ][ make ].find(t => {
//                             console.log(make, model, year, trim)
//                             return t.Trim === trim
//                         }).Photo }))


//         return buildsX
//     } catch (e) {
//         console.log(e)
//     }

//     return null
// }

route.get('/:route', async (req, res, next) => {
    const route = req.params.route
    let user = req.isAuthenticated() ? req.user : ''

    if(user.type === 'admin' && route !== 'admin') {
        req.logout()
        user = ''
    }

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
        if(!req.isAuthenticated()) return res.redirect('/')

        const UserDetails = models.UserDetails
        const Car = models.Car
        const Builds = models.BuiltCar
        const { email } = user
        let years = null

        try {
            const currentDetails = await UserDetails.findOne({ user : user._id }).lean()

            let completion = 2

            if(currentDetails) {
                Object.keys(currentDetails.social).forEach(n => completion += +(currentDetails.social[ n ] !== '') )
                Object.keys(currentDetails.address).forEach(n => completion += +(currentDetails.address[ n ] !== '') )
            }

            years = Object.keys(cars)

            const { car1, car2, compare, year, make, model } = req.query

            let c1 = null
            let c2 = null
            let carPhoto = null

            if(compare === 'true') {
                carPhoto = cars[ year ][ make ].find(c => c.Model === model).Photo
            } else if(car1 && car2) {
                const [ year1, make1, model1 /*, trim1*/ ] = car1.split(',')
                const [ year2, make2, model2 /*, trim2*/ ] = car2.split(',')

                const query1 = { model : model1, modelMakeDisplay : make1, modelYear : year1 }
                const query2 = { model : model2, modelMakeDisplay : make2, modelYear : year2 }

                // try {
                const car1Stats = await ReferenceCar.aggregate([
                    { $match : query1 }
                ])
                const car2Stats = await ReferenceCar.aggregate([
                    { $match : query2 }
                ])

                // console.log(car1Stats[ 0 ])
                // console.log(car2Stats[ 0 ])
                c1 = car1Stats[ 0 ]
                c2 = car2Stats[ 0 ]

                const cars1 = cars[ year1 ][ make1 ] || []
                const cars2 = cars[ year2 ][ make2 ] || []

                if(cars1.length === 0 || cars2.length === 0 || !c1 || !c2) return res.render('user-dashboard', { title : `Dashboard - ${ user.name }`, user, isAuth : req.isAuthenticated(), currentDetails, carOpts : { years : [ ...years.reverse() ]}})

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
            }

            const renderBody = {
                user,
                completion,
                currentDetails,
                title : `Dashboard - ${ user.name }`,
                isAuth : req.isAuthenticated(),
                carOpts : { carPhoto,year,make,model,years : [ ...years.reverse() ]},
                c1,
                c2,
                comparing : !!c1 && !!c2,
            }

            // console.log(renderBody)

            return res.render('user-dashboard', renderBody)
        } catch (e) {
            console.log(e)

            return res.render('user-dashboard', { title : `Dashboard - ${ user.name }`, user, isAuth : req.isAuthenticated(), currentDetails, carOpts : { years : [ ...years.reverse() ]}})
        }
        //     , function(err, data){
        // //   console.log(user._id)
        // //   console.log(`data is here: ${data}`)

        // })
        return res.redirect('/')
    } else if(route === 'comparison') {
        console.log('right here')
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
            const isLiked = featured.likedBy.includes(`${user._id}`)
            const featImg = featured.imgs.filter(img => img.main )

            const detailsData = {
                ok: true,
                car: featured,
                related: cars,
                featImg : featImg[ 0 ]
            }
            //console.log(detailsData)

            return res.render('details', { ...detailsData, user, isAuth : req.isAuthenticated(), liked: isLiked})
        })
    })
})

route.get('/', function (req, res) {
    let user = req.isAuthenticated() ? req.user : ''

    if(user.type === 'admin') {
        req.logout()
        user = ''
    }

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
