var mongoose = require('mongoose')
var Schema = mongoose.Schema

var CarSchemas = require('./car')
var Car = CarSchemas.Car
var BuiltCar = CarSchemas.BuiltCar
var User = require('./user')
var Newsletter = require('./newsletter')
var Refer = require('./refer')
var DealSubsription = require('./deal-sub')
var CreditApp = require('./credit-app')
var Message = require('./message')
var SellCar = require('./sell-car')
var ChatMessage = require('./chat')
var Submission = require('./submissions').submission;

var MetaSchema = new Schema({
    lastCarId : { type : Number, default : 0 }
})

var Meta = mongoose.model('meta', MetaSchema, 'meta')

module.exports = {
    Car,
    BuiltCar,
    User,
    Meta,
    Newsletter,
    Refer,
    CreditApp,
    DealSubsription,
    Message,
    SellCar,
    ChatMessage,
    Submission
}
