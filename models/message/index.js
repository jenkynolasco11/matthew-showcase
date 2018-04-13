var mongoose = require('mongoose')
var Schema = mongoose.Schema

var MessageSchema = new Schema({
    name : String,
    email : String,
    phoneNumber : String,
    subject : String,
    message : String,
    read : { type : Boolean, default : () => false },
    createdBy : { type : Date, default : Date.now },
})

var model = mongoose.model('message', MessageSchema, 'message')

module.exports = model
