var mongoose = require('mongoose')

var Schema = mongoose.Schema

var DealSubscriptionSchema = new Schema({
    phoneNumber : { type : String, maxlength : 10, minlength : 10, required : true, index : true },
    name : { type : String, required : true, index : true },
    email : { type : String, required : true, index : true },
    reminded : { type : Boolean, default : () => false },
    vehicle : {
        make : String,
        year : Number,
        model : String,
        id : String,
    },
    createdBy : { type : Date, index : true, default : Date.now },

    reviewed : { type : Boolean, default : () => false, index : true },
    reply : [{
        text : { type : String, default : () => [] },
        createdBy : { type : Date, default : Date.now }
    }],
    reviewedBy : Date,
    type : { type : String, default : () => 'subscription' },
    deleted : { type : Boolean, default : () => false, index : true },
})

var model = mongoose.model('dealSubscription', DealSubscriptionSchema, 'dealSubscription')

module.exports = model
