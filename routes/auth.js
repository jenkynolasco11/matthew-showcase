const passport = require('passport')
const Router = require('express').Router
const User = require('../models').User

const route = Router()
const auth = Router()

const setEmailToUser = (req, res, next) => {
    if(req.body.email) req.body.user = req.body.email

    return next()
}

route.get('/success', (req, res) => {
    const user = req.user || null

    req.login(user, err => {
        if(!err) {
            console.log(`About to log ${ JSON.stringify(user) }`)
            try {
                return res.status(200).send({ ok : true, user : user.username, name : user.name, email : user.email })
            } catch(e)  {}
        }
        console.log(`Error... ${ err }`)

        return res.status(200).send({ ok : false })
    })
})

route.get('/failure', (req, res) => {
    console.log('something happened...')

    return res.status(200).send({ ok : false, user : null })
})

route.post('/login', setEmailToUser, passport.authenticate('login', {
        successRedirect : '/auth/success',
        failureRedirect : '/auth/failure'
    })
)

route.post('/signup', passport.authenticate('signup', {
        successRedirect : '/auth/success',
        failureRedirect : '/auth/failure'
    })
)

route.get('/logout', (req,res) => {
    console.log('...signing out')
    console.log(req.user)

    req.logout() // Logs out from passport. Deserializes user
    // res.redirect('/admin')
    return res.send({ ok : true})
})

route.get('/is-auth', (req,res) => {
    const isAuth = req.isAuthenticated()

    let usr = null

    if(isAuth) {
        const { name, email, username, phoneNumber } = req.user

        usr = { name, email, username, phoneNumber }
    }

    const user = isAuth ? { ...usr } : null

    console.log(req.user)

    console.log(`User is ${ isAuth ? '' : 'not ' }authenticated... ${ isAuth ? '\n User --> ' + user : '' }`)

    return res.status(200).send({ ok : isAuth, user })
})

auth.use('/auth', route)

module.exports = auth
