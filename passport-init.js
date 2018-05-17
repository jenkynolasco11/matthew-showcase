const LocalStrategy = require('passport-local').Strategy
const bCrypt = require('bcrypt')
const mongoose = require('mongoose')

const { sendEmail } = require('./mailer')
const { to : toMail, bcc : toBccMail } = require('./mailConfig').keys.jydDefaults

const capitalize = st => st.split(' ').map(n => n[ 0 ].toUpperCase() + n.slice(1)).join(' ')

module.exports = (passport) => {
    const User = mongoose.model('user')
    const UserDetails = mongoose.model('userDetails')

    passport.serializeUser((user, done) => {
        return done(null, user._id)
    })

    passport.deserializeUser((id, done) => {
        return User.findById(id, done)
    })

    passport.use('login', new LocalStrategy({
        usernameField: 'user',
        passwordField: 'pass',
        passReqToCallback: true
    }, async (req, username, pass, done) => {
        const { token = '' } = req.body

        try {
            const user = await User.findOne({ username })

            if(!user) {
                console.log('Username not found by name: ' + username)
                return done(null, false, 'There is no user registered under that email')
            }

            else if (!user.validPassword(pass)) {
                console.log('Password incorrect')
                return done(null, false, 'Password Is Incorrect')
            }

            // console.log(`User => ${ user.type }`)
            // console.log(`Token => ${token}`)
            // console.log(token === 'admin' && user.type !== 'customer')
            if(token === 'admin' && user.type !== 'admin') return done(null, false, 'Not an Admin')

            user.updateLastLogin()

            return done(null, user)
        } catch (e) {
            return done(e)
        }
    }))

    passport.use('signup', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'pass',
        passReqToCallback : true
    }, async (req, email, pass, done) => {
        try {
            //
            const { name, email, pass, phoneNumber } = req.body

            const user = await User.findOne({ $or : [{ email }, { username : email }, { phoneNumber } ]})

            if(user) {
                // console.log(`User ${ email } already exists...`)
                // console.log(user.validPassword(pass))
                // console.log(`Password does${ user.validPassword(pass) ? '' : 'n\'t' } match`)

                if(user.validPassword(pass)) {
                    // console.log('Password is valid... Signing in...')
                    user.updateLastLogin()

                    return done(null, user)
                }

                return done('User and password don\'t match', null, { info : 'Invalid Password' })
            }

            const newUser = new User({
                email,
                name,
                phoneNumber : phoneNumber.replace(/\D/g, ''),
                type : 'customer',
                username : email,
            })

            newUser.password = newUser.generateHash(pass)

            await newUser.save()

            const userDetails = new UserDetails({
                user : newUser._id,
                social : { instagram : '', facebook : '', twitter : '' },
                address : { street : '', city : '', state : '', zip : '' },
                files : []
            })

            await userDetails.save()

            sendEmail({
                from : `New Registration from ${ capitalize(name) }`,
                to : toMail,
                bcc : toBccMail,
                text : `
                    New user registered!

                    Name: ${ capitalize(name) }
                    Email: ${ email }
                    Phone Number: ${ phoneNumber }
                `
            })

            console.log(`New User ${ email } has registered!`)

            return done(null, newUser)
            //
        } catch (e) {
            console.log('got here...')
            return done(e)
        }
    }))
/*
    // passport.use('signup', new LocalStrategy({
    //     usernameField: 'username',
    //     passwordField: 'password',
    //     passReqToCallback: true
    // }, function (req, username, password, done) {
    //     // console.log('here, trying to sign up...')
    //     User.findOne({
    //         username: username
    //     }, function (err, user) {
    //         if (err) return done(err)
    //         if (user) {
    //             console.log('User already exists')
    //             return done(null, false)
    //         }

    //         var newuser = new User()

    //         newuser.username = username
    //         newuser.password = newuser.generateHash(password)
    //         newuser.email = req.body.email

    //         newuser.save(function (err, user) {
    //             if (err) {
    //                 console.log('error in saving user ' + err)
    //                 throw err //return done(err)
    //             }
    //             console.log(user.username + ' registration successful!')
    //             return done(null, user)
    //         })
    //     })
    // }))

    // var isValidPass = function(user, pass){
    //   return bCrypt.compareSync(pass, user.password)
    // }
    //
    // var createHash = function(pass){
    //   return bCrypt.hashSync(password, bCrypt.genSaltSync(8))
    // }
*/
}
