const Router = require('express').Router
// const multer = require('multer')
// const path = require('path')

const models = require('../models')

const route = Router()
const admin = Router()

// const upload = multer({ dest : '../img-uploads' })

const { User, Car, BuiltCar, DealSubsription : DealSubscription, Submission : Messages, SellCar } = models
// const Car = models.Car
// const BuiltCar = models.BuiltCar
// // const SellCar = models.SellCar
// // const Message = models.Message
// // const CreditApp = models.CreditApp
// const
// const DealSubscription = models.DealSubsription

// const Refer = models.Refer
// const Newsletter = models.Newsletter

route.get('/stats', async (req, res) => {
    // console.log('hey, listen!!\n\n\n\n')

    try {
        const users = await User.count({ type : 'customer' })
        const cars = await Car.count({})
        const builds = await BuiltCar.count({ $or : [ { reviewed : false }, { reviewed : { $exists : false }} ]})
        const inbox = await Messages.count({ $or : [ { reviewed : false }, { reviewed : { $exists : false }} ]})
        const toSell = await SellCar.count({ $or : [ { reviewed : false }, { reviewed : { $exists : false }} ]})
        // const credAppMsgs = await CreditApp.count({ $or : [ { reviewed : false }, { reviewed : { $exists : false }} ]})
        // const regMsgs = await Message.count({ reviewed : false })
        const interested = await DealSubscription.count({ $or : [ { reviewed : false }, { reviewed : { $exists : false }} ]})

        // console.log(toSell, credAppMsgs, regMsgs)

        const data = { cars, builds, toSell, inbox, users }

        console.log(data)

        return res.send({ ok : true, data })
    } catch (e) {
        console.log(e)
    }

    return res.send({ ok : false })
})

route.get('/*', function(req, res) {
    // if(!req.isAuthenticated()) return res.redirect('/')
    if(req.user) {
        if(req.user.type !== 'admin') return res.redirect('/dashboard')
    }

    return res.render('admin')
})

admin.use('/admin', route)

module.exports = admin
