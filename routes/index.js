const Router = require('express').Router

const car = require('./car')
const subs = require('./subscription')

const admin = require('./admin')
const site = require('./website')
const auth = require('./auth')
const user = require('./user')

const instagram = require('./instagram')
const messages = require('./message')

const route = Router()

const routes = [
    admin,
    auth,

    car,
    instagram,

    messages,
    site,

    subs,
    user,
]

routes.forEach(r => route.use('/', r))

module.exports = route
