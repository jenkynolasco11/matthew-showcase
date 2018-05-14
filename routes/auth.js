const passport = require('passport')
const Router = require('express').Router
const User = require('../models').User

const route = Router()
const auth = Router()

const setEmailToUser = (req, res, next) => {
    if(req.body.email) req.body.user = req.body.email

    return next()
}

const setToLowercase = (req, res, next) => {
    console.log(req.body)
    if(req.body.name) req.body.name = req.body.name.toLowerCase()

    req.body.email = req.body.email.toLowerCase()

    next()
}

route.get('/success', (req, res) => {
    // console.log(req)
    const user = req.user || null

    req.login(user, err => {
        if(err) return res.send({ ok : false })

        console.log(`About to log ${ JSON.stringify(user, null, 2) }`)

        const { _id, email, name, phoneNumber, username, type } = user

        if(type === 'admin') return res.send({ ok : true, redirectTo : '/admin' })

        return res.send({ ok : true, user : { _id, email, name, phoneNumber, username }})

        // console.log(`Error... ${ err }`)
    })
})

route.get('/failure', (req, res) => {
    console.log(req)
    return res.status(200).send({ ok : false, user : null, msg : 'Username and Password doesn\'t match' })
})

route.post('/login', setToLowercase, setEmailToUser, passport.authenticate('login', {
        successRedirect : '/auth/success',
        failureRedirect : '/auth/failure'
    })
)

route.post('/signup', setToLowercase, (req, res, next) =>
    passport.authenticate('signup', {
        successRedirect : '/auth/success',
        failureRedirect : '/auth/failure'
    }, (err, user, msg ) => {
        console.log(err, user, msg)
        if(err) return res.send({ ok : false, msg : 'User Already Registered. Invalid Password' })

        req.login(user, err => {
            if(err) return res.send({ ok : false })

            const { _id, email, name, phoneNumber, username } = user

            return res.send({ ok : true, user : { _id, email, name, phoneNumber, username }})
        })
    })(req, res, next)
)

route.get('/logout', (req,res) => {
    console.log('...signing out')
    // console.log(req.user)

    req.logout() // Logs out from passport. Deserializes user
    // res.redirect('/admin')
    return res.send({ ok : true})
})

route.get('/is-auth', (req,res) => {
    const isAuth = req.isAuthenticated()

    let usr = null

    if(isAuth) {
        const { _id, name, email, username, phoneNumber } = req.user

        usr = { _id, name, email, username, phoneNumber }
    }

    const user = isAuth ? { ...usr } : null

    console.log(req.user)

    console.log(`User is ${ isAuth ? '' : 'not ' }authenticated... ${ isAuth ? '\n User --> ' + user : '' }`)

    return res.status(200).send({ ok : isAuth, user })
})

auth.use('/auth', route)

module.exports = auth
