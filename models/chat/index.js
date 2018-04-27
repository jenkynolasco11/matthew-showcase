var mongoose = require('mongoose')
var Schema = mongoose.Schema

var ChatSchema = new Schema({
    from : { type : String, index : true },
    to : { type : String, index : true },
    message : { type : String },
    timestamp : { type : Date, index : true },
    clientEmail : { type : String, index : true },
})

var model = mongoose.model('chat', ChatSchema, 'chat')

module.exports = model
