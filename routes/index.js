var Router = require('express').Router

var admin = require('./admin')
var site = require('./website')

var route = Router()

const routes = [
    admin,
    site
]

routes.forEach(r => {
    route.use('/', r)
})


module.exports = route
