var mongoose = require('mongoose')
var Schema = mongoose.Schema

var CreditSchema = new Schema({
    code : { type : String, required : true },
    firstname : String,
    lastname : String,
    middlename : String,
    phoneNumber : String,
    dob : Date,
    ssn : String,
    email : String,
    street : String,
    city : String,
    state : String,
    zip : String,
    homeOwnership : { type : String, enum : [ 'OWN', 'RENT', 'OTHER' ] },
    yearsLivingInPlace : Number,
    monthsLivingInPlace : Number,
    monthlyRent : Number,
    previousAddress : String,
    driverLicense : {
        number : String,
        stateIssued : String,
        expirationDate : Date,
    },
    employement : {
        employerName : String,
        employerAddress : String,
        employerYearsAtWork : Number,
        employerMonthsAtWork : Number,
        montlyIncome : Number,
    },
    previousEmployer : String,
    agreedToTerms : { type : Boolean, index : true },
    // reachedOut : { type : Boolean, default : () => false, index : true },
    reviewed : { type : Boolean, default : () => false, index : true },
    createdBy : { type : Date, default : Date.now },
    type : { type : String, default : () => 'credit' },
    reply : [{
        text : { type : String, default : () => [] },
        createdBy : { type : Date, default : Date.now }
    }],
    reviewedBy : Date,
    deleted : { type : Boolean, default : () => false, index : true },
})

var model = mongoose.model('credit', CreditSchema, 'credit')

module.exports = model
