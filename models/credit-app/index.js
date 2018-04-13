var mongoose = require('mongoose')
var Schema = mongoose.Schema

var CreditSchema = new Schema({
    //
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
    agreedToTerms : Boolean,
    reachedOut : { type : Boolean, default : () => false },
    createdBy : { type : Date, default : Date.now }
})

var model = mongoose.model('credit', CreditSchema, 'credit')

module.exports = model
