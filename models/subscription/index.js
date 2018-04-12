var mongoose = require('mongoose')

var Schema = mongoose.Schema

var SubscriptionSchema = new Schema({
    name : { type : String, require : true, index : true },
    email : { type : String, required : true, index : true },
    createdBy : { type : Date, default : Date.now },
})

var model = mongoose.model('subscription', SubscriptionSchema, 'subscription')

module.exports = model
