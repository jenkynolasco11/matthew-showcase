var Router = require('express').Router

var admin = require('./admin')
var site = require('./website')
var auth = require('./auth')
var car = require('./car')
var build = require('./buildCar')
var instagram = require('./instagram')

var route = Router()

const routes = [
    build,
    auth,
    admin,
    site,
    car,
    instagram
]

routes.forEach(r => {
    route.use('/', r)
})


module.exports = route
