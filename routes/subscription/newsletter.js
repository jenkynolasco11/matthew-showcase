const Router = require('express').Router

const sendEmail = require('../../mailer').sendEmail
const Newsletter = require('../../models').Newsletter
const emailTemplate = require('../../email-templates').newsletter
const jydEmailDefaults = require('../../mailConfig').keys.jydDefaults

const route = Router()
const newsletter = Router()

route.post('/new', (req, res) => {
    const { body } = req

    console.log(body)

    Newsletter.update(
        { email : body.email },
        { ...body },
        { upsert : true, setDefaultsOnInsert : true },
        (err, doc) => {
            if(err) return res.send({ ok : false })

            const htmlBody = emailTemplate(body)
            const emailData = {}

            emailData.from = `'${ body.name }' <${ body.email }>`
            emailData.to = jydEmailDefaults.to
            emailData.bcc = jydEmailDefaults.bcc
            emailData.subject = `New Newsletter Signup - ${ body.name }`

            console.log(emailData)

            emailData.html = htmlBody

            sendEmail(emailData, err => {
                console.log(err)
                if(err) return res.send({ ok : false })

                return res.send({ ok : true })
            })
        }
    )
})

newsletter.use('/newsletter', route)

module.exports = newsletter
