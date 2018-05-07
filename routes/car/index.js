const Router = require('express').Router

const filter = require('./filter')
const build = require('./build')
const car = require('./car')
const sell = require('./sell')

const route = Router()

const routes = [
    build,
    car,
    filter,
    sell,
]

routes.forEach(r => route.use('/car', r))

module.exports = route
