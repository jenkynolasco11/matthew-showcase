const passport = require('passport')
const { sendEmail } = require('../mailer')
const { contactUs : contactUsTemplate } = require('../email-templates')
const { jydDefaults } = require('../mailConfig').keys
const Router = require('express').Router
const multer = require('multer')
// const path = require('path')
// const fs = require('fs')
const models = require('../models')

const { User, UserDetails, ChatMessage : Chat, Submission : Message, BuiltCar, Car } = models

// const carsFile = fs.readFileSync(path.resolve(__dirname, './cars-file-2.json'), 'utf8')

const storage = multer.diskStorage({
  destination : (req, file, cb) => {
    cb(null, './static/user-uploads')
  },
  filename : (req, file, cb) => {
    const { username : uname } = req.user
    const { originalname : fname } = file

    const newFileName = `${ uname } - ${ fname }`
    // console.log(newFileName)
    cb(null, newFileName)
  }
})

const uploads= multer({ storage })

const route = Router()
const user = Router()

function checkIfAuthenticated(req, res, next) {
  if(!req.isAuthenticated()) return res.send({ ok : false })

  return next()
}

function checkIfAdmin(req, res, next) {
  if(!req.isAuthenticated()) return res.send({ ok : false })
  else if(req.user.type !== 'admin' ) return res.send({ ok : false, message : 'Please, contact an Administrator for JYD Auto Leasing' })

  return next()
}

async function createUserDetails(user) {
  try {
    const details = new UserDetails({
      referrals : [],
      files : [],
      user,
      social : {
        twitter : '',
        facebook : '',
        instagram : '',
      },
      address : {
        street : '',
        city : '',
        state : '',
        zip : '',
      }
    })

    await details.save()

    return details
  } catch (e) {
    console.log(e)
  }

  throw new Error(`Error while creating UserDetails model for user => ${ user.username }`)
}

const capitalize = st => {
  try {
      return st.split(' ').map(n => n[ 0 ].toUpperCase() + n.slice(1)).join(' ')
  } catch (e) {
      console.log(e)
  }

  console.log(`THERE WAS AN ERROR WHILE TRYING TO CAPITALIZE: ${ st }`)

  return ''
}

route.post('/social', checkIfAuthenticated, async (req, res) => {
  const { _id : user } = req.user
  const {
    instagram = '',
    facebook = '',
    twitter = '',
    street = '',
    city = '',
    state = '',
    zip = '',
    name = '',
    phoneNumber = '',
  } = req.body

  const data = {
    user,
    social : {
      instagram,
      facebook,
      twitter
    },
    address : {
      street,
      city,
      state,
      zip
    }
  }

  try {
    const usr = await User.findOneAndUpdate({ _id : user }, { name, phoneNumber }, { new : true })
    const doc = await UserDetails.findOneAndUpdate({ user }, data, { upsert : true, new : true }).lean()
  // , (err, _doc) => {
  //   if(err) return res.send({ ok : false, user : req.user })

    let completion = 2

    // const doc = _doc.toJSON()

    Object.keys(doc.social).forEach(n => completion += +(doc.social[ n ] !== '') )
    Object.keys(doc.address).forEach(n => completion += +(doc.address[ n ] !== '') )

    // console.log(doc)
    // console.log(completion)

    return res.send({ ok : true, message : 'Information Updated', completion })

  } catch (e) {
    console.log(e)
  }

  return res.send({ ok : false })
})

route.get('/all', checkIfAdmin, async (req, res) => {
  const { skip = 0, limit = 10 } = req.query

  try {
    const projection = { createdBy : 1, email : 1, name : 1, phoneNumber : 1 }

    const count = await User.count({ type : 'customer' })
    const users = await User.find({ type : 'customer' }, projection).sort({ createdBy : -1 }).skip(+skip).limit(+limit).lean()

    return res.send({ ok : true, users, count })
  } catch (e) {
    console.log(e)
  }

  return res.send({ ok : false })
})

route.get('/info/:id', /*checkIfAdmin,*/ async (req, res) => {
  const { id : user } = req.params

  try {
    const { email } = await User.findById(user).lean()

    const userdetails = await UserDetails.findOne({ user }).lean()
    const cars = await Car.find({ likedBy : user }).lean()
    const emails = await Message.find({ email }).lean()
    const builds = await BuiltCar.find({ email }).lean()

    console.log(emails, builds, userdetails)
    // const messages = await Chat.find({  })

    return res.send({ ok : true, emails, builds, userdetails, cars })

  } catch (e) {
    console.log(e)
  }

  return res.send({ ok : false })
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
    const userdetails = await UserDetails.findOne({ user }, { files : 1, _id : 0 })

    const files = userdetails.files

    const fnames = files.map(({ path, name }) => ({
        name : name.replace(new RegExp(email + ' - ', 'i'), ''),
        path : path.replace(/^static\//,'')
    }))

    return res.send({ ok : true, fnames })
  } catch (e) {
    console.log(e)
  }

  return res.send({ ok : false })
})

async function uploadFiles(req, res, next) {
  const { _id : user } = req.user
  const { files : fls } = req

  const files = fls.map(f => {
    const { filename : name, path, mimetype : type, size } = f

    return { name, path, type, size }
  })

  try {
    let details = await UserDetails.findOne({ user })

    if(!details) details = await createUserDetails(user)

    const oldFiles = [].concat(details.files ? details.files : [])

    // console.log('FILES=>\n', JSON.stringify(files, null, 2))
    // console.log('NEW FILES=>\n',JSON.stringify(oldFiles, null, 2))

    const filter = []
    oldFiles.forEach(x => filter.push(x.name))

    const newFiles = [].concat(...oldFiles, [ ...files ].filter(n => !filter.includes(n.name)))

    details.files = newFiles

    // console.log('DETAILS=>\n',JSON.stringify(details, null, 2))

    await details.save()

    return res.send({ ok : true })
  } catch (e) {
    console.log(e)
  }
  return res.send({ ok : false })
}

route.post('/files', checkIfAuthenticated, uploads.array('files[]'), uploadFiles)

route.post('/referral-program', checkIfAuthenticated, async(req, res) => {
  const { name, phone : phoneNumber, email } = req.body
  const { _id : user } = req.user

  try {
    const newReferral = {
      name : name.toLowerCase(),
      phoneNumber : phoneNumber.toLowerCase(),
      email : email.toLowerCase()
    }

    let details = await UserDetails.findOne({ user })

    if(!details) details = await createUserDetails(user)

    const oldReferrals = [].concat(details.referrals ? details.referrals : [])

    const newReferrals = [].concat(oldReferrals, newReferral)

    details.referrals = newReferrals

    await details.save()

    const emailBody = {
      from : `${ req.user.name } <${ req.user.email }>`,
      to : jydDefaults.to,
      bcc : jydDefaults.bcc,
      subject : `New Referral from ${ req.user.name }`,
      // html : contactUsTemplate(
      html : `
          <div>
            <h2>New Referral from ${ capitalize(req.user.name) }</h2>
            <hr />
          </div>
          <div style="width:100%;">
            <p style="width:100%;padding:10px 30px 4px;font-size:20px;">Referral's Information:</p>
            <div style="width:100%;border:1px solid #eee;margin-bottom:10px;"></div>
            <p style="width:100%;padding:0 30px 4px;"><strong>Name: </strong>${ name }</p>
            <p style="width:100%;padding:0 30px 4px;"><strong>Phone Number: </strong>${ phoneNumber}</p>
            <p style="width:100%;padding:0 30px 4px;"><strong>Email: </strong> ${ email }</p>
          </div>
        `
    }

    sendEmail(emailBody, (err, c) => {
      if(err) return console.log(err)

      console.log(`AN EMAIL WAS SENT FROM: ${ req.user.email }`)

      return res.send({ ok : true })
    })

  } catch (e) {
    console.log(e)
    return res.send({ ok : false })
  }
})
user.use('/user', route)

module.exports = user
