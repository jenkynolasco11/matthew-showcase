var mongoose = require('mongoose')

var Schema = mongoose.Schema

var DealSubscriptionSchema = new Schema({
    phoneNumber : { type : String, maxlength : 10, minlength : 10, required : true, index : true },
    name : { type : String, required : true, index : true },
    email : { type : String, required : true, index : true },
    reminded : { type : Boolean, default : () => false },
    createdBy : { type : Date, default : Date.now }
})

var model = mongoose.model('dealSubscription', DealSubscriptionSchema, 'dealSubscription')

module.exports = model
