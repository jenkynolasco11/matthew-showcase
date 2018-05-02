const http = require('http')
const body = require('body-parser')
const nodemailer = require('nodemailer')
const express = require('express')
// const session = require('cookie-session')
const session = require('express-session')
const cookie = require('cookie-parser')
// const MongoStore = require('connect-mongo')(session)
const passport = require('passport')
const logger = require('morgan')
const cors = require('cors')
const bluebird = require('bluebird')
const mongoose = require('mongoose')

const routes = require('./routes')
const socketServer = require('./socket.io').server

mongoose.Promise = bluebird.Promise
mongoose.connect('mongodb://127.0.0.1/jydautoleasing', err => {
  if(err) process.exit(0)

  // generate default meta
  require('./generate-defaults')

  const app = express()

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
        // secure : true,
        maxAge : 60 * 60 * 1000 * 24,
        // store : new MongoStore({ collection : 'sessions', mongooseConnection : mongoose.connection })
      }

    }))
    .use(cors({ origin : ['http://localhost:3000', 'http://localhost:8001'], credentials : true }))
    // .use(logger('dev'))

  // configure passport
  require('./passport-init')(passport)

  app
    .use(passport.initialize())
    .use(passport.session())
    .use('', express.static('./static'))
    .use('/', routes)


  const server = http.createServer(app)

  socketServer(server)

  server.listen(process.env.PORT || 8000, () => {
    console.log('Listening on port ' + (process.env.PORT || 8000) + '...')
  })
})
