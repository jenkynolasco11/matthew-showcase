var Router = require('express').Router

var admin = require('./admin')
var site = require('./website')
var auth = require('./auth')
var car = require('./car')

var route = Router()

const routes = [
    auth,
    admin,
    site,
    car
]

routes.forEach(r => {
    route.use('/', r)
})


module.exports = route
