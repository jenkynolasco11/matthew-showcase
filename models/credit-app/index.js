var mongoose = require('mongoose')
var Schema = mongoose.Schema

var CreditSchema = new Schema({
    //
    createdBy : { type : Date, default : Date.now }
})

var model = mongoose.model('credit', CreditSchema, 'credit')

module.exports = model
