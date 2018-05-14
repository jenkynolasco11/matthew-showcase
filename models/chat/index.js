var mongoose = require('mongoose')
var Schema = mongoose.Schema

var ChatSchema = new Schema({
    from : String,
    to : String,
    msg : String,
    timestamp : { type : Date, index : true, index : true },
    name : { type : String, index : true },
    email : { type : String, index : true },
    read : { type : Boolean, default : () => false, index : true },
})

// var ChatInfoSchema = new Schema({
//     unread : [{
//         name : String,
//         email : String,
//         count : Number
//     }]
// })

// var ChatInfoSchema = mongoose.model('chatInfo', ChatInfoSchema, 'chatInfo')
var ChatMessage = mongoose.model('chat', ChatSchema, 'chat')

module.exports = {
    ChatMessage,
    // ChatInfoSchema
}
