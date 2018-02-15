var passport = require('passport')
var Router = require('express').Router
var User = require('../models').User

var route = Router()
var auth = Router()

route.get('/success', function(req, res) {
    // console.log(req)
    // console.log('SESS => ' + JSON.stringify(req.sessionStore.sessions))
    // console.log('USER => ' + req.user)
    // console.log('toto....')
    var user = req.user || null

    req.login(user, function(err) {
        if(!err) {
            try {
                return res.status(200).send({ ok : true, user : user.username })
            } catch(e)  {}
        }
        console.log('Error...' + err)
        return res.status(200).send({ ok : false })
    })
    // console.log(req.session)
    // console.log('S_ID => ' + req.sessionID )
    // console.log(req)
})

route.get('/failure', function(req, res) {
    console.log('something happened...')

    return res.status(200).send({ ok : false, user : null })
})

route.post('/login', passport.authenticate('login', {
        successRedirect : '/auth/success',
        failureRedirect : '/auth/failure'
    })
)

route.get('/logout', function(req,res) {
    console.log('signing out')

    req.logout() // Logs out from passport. Desserializes user
    res.redirect('/admin')
})

route.get('/is-auth', function(req,res) {
    // console.log(req)
    // console.log(req.session)
    // console.log(req.cookies)
    var isAuth = req.isAuthenticated()
    var user = isAuth ? req.user.username : null
    console.log(req.user)
    console.log(isAuth)

    return res.status(200).send({ ok : isAuth, user : user })
})

auth.use('/auth', route)

module.exports = auth
