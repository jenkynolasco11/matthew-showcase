var Router = require('express').Router
var DealSubscription = require('../models').DealSubsription

var route = Router()
var dealsubs = Router()

route.post('/new-subscription', function(req, res) {
    var body = req.body

    var data = {}

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

    var dealsubs = new DealSubscription({ ...data }, function(err, doc) {
        if(err) return res.send({ ok : false })

        return res.send({ ok : true })
    })
})

dealsubs.use('/deal-subs', route)

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
