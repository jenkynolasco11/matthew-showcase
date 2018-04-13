var mongoose = require('mongoose')
var Schema = mongoose.Schema

var Car = require('./car')
var User = require('./user')
var Newsletter = require('./newsletter')
var Refer = require('./refer')
var DealSubsription = require('./deal-sub')
var CreditApp = require('./credit-app')

var MetaSchema = new Schema({
    lastCarId : { type : Number, default : 0 }
})

var Meta = mongoose.model('meta', MetaSchema, 'meta')

module.exports = {
    Car,
    User,
    Meta,
    Newsletter,
    Refer,
    CreditApp,
    DealSubsription
}
