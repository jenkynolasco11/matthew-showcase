var Router = require('express').Router
var multer = require('multer')
var path = require('path')

const models = require('../models')

var route = Router()
var admin = Router()

var upload = multer({ dest : '../img-uploads' })

const Car = models.Car
const BuiltCar = models.BuiltCar
const SellCar = models.SellCar
const Message = models.Message
const CreditApp = models.CreditApp
const DealSubscription = models.DealSubsription
// const Refer = models.Refer
// const Newsletter = models.Newsletter

route.get('/stats', async (req, res) => {
    // console.log('hey, listen!!\n\n\n\n')

    try {
        const cars = await Car.count({})
        const builds = await BuiltCar.count({ $or : [ { reviewed : false }, { reviewed : { $exists : false }} ]})
        const toSell = await SellCar.count({ $or : [ { reviewed : false }, { reviewed : { $exists : false }} ]})
        const credAppMsgs = await CreditApp.count({ $or : [ { reviewed : false }, { reviewed : { $exists : false }} ]})
        const regMsgs = await Message.count({ reviewed : false })
        const interested = await DealSubscription.count({ $or : [ { reviewed : false }, { reviewed : { $exists : false }} ]})

        // console.log(toSell, credAppMsgs, regMsgs)

        const data = { cars, builds, toSell, inbox : credAppMsgs + regMsgs + toSell, interested }

        return res.send({ ok : true, data })
    } catch (e) {
        console.log(e)
    }

    return res.send({ ok : false })
})

route.get('/*', function(req, res) {
    res.render('admin')
})

admin.use('/admin', route)

module.exports = admin
