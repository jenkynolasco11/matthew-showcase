var mongoose = require('mongoose')
var Schema = mongoose.Schema

var CarSchemas = require('./car')
var Car = CarSchemas.Car
var BuiltCar = CarSchemas.BuiltCar
var { user : User, userDetails : UserDetails } = require('./user')
var Newsletter = require('./newsletter')
var Refer = require('./refer')
var DealSubsription = require('./deal-sub')
var CreditApp = require('./credit-app')
var Message = require('./message')
var SellCar = require('./sell-car')
var Chat = require('./chat')
var ChatMessage = Chat.ChatMessage
var ChatStats = Chat.ChatInfoSchema
var Submission = require('./submissions')

var MetaSchema = new Schema({
    lastCarId : { type : Number, default : 0 }
})

var Meta = mongoose.model('meta', MetaSchema, 'meta')

module.exports = {
    Car,
    User,
    Meta,
    Refer,
    SellCar,
    Message,
    BuiltCar,
    CreditApp,
    ChatStats,
    Submission,
    Newsletter,
    ChatMessage,
    UserDetails,
    DealSubsription,
}
