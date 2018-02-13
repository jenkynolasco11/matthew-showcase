'use strict'

var body = require('body-parser')
var nodemailer = require('nodemailer')
var express = require('express')
var logger = require('morgan')
var cors = require('cors')
var bluebird = require('bluebird')
var mongoose = require('mongoose')

var routes = require('./routes')

mongoose.Promise = bluebird.Promise
mongoose.connect('mongodb://127.0.0.1/jydautoleasing', function(err) {
  if(err) process.exit(0)

  var app = express()

  app.set('views', process.cwd() + '/views')
  app.set('view engine', 'pug')

  app
    .use(logger('tiny'))
    .use(cors({ origin : '*' }))
    .use(body.json({ limit : '30mb' }))
    .use(body.urlencoded({ extended : true }))
    .use('', express.static('./static'))
    .use('/', routes)

  app.listen(process.env.PORT || 8000)
  console.log('Listening on port ' + (process.env.PORT || 8000) + '...')
})
