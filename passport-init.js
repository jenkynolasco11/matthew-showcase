var LocalStrategy = require('passport-local').Strategy
var bCrypt = require('bcrypt')
var mongoose = require('mongoose')

module.exports = function (passport) {
    var User = mongoose.model('user')

    passport.serializeUser(function (user, done) {
        // console.log('here' + id)
        return done(null, user._id)
    })

    passport.deserializeUser(function (id, done) {
        return User.findById(id, done)
    })

    passport.use('login', new LocalStrategy({
        usernameField: 'user',
        passwordField: 'pass',
        passReqToCallback: true
    }, function (req, user, pass, done) {
        // console.log('here...')
        User.findOne({ username : user }, function (err, usr) {
            if (err) return done(err)
            if (!usr) {
                console.log('Username not found by name: ' + user)
                return done(null, false)
            }
            if (!usr.validPassword(pass)) {
                console.log('Password incorrect')
                return done(null, false)
            }

            return done(null, usr)
        })
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
