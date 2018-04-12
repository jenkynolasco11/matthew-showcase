var Router = require('express').Router
var Refer = require('../models').Refer

var route = Router()
var refer = Router()

route.post('/new-refer', function(req, res) {
    var body = req.body

    // ADD REFER HERE IN DATABASE.
    // TODO: CREATE MAIL FUNCTION THAT CREATES REFERAL CODE AND SENDS IT TO FRIEND

    return res.send({ ok : true })
})

refer.use('/refer', route)

module.exports = refer
