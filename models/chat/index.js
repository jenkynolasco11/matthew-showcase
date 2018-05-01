var mongoose = require('mongoose')
var Schema = mongoose.Schema

var ChatSchema = new Schema({
    from : String,
    to : String,
    msg : String,
    timestamp : { type : Date, index : true },
    name : { type : String, index : true },
    email : { type : String, index : true }
})

var model = mongoose.model('chat', ChatSchema, 'chat')

module.exports = model
