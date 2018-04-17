const Router = require('express').Router

const deal = require('./deal')
const news = require('./newsletter')

const route = Router()

const routes = [
    deal,
    news
]

routes.forEach(r => route.use('/subscription', r))

module.exports = route
