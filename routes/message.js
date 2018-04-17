var Router = require('express').Router

var route = Router()
var message = Router()

var models = require('../models')
var Message = models.Message
// var DealSubs = models.DealSubsription
// var SellCar = models.SellCar
// var CreditApp = models.CreditApp
// var BuiltCar = models.BuiltCar

route.get('/all', function(req, res) {
    Message.find({
        // TODO: Add search criteria in here
    }).then(function(messages) {
        return res.send({ ok : true, messages })
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

message.use('/message', route)

module.exports = message
