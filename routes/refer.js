const Router = require('express').Router
const Refer = require('../models').Refer

const route = Router()
const refer = Router()

route.post('/new-refer', function(req, res) {
    const { body } = req

    // ADD REFER HERE IN DATABASE.
    // TODO: CREATE MAIL FUNCTION THAT CREATES REFERAL CODE AND SENDS IT TO FRIEND
    return res.send({ ok : true })
})

refer.use('/refer', route)

module.exports = refer
