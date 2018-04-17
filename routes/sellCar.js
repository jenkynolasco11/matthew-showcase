var Router = require('express').Router

var route = Router()
var sellCar = Router()

var models = require('../models')
var SellCar = models.SellCar

route.get('/all', function(req, res) {
    SellCar.find({
        // TODO: Add search criteria in here
    }).then(function(sells) {
        return res.send({ ok : true, sellCar : sells })
    }).catch(function(err) {
        console.log(err)

        return res.send({ ok : false })
    })
})
// route.post('/auth/login', function(req, res) {

// })
// route.post('/upload-car', upload.single('car-image'), function(req, res) {
//     var file = req.file
//     var body = req.body
// })

sellCar.use('/sell-car', route)

module.exports = sellCar
