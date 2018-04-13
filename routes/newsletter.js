var Router = require('express').Router
var Newsletter = require('../models').Newsletter

var route = Router()
var newsletter = Router()

route.post('/new-subscriber', function(req, res) {
    var body = req.body

    var newsletter = new Newsletter({ ...body }).save(function(err, doc) {
        if(err) return res.send({ ok : false })

        console.log(doc)

        return res.send({ ok : true })
    })
})

newsletter.use('/newsletter', route)

module.exports = newsletter
