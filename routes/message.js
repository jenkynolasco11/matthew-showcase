const Router = require('express').Router

const models = require('../models')
const sockets = require('../socket.io').sockets
const sendEmail = require('../mailer').sendEmail
const jydEmailDefaults = require('../mailConfig').keys.jydDefaults

const route = Router()
const message = Router()

const Submission = models.Submission;

route.get('/all', async (req, res) => {
    const { skip = 0, limit = 10 } = req.query

    try {
        // TODO: Add search criteria in here
        let submissions = await Submission.find({}).sort({ createBy : 1 })
        submissions = submissions.map(message => {
            message = message.toObject();
            message = {
                ...message,
                ...message.body
            }
            if (!message.name) {
                message.name = message.firstname;
            }
            console.log(message.name)
            return message;
        });


        const count = submissions.length
        const startIndex = Number(skip)
        const lastIndex = startIndex + Number(limit)

        const messages = submissions.slice(startIndex, lastIndex)

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

    const createdBy = new Date()

    const reply = { text, createdBy }

    Submission.findByIdAndUpdate(id, { $push : { reply }}, { new : true }, (err, doc) => {
        if (err) {
            console.log(err)

            return res.send({ ok : false })
        }

        const { email, reply, name, type } = doc;

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