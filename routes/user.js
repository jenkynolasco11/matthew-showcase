const passport = require('passport')

const Router = require('express').Router
const User = require('../models').User

const route = Router()
const user = Router()

// route.post('/login', (req,res) => {
//     console.log(req.body)

//     console.log('right here')

//     return res.send({ ok : true })
// })

// route.post('/signup', (req,res) => {
//     console.log(req.body)
//     console.log('right here, too')

//     return res.send({ ok : true })
// })

user.use('/user', route)

module.exports = user
