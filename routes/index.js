var Router = require('express').Router

var admin = require('./admin')
var site = require('./website')
var car = require('./car')

var route = Router()

const routes = [
    admin,
    site,
    car
]

routes.forEach(r => {
    route.use('/', r)
})


module.exports = route
