const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const Schema = mongoose.Schema

const UserSchema = new Schema({
    username : { type : String, index : { unique : true }},
    password : { type : String, required : true },
    type : { type : String, required : true, index : true, enum : [ 'admin', 'customer' ] },
    name : { type : String, required : true },
    phoneNumber : { type : String, required : true, unique : { index : true }},
    email : { type : String, required : true, unique : { index : true }},
    createdBy : { type : Date, default : Date.now },
    deleted : { type : Boolean, default : () => false, index : true },
})

// const UserClientSchema = new Schema({
//     username : { type : String, index : { unique : true }}
// })

UserSchema.methods.generateHash = function(pass) {
    return bcrypt.hashSync(pass, bcrypt.genSaltSync(8))
}

UserSchema.methods.validPassword = function(pass) {
    return bcrypt.compareSync(pass, this.password)
}

const model = mongoose.model('user', UserSchema, 'user')

module.exports = model
