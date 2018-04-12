var Router = require('express').Router

var admin = require('./admin')
var site = require('./website')
var auth = require('./auth')
var car = require('./car')
var build = require('./buildCar')
var instagram = require('./instagram')
var filter = require('./filter')
var newsletter = require('./newsletter')
// var dealSub = require('./deal-sub')

var route = Router()

const routes = [
    filter,
    build,
    auth,
    admin,
    site,
    car,
    instagram,
    newsletter,
    // dealSub
]

routes.forEach(r => route.use('/', r))

module.exports = route
