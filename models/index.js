var mongoose = require('mongoose')
var Schema = mongoose.Schema

var Car = require('./car')
var User = require('./user')
var Subscription = require('./subscription')
var Refer = require('./refer')

var MetaSchema = new Schema({
    lastCarId : { type : Number, default : 0 }
})

var Meta = mongoose.model('meta', MetaSchema, 'meta')

module.exports = {
    Car,
    User,
    Meta,
    Subscription,
    Refer,
}
