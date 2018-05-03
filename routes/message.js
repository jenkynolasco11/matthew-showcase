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
        let submissions = await Submission.find({ deleted : false }).sort({ createdBy : -1 }).skip(+skip).limit(+limit)
        const count = await Submission.count({ deleted : false })

        submissions = submissions.map(message => {
            message = message.toObject();

            message = { ...message, ...message.body }

            if (!message.name) {
                message.name = message.firstname + ' ' + message.lastname;
            }

            return message;
        })

        return res.send({ ok : true, messages : submissions, count })
    } catch (e) {
        console.log(e)
    }

    return res.send({ ok : false })
})

route.put('/:type/read/:id', async (req, res) => {
    const { id, type } = req.params

    Submission.findByIdAndUpdate(id, { reviewed : true, reviewedBy : Date.now() }, err => {
        if(err) {
            console.log(err)

            return res.send({ ok : false })
        }

        for(let socketId in sockets) {
            sockets[ socketId ].socket.emit('new message')
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
                sockets[ socketId ].socket.emit('new message')
            }

            return res.send({ ok : true })
        })
    })
})

route.put('/delete', async (req, res) => {
    const { id } = req.body

    try {
        await Submission.findByIdAndUpdate(id, { deleted : true })

        return res.send({ ok : true })
    } catch (e) {
        console.log(e)
    }

    return res.send({ ok : false })
})

// TODO: Move creation of new messages here
route.post('/new', (req,res) => {
})

message.use('/message', route)

module.exports = message
