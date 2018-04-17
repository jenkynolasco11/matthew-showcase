const Router = require('express').Router
const Newsletter = require('../../models').Newsletter

const route = Router()
const newsletter = Router()

route.post('/new', (req, res) => {
    const { body } = req

    Newsletter.update({ email : body.email }, { ...body }, { upsert : true, setDefaultsOnInsert : true }, (err, doc) => {
        if(err) return res.send({ ok : false })

        return res.send({ ok : true })
    })
})

newsletter.use('/newsletter', route)

module.exports = newsletter
