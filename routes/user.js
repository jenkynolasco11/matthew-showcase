const passport = require('passport')

const Router = require('express').Router
const multer = require('multer')
// const path = require('path')
// const fs = require('fs')
const models = require('../models')

const { User, UserDetails, ChatMessage : Chat, Submission : Message } = models

const storage = multer.diskStorage({
  destination : (req, file, cb) => {
    cb(null, './static/user-uploads')
  },
  filename : (req, file, cb) => {
    const { username : uname } = req.user
    const { originalname : fname } = file

    cb(null, `${ uname } - ${ fname }`)
  }
})

const uploads= multer({ storage })

const route = Router()
const user = Router()

function checkIfAuthenticated(req, res, next) {
  if(!req.isAuthenticated()) return res.send({ ok : false })

  return next()
}

route.post('/social', checkIfAuthenticated, (req, res) => {
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

route.get('/messages/count', checkIfAuthenticated, async (req, res) => {
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

route.get('/email-messages', checkIfAuthenticated, async (req, res) => {
  // if(!req.isAuthenticated()) return res.send({ ok : false })

  const { email } = req.user
  const { skip = 0, limit = 10 } = req.query

  // console.log('Skip => ' + skip, 'Limit => ' + limit)

  try {
    const messages = await Message.find({ user }).sort({ createdBy : -1 }).skip(+skip).limit(+limit).lean()

    // console.log(messages)

    return res.send({ ok : true, messages })
  } catch (e) {
    console.log(e)
  }

  return res.send({ ok : false })
})

route.get('/chat-messages', checkIfAuthenticated, async (req, res) => {

  const { skip = 0, limit = 10 } = req.query
  const { email } = req.user

  // console.log('Skip => ' + skip, 'Limit => ' + limit)

  try {
    const chatMessages = await Chat.find({ email }).sort({ timestamp : -1 }).skip(+skip).limit(+limit).lean()

    return res.send({ ok : true, chatMessages })
  } catch (e) {
    console.log(e)
  }

  return res.send({ ok : false })
})

route.get('/files', checkIfAuthenticated, async (req, res) => {
  const { _id : user, email } = req.user

  try {
    const {files} = await UserDetails.findOne({ user }, { files : 1, _id : 0 })

    const fnames = files.map(({ path, name }) => {
      return {
        name : name.replace(new RegExp(email + ' - ', 'i'), ''),
        path : path.replace(/^static\//,'')
      }
    })

    return res.send({ ok : true, fnames })
  } catch (e) {
    console.log(e)
  }

  return res.send({ ok : false })
})

async function uploadFiles(req, res, next) {
  // if(!req.isAuthenticated()) return res.send({ ok : false, message : 'User is not authenticated' })
  const { _id : user } = req.user
  const { files : fls } = req

  const files = fls.map(f => {
    const { filename : name, path, mimetype : type, size } = f

    return { name, path, type, size }
  })

  try {
    // const details = await UserDetails.updateOne({ user }, { $push : { files }})
    const details = await UserDetails.findOne({ user })

    const oldFiles = [].concat(details.files ? details.files : [])

    const filter = []
    oldFiles.forEach(x => filter.push(x.name))

    details.files = [].concat(...oldFiles, [ ...files ].filter(n => !filter.includes(n.name)))

    console.log(files)

    await details.save()

    console.log(details)
  } catch (e) {
    console.log(e)
  }

  return next()
}

route.post('/files', checkIfAuthenticated, uploads.array('files[]'), uploadFiles, async (req, res) => {
  if(!req.isAuthenticated()) return res.send({ ok : false, message : 'User is not authenticated' })

  const { email } = req.user

  try {
    console

    return res.send({ ok : true })
  } catch (e) {
    console.log(e)
  }

  return res.send({ ok : false })
})

user.use('/user', route)

module.exports = user
