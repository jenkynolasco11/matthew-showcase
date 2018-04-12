var mongoose = require('mongoose')
var Schema = mongoose.Schema

var MessageSchema = new Schema({

})

var model = mongoose.model('message', MessageSchema, 'message')

module.exports = model
