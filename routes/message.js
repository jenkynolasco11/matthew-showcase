const Router = require('express').Router

const models = require('../models')
const sockets = require('../socket.io').sockets

const route = Router()
const message = Router()

const Message = models.Message
const SellCar = models.SellCar
const CreditApp = models.CreditApp

route.get('/all', async (req, res) => {
    try {
        // TODO: Add search criteria in here
        const msgs = await Message.find({ $or : [ { deleted : { $exists : false}}, { deleted : false }]})
        const sells = await SellCar.find({ $or : [ { deleted : { $exists : false}}, { deleted : false }]})
        const credit = await CreditApp.find({ $or : [ { deleted : { $exists : false}}, { deleted : false }]})

        const allMsgs = [
            ...msgs,
            ...sells,
            ...credit
        ].sort((a,b) => {
            if(new Date(a.createdBy) > new Date(b.createdBy)) return -1
            if(new Date(b.createdBy) > new Date(a.createdBy)) return 1
            return 0
        })

        const count = allMsgs.length
        const messages = allMsgs.slice(0,20)

        return res.send({ ok : true, messages, count })
    } catch (e) {
        console.log(e)
    }

    return res.send({ ok : false })
})

route.put('/:type/read/:id', async (req, res) => {
    const { id, type } = req.params

    let model = null

    switch(type) {
        case 'credit':
            model = CreditApp
            break
        case 'sell':
            model = SellCar
            break
        default:
            model = Message
    }

    model.findByIdAndUpdate(id, { reviewed : true }, function(err) {
        // return res.
    })

    // res.send('hola')
})

route.post('/new', (req,res) => {
    // TODO: Move creation of new messages here
})

message.use('/message', route)

module.exports = message
