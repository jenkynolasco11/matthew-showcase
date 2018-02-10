'use strict'

var body = require('body-parser')
var nodemailer = require('nodemailer')
var express = require('express')
var logger = require('morgan')

var routes = require('./routes')
// var websiteRoute = require('./routes/website')

var app = express()

app
  .use(logger('tiny'))
  .use(body.urlencoded({ extended : true }))
  .use('', express.static('./static'))
  .use('/', routes)

app.listen(process.env.PORT || 8000)
console.log('Listening on port ' + (process.env.PORT || 8000) + '...')
