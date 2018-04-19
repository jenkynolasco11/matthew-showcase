const Router = require('express').Router

const sendEmail = require('../../mailer').sendEmail
const DealSubscription = require('../../models').DealSubsription
const jydEmailDefaults = require('../../mailConfig').keys.jydDefaults
const emailTemplate = require('../../email-templates').dealSubscription

const route = Router()
const dealsubs = Router()

route.post('/new', (req, res) => {
    const { body } = req

    const data = {}

    data.phoneNumber = body.phoneNumber
    data.name = body.name
    data.email = body.email
    data.reminded = false
    data.vehicle = {
        make : body.make,
        model : body.model,
        year : body.year,
        id : body.id
    }

    DealSubscription.update(
        { email : data.email, phoneNumber : data.phoneNumber },
        { ...data },
        { upsert : true, setDefaultsOnInsert : true },
        (err, doc) => {
            if(err) return res.send({ ok : false })

            const htmlBody = emailTemplate(data)
            const emailData = {}

            emailData.from = `'${ data.name }' <${ data.email }>`
            emailData.to = jydEmailDefaults.to
            emailData.bcc = jydEmailDefaults.bcc
            emailData.subject = `New Deal Interest - ${ data.name }`
            emailData.html = htmlBody

            sendEmail(emailData, err => {
                if(err) return res.send({ ok : false })

                return res.send({ ok : true })
            })
        }
    )
})

route.get('/all', (req, res) => {
    DealSubscription.find({
        // TODO: Add query criteria in here
    }).then(deals => {
        return res.send({ ok : true, deals })
    }).catch(err => {
        console.log(err)

        return res.send({ ok : false })
    })
})

dealsubs.use('/deal', route)

module.exports = dealsubs
/**
 * { name: 'Jenky',
    phoneNumber: '3479742990',
    email: 'jenky_nolasco@hotmail.com',
    make: 'Acura',
    model: 'TLX',
    year: '2018',
    id: 'JYD-01151800007' }
 */
