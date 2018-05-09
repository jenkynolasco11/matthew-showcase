const passport = require('passport')

const Router = require('express').Router
const User = require('../models').User
const UserDetails = require('../models').UserDetails

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

route.post('/social', (req, res) => {
  console.log(req.body.fbHandle)


  var socialDetails = new UserDetails({
    user: req.user._id,
    social: {
      instagram: req.body.igHandle,
      facebook: req.body.fbHandle,
      twitter: req.body.twHandle
    }
  })
  socialDetails.save(err => {
    console.log(req.user._id)
    if (err) {
      if (err.code == 11000) {
        UserDetails.findOneAndUpdate(
          {user: req.user._id}, /* query */
          {social: {
            instagram: req.body.igHandle,
            facebook: req.body.fbHandle,
            twitter: req.body.twHandle
          }}, /* update */
          { upsert: false}, function(err) {
            if (err) {
              return err;
            }
          });
          return res.send({ ok : true, message: 'Information Updated!' })

      }
      return res.send({ ok : false, user: req.user })
    }
    console.log('success')
    return res.send({ ok : true, message: 'Information Saved' })
  })
})

user.use('/user', route)

module.exports = user
