var mongoose = require('mongoose')

var Schema = mongoose.Schema

var ReferSchema = new Schema({
    from : { type : String, index : true, required : true },
    to : { type : String, index : true, required : true },
    message : String,
    reminded : { type : Boolean, default : () => false },
    referCode : { type : String, index : true, required : true },
    createdBy : { type : Date, default : Date.now }
})

var model = mongoose.model('refer', ReferSchema, 'refer')

module.exports = model
