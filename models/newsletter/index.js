var mongoose = require('mongoose')

var Schema = mongoose.Schema

var NewsletterSchema = new Schema({
    name : { type : String, require : true, index : true },
    email : { type : String, required : true, index : true },
    newslettersSent : { type : Number, default : () => 0 },
    createdBy : { type : Date, default : Date.now },
    type : { type : String, default : () => 'newsletter' },
    deleted : { type : Boolean, default : () => false, index : true },
})

var model = mongoose.model('newsletter', NewsletterSchema, 'newsletter')

module.exports = model
