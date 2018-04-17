const Router = require('express').Router

const route = Router()
const sellCar = Router()

const models = require('../../models')
const SellCar = models.SellCar

route.get('/all', (req, res) => {
    SellCar.find({
        // TODO: Add search criteria in here
    }).then(sellCar =>  {
        return res.send({ ok : true, sellCar })
    }).catch(err => {
        console.log(err)

        return res.send({ ok : false })
    })
})

route.post('/new-submission', (req, res) => {
    // TODO: This is for the data posting
})

sellCar.use('/sell', route)

module.exports = sellCar
