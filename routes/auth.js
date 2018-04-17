const passport = require('passport')
const Router = require('express').Router
const User = require('../models').User

const route = Router()
const auth = Router()

route.get('/success', (req, res) => {
    const user = req.user || null

    req.login(user, err => {
        if(!err) {
            console.log(`About to log ${ JSON.stringify(user) }`)
            try {
                return res.status(200).send({ ok : true, user : user.username })
            } catch(e)  {}
        }
        console.log(`Error... ${ err }`)

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

route.get('/logout', (req,res) => {
    // console.log('signing out')

    req.logout() // Logs out from passport. Desserializes user
    res.redirect('/admin')
})

route.get('/is-auth', (req,res) => {
    const isAuth = req.isAuthenticated()
    const user = isAuth ? req.user.username : null

    console.log(`User is ${ isAuth ? '' : 'not ' }authenticated... ${ isAuth ? '\n User --> ' + user : '' }`)

    return res.status(200).send({ ok : isAuth, user })
})

auth.use('/auth', route)

module.exports = auth
