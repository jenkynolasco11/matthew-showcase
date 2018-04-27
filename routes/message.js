const Router = require('express').Router

const models = require('../models')
const sockets = require('../socket.io').sockets
const sendEmail = require('../mailer').sendEmail
const jydEmailDefaults = require('../mailConfig').keys.jydDefaults

const route = Router()
const message = Router()

const Message = models.Message
const SellCar = models.SellCar
const CreditApp = models.CreditApp

route.get('/all', async (req, res) => {
    const { skip = 0, limit = 10 } = req.query

    try {
        // TODO: Add search criteria in here
        const msgs = await Message.find({ $or : [ { deleted : { $exists : false}}, { deleted : false }]}).sort({ createBy : 1 })
        const sells = await SellCar.find({ $or : [ { deleted : { $exists : false}}, { deleted : false }]}).sort({ createBy : 1 })
        const credits = await CreditApp.find({ $or : [ { deleted : { $exists : false}}, { deleted : false }]}).sort({ createBy : 1 })

        const allMsgs = [
            ...msgs,
            ...sells,
            ...credits
        ].sort((a,b) => {
            if(new Date(a.createdBy) > new Date(b.createdBy)) return -1
            if(new Date(b.createdBy) > new Date(a.createdBy)) return 1

            return 0
        })

        const count = allMsgs.length
        const startIndex = Number(skip)
        const lastIndex = startIndex + Number(limit)

        const messages = allMsgs.slice(startIndex, lastIndex)

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

    model.findByIdAndUpdate(id, { reviewed : true, reviewedBy : Date.now() }, err => {
        if(err) {
            console.log(err)

            return res.send({ ok : false })
        }

        for(let socketId in sockets) {
            sockets[ socketId ].emit('new message')
        }

        return res.send({ ok : true })
    })
})

route.post('/reply', async (req, res) => {
    const { id, type, reply : text } = req.body

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

    const createdBy = new Date()

    const reply = { text, createdBy }

    model.findByIdAndUpdate(id, { $push : { reply }}, { new : true }, (err, doc) => {
        if(err) {
            console.log(err)

            return res.send({ ok : false })
        }

        const { email, reply, name, type } = doc
        const subject = type === 'credit'
            ? 'Reply on a Credit Application'
            : type === 'sell'
            ? 'Reply to a Selling Application'
            : 'Reply to a Message'

        // TODO: Add a format of how to send the email text in the reply
        const emailData = {
            from : `"JYD Auto Services" <${ jydEmailDefaults.to }>`,
            to : email,
            bcc : jydEmailDefaults.bcc,
            subject : subject,
            text : reply[ 0 ].text
        }

        sendEmail(emailData, function(err) {
            if(err) {
                console.log(err)

                return res.send({ ok : false })
            }

            for(let socketId in sockets) {
                sockets[ socketId ].emit('new message')
            }

            return res.send({ ok : true })
        })
    })
})

// TODO: Move creation of new messages here
route.post('/new', (req,res) => {
})

message.use('/message', route)

module.exports = message
