var Router = require('express').Router

var admin = require('./admin')
var site = require('./website')
var auth = require('./auth')
var car = require('./car')
var build = require('./buildCar')
var instagram = require('./instagram')
var filter = require('./filter')
var newsletter = require('./newsletter')
var dealSubs = require('./dealSubscription')
var messages = require('./message')
var sellCar = require('./sellCar')

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
    dealSubs,
    messages,
    sellCar
]

routes.forEach(r => route.use('/', r))

module.exports = route
