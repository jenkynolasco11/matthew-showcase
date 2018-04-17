var mongoose = require('mongoose')
var Schema = mongoose.Schema

var MessageSchema = new Schema({
    name : String,
    email : String,
    phoneNumber : { type : String, index : true },
    subject : String,
    message : String,
    read : { type : Boolean, default : () => false, index : true },
    createdBy : { type : Date, default : Date.now },
})

var model = mongoose.model('message', MessageSchema, 'message')

module.exports = model
