var passport = require('passport')
var Router = require('express').Router
var User = require('../models').User

var route = Router()
var auth = Router()

route.get('/success', function(req, res) {
    var user = req.user || null

    req.login(user, function(err) {
        if(!err) {
            console.log('About to log ' + JSON.stringify(user))
            try {
                return res.status(200).send({ ok : true, user : user.username })
            } catch(e)  {}
        }
        console.log('Error...' + err)
        return res.status(200).send({ ok : false })
    })
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
    var isAuth = req.isAuthenticated()
    var user = isAuth ? req.user.username : null

    console.log('User is ' + (isAuth ? '' : 'not ') + 'authenticated...' + (isAuth ? '\n User --> ' + user : ''))

    return res.status(200).send({ ok : isAuth, user : user })
})

auth.use('/auth', route)

module.exports = auth
