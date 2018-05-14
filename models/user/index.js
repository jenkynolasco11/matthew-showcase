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
    createdBy : { type : Date, index : true, default : Date.now },
    lastLogin : { type : Date, default : Date.now },
    deleted : { type : Boolean, default : () => false, index : true },
})

const UserDetailsSchema = new Schema({
    user: {type: Schema.ObjectId, ref : 'user', unique: { index : true }},
    social : {
        instagram : String,
        facebook : String,
        twitter : String,
    },
    address : { type : {
        street : String,
        city : String,
        state : String,
        zip : String,
    }, default : () => ({ street : '', city : '', state : '', zip : '' })}
})

UserSchema.methods.generateHash = function(pass) {
    return bcrypt.hashSync(pass, bcrypt.genSaltSync(8))
}

UserSchema.methods.validPassword = function(pass) {
    return bcrypt.compareSync(pass, this.password)
}

UserSchema.methods.updateLastLogin = function() {
    this.lastLogin = Date.now()

    return this.save()
}

const detailsModel = mongoose.model('userDetails', UserDetailsSchema, 'userDetails')
const model = mongoose.model('user', UserSchema, 'user')

exports.user = model
exports.userDetails = detailsModel
