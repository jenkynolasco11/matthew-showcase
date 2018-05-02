var mongoose = require('mongoose')
var bcrypt = require('bcrypt')

var Schema = mongoose.Schema

var UserSchema = new Schema({
    username : { type : String, index : { unique : true }},
    password : { type : String, required : true },
    type : { type : String, required : true, index : true, enum : [ 'admin', 'user' ] },
    name : { type : String, required : true },
    email : { type : String, required : true, unique : { index : true }},
    createdBy : { type : Date, default : Date.now },
    deleted : { type : Boolean, default : () => false, index : true },
})

UserSchema.methods.generateHash = function(pass) {
    return bcrypt.hashSync(pass, bcrypt.genSaltSync(8))
}

UserSchema.methods.validPassword = function(pass) {
    return bcrypt.compareSync(pass, this.password)
}

var model = mongoose.model('user', UserSchema, 'user')

module.exports = model
