const Router = require('express').Router
const DealSubscription = require('../../models').DealSubsription

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

    DealSubscription.update({ email : data.email, phoneNumber : data.phoneNumber }, { ...data }, { upsert : true, setDefaultsOnInsert : true }, (err, doc) => {
        if(err) return res.send({ ok : false })

        return res.send({ ok : true })
    })

    // Use upsert instead of new
    // var dealsubs = new DealSubscription({ ...data }, function(err, doc) {
    // })
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
