var mongoose = require('mongoose')
var Schema = mongoose.Schema

var MessageSchema = new Schema({
    name : String,
    email : String,
    phoneNumber : { type : String, index : true },
    subject : String,
    message : String,
    reply : [{
        text : { type : String, default : () => [] },
        createdBy : { type : Date, default : Date.now }
    }],
    reviewedBy : Date,
    reviewed : { type : Boolean, default : () => false, index : true },
    createdBy : { type : Date, index : true, default : Date.now },
    type : { type : String, default : () => 'message' },
    deleted : { type : Boolean, default : () => false, index : true },
})

var model = mongoose.model('message', MessageSchema, 'message')

module.exports = model
