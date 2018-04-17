const Router = require('express').Router

const route = Router()
const message = Router()

const models = require('../models')
const Message = models.Message
// var DealSubs = models.DealSubsription
// var SellCar = models.SellCar
// var CreditApp = models.CreditApp
// var BuiltCar = models.BuiltCar

route.get('/all', (req, res) => {
    Message.find({
        // TODO: Add search criteria in here
    }).then(messages => {
        return res.send({ ok : true, messages })
    }).catch(err => {
        console.log(err)

        return res.send({ ok : false })
    })
})

route.post('/new', (req,res) => {
    
})

message.use('/message', route)

module.exports = message
