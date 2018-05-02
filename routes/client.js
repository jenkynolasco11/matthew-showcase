const passport = require('passport')

const User = require('../models').User

const route = Router()
const client = Router()
/*
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
*/
client.use('/client', route)

module.exports = client
