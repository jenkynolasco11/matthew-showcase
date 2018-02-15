'use strict'

var body = require('body-parser')
var nodemailer = require('nodemailer')
var express = require('express')
// var session = require('cookie-session')
var session = require('express-session')
var cookie = require('cookie-parser')
// var MongoStore = require('connect-mongo')(session)
var passport = require('passport')
var logger = require('morgan')
var cors = require('cors')
var bluebird = require('bluebird')
var mongoose = require('mongoose')

var routes = require('./routes')

mongoose.Promise = bluebird.Promise
mongoose.connect('mongodb://127.0.0.1/jydautoleasing', function(err) {
  if(err) process.exit(0)

  // generate default meta
  require('./generate-defaults')


  var app = express()

  app.set('views', process.cwd() + '/views')
  app.set('view engine', 'pug')

  app
    .use(cookie('jyd-session_cookie'))
    .use(body.json({ limit : '50mb' }))
    .use(body.urlencoded({ extended : true }))
    .use(session({
      secret : 'M3S3CR37W311K3P7',
      name : 'jyd-session_cookie',
      resave: false,
      saveUninitialized: true,
      cookie : {
        secure : true,
        maxAge : 60 * 60 * 1000 * 24,
        // store : new MongoStore({ collection : 'sessions', mongooseConnection : mongoose.connection })
      }

    }))
    .use(cors({ origin : ['http://localhost:3000'], credentials : true }))
    .use(logger('tiny'))

  // configure passport
  require('./passport-init')(passport)

  app
    .use(passport.initialize())
    .use(passport.session())
    .use('', express.static('./static'))
    .use('/', routes)

  app.listen(process.env.PORT || 8000)
  console.log('Listening on port ' + (process.env.PORT || 8000) + '...')
})
