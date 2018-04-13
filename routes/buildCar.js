var Router = require('express').Router
var jydEmailDefaults = require('../mailConfig').keys.jydDefaults
var templates = require('../email-templates')
var convertToPDF = templates.convertToPDFBuffer
var buildAppTemplate = templates.buildApp
var sendEmail = require('../mailer').sendEmail
var fs = require('fs')
var path = require('path')

var route = Router()
var buildCar = Router()
var file = fs.readFileSync(path.resolve(__dirname, '../cars-file.json'), 'utf8')

var cars = JSON.parse(file)

function getCurrentDate() {
    var today = new Date()
    var dd = today.getDate()
    var mm = today.getMonth()+1 //January is 0!
    var yyyy = today.getFullYear()

    today = ('0'+mm).slice(-2) + '-' + ('0'+dd).slice(-2) + '-' + yyyy

    return today
}

function getCarsByModel(year, make, model) {
    var modelsByMake = cars[ year ][ make ]

    return modelsByMake.filter(function(car) {
        return car.Model === model
    })
}

function getOptions(options) {
    var [ year, make, model, msrp, dest, invoice, trim, optionsPrice, ...selectedOptions ] = options

    return {
        year : year,
        make : make,
        model : model,
        invoice : invoice,
        dest : dest,
        msrp : msrp,
        trim : trim,
        optionsPrice : optionsPrice,
        selectedOptions : selectedOptions
    }
}

route.get('/', function(req, res) {
    var query = req.query
    var year = query.year
    var make = query.make
    var model = query.model

    if(year && !make && !model) {
        var makesByYear = cars[ year ]
        var makes = Object.keys(makesByYear).sort(function(a,b) {
            return a.toLowerCase().localeCompare(b.toLowerCase())
        })

        return res.send({ makes : [].concat(makes) })
    } else if(year && make) {
        var modelsByMake = cars[ year ][ make ]
        var modelsSet = new Set([])

        modelsByMake.forEach(function(car) {
            modelsSet.add(car.Model)
        })

        var models = Array.from(modelsSet).sort(function(a,b) {
            return a.toLowerCase().localeCompare(b.toLowerCase())
        })

        if(!model) return res.send({ models : [].concat(models) })

        // It never gets here... This is more an API call

        var modelsSelected = getCarsByModel(year, make, model)

        var content = { make : make, year : year, model : model, carOptions : [].concat(modelsSelected) }

        return res.redirect('/trim')
    }

    return res.redirect(301, '/')
})

route.get('/trim', function(req, res) {
    var query = req.query
    var options = query.options.split('|')

    var { year, make, model } = getOptions(options)

    if(!query.build) return res.redirect('/')

    var modelsByMake = cars[ year ][ make ]

    var modelsSelected = getCarsByModel(year, make, model)

    var trims = modelsSelected.reduce(function(p, n) {
        if(p[ n.Trim ]) return { ...p, [ n.Trim ] : [].concat(p[ n.Trim ], n) }

        return { ...p, [ n.Trim ] : [ n ] }
    }, {})

    return res.render('build-car/trim', { trims : trims, make : make, model : model, year : year })
})

route.get('/options', function(req, res) {
    var query = req.query
    var options = query.options.split('|')

    var { year, make, model, msrp, dest, invoice, trim } = getOptions(options)

    var modelsSelected = getCarsByModel(year, make, model)
    var modelSelected = modelsSelected.filter(function(model) { return model.Trim === trim }).pop()

    var data = {
        year : year,
        make : make,
        model : model,
        invoice : invoice,
        dest : dest,
        msrp : msrp,
        trim : trim,
        options : modelSelected.Options,
        hiddenOpt : query.options
    }

    return res.render('build-car/options', data)
})

route.get('/review', function(req, res) {
    var query = req.query
    var options = getOptions(query.options.split('|'))
    var selectedOptions = options.selectedOptions

    var opts = {}

    selectedOptions.forEach(function(option) {
        var item = option.match(/\{(.*)\}(.*)/)
        var key = item[ 1 ].replace(/_/g, ' ')
        var desc = item[ 2 ]

        if(opts[ key ]) return opts[ key ].push(desc)
        return opts[ key ] = [ desc ]
    })

    options.selectedOptions = opts
    options.hiddenOpt = query.options

    return res.render('build-car/review', options)
})

route.post('/review', function(req, res) {
    var body = req.body
    var emailData = {}

    // console.log(body)

    var options = getOptions(body.options.split('|'))
    var data = Object.assign({}, body, options)

    var name = data.firstname + ' ' + data.lastname
    var htmlBody = buildAppTemplate(data)

    emailData.from = `'${ name }' <${ data.email }>`
    emailData.to = jydEmailDefaults.to
    emailData.bcc = jydEmailDefaults.bcc
    emailData.subject = 'Requesting a Quote for a ' + data.year + ' ' + data.make + ' ' + data.model
    emailData.html = htmlBody

    // convertToPDF(htmlBody, function(err, stream) {
    //     if(!err) emailData.attachments = [{
    //         filename : 'Quote Request - ' + name + ' ' + getCurrentDate(),
    //         content : stream
    //     }]

        sendEmail(emailData, function(err) {
            if(err) return console.log(err)

            return console.log('Email sent!')
        })
    // }, true)

    // sendEmail(emailData, function(err) {
    //     if(err) return console.log(err)
    //     console.log('Email sent!')
    // })
    /**
{ firstname: 'Jenky',
  lastname: 'Nolasco',
  phone: '3479742990',
  email: 'jenky_nolasco@hotmail.com',
  hasLease: 'no',
  isVeteran: 'yes',
  isGraduate: 'no',
  hasTradeIn: 'no',
  downPayment: '1',
  options: '2018|BMW|X3|42,650|995|41565|xDrive30i Sports Activity Vehicle|1400|{Wheels}WHEELS: 18" X 7.0" Y-SPOKE (STYLE 688)|{Additional_equipment}DYNAMIC HANDLING PACKAGE Dynamic Damper Control, M Sport Brakes, Variable Sport Steering (DISC), Performance Control|{Seat_trim}CANBERRA BEIGE/BLACK, SENSATEC UPHOLSTERY' }
     */

    // var htmlTemplate = buildAppTemplate(data)

    return res.end('ok')
})



buildCar.use('/build-car', route)

module.exports = buildCar
