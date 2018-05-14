const passport = require('passport')

const Router = require('express').Router
const User = require('../models').User
const models = require('../models')

const Message = models.Submission
const Chat = models.ChatMessage
const UserDetails = models.UserDetails

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
  if (!req.isAuthenticated()) {
    console.log('redirected kicked in!')
    return res.send({ok: false, message: 'Not logged in'})
  }

  const { _id : user } = req.user
  const { instagram = '', facebook = '', twitter = '', street = '', city = '', state = '', zip = '' } = req.body

  const data = { user, social : { instagram, facebook, twitter }, address : { street, city, state, zip }}

  UserDetails.findOneAndUpdate({ user }, data, { upsert : true, new : true }, (err, _doc) => {
    if(err) return res.send({ ok : false, user : req.user })

    let completion = 2

    const doc = _doc.toJSON()

    Object.keys(doc.social).forEach(n => completion += +(doc.social[ n ] !== '') )
    Object.keys(doc.address).forEach(n => completion += +(doc.address[ n ] !== '') )

    console.log(doc)
    console.log(completion)

    return res.send({ ok : true, message : 'Information Updated', completion })
  })


  // var socialDetails = new UserDetails({
  //   user: req.user._id,
  //   social : { instagram, facebook, twitter },
  //   address : { street, city, zip, state }
  // })

  // socialDetails.save(err => {
  //   console.log(req.user._id)
  //   if (err) {
  //     if (err.code == 11000) {
  //       UserDetails.findOneAndUpdate(
  //         {user: req.user._id}, /* query */
  //         {social: {
  //           instagram: req.body.igHandle,
  //           facebook: req.body.fbHandle,
  //           twitter: req.body.twHandle
  //         }}, /* update */
  //         { upsert: false}, function(err) {
  //           if (err) {
  //             return err;
  //           }
  //         });
  //         return res.send({ ok : true, message: 'Information Updated!' })

  //     }
  //     return res.send({ ok : false, user: req.user })
  //   }
  //   console.log('success')
  //   return res.send({ ok : true, message: 'Information Saved' })
  // })
})

route.get('/messages/count', async (req, res) => {
  if(!req.isAuthenticated()) return res.send({ ok : false })

  const { email } = req.user

  try {
    const chatCount = await Chat.count({ email })
    const msgCount = await Message.count({ email })

    return res.send({ ok : true, chatCount, msgCount })
  } catch (e) {
    console.log(e)
  }

  return res.send({ ok : false })
})

route.get('/email-messages', async (req, res) => {
  if(!req.isAuthenticated()) return res.send({ ok : false })

  const { email } = req.user
  const { skip = 0, limit = 10 } = req.query

  console.log('Skip => ' + skip, 'Limit => ' + limit)

  try {
    const messages = await Message.find({ user }).sort({ createdBy : -1 }).skip(+skip).limit(+limit).lean()

    // console.log(messages)

    return res.send({ ok : true, messages })
  } catch (e) {
    console.log(e)
  }

  return res.send({ ok : false })
})

route.get('/chat-messages', async (req, res) => {
  if(!req.isAuthenticated()) return res.send({ ok : false })

  const { skip = 0, limit = 10 } = req.query
  const { email } = req.user

  console.log('Skip => ' + skip, 'Limit => ' + limit)

  try {
    const chatMessages = await Chat.find({ email }).sort({ timestamp : -1 }).skip(+skip).limit(+limit).lean()

    return res.send({ ok : true, chatMessages })
  } catch (e) {
    console.log(e)
  }

  return res.send({ ok : false })
})

user.use('/user', route)

module.exports = user
