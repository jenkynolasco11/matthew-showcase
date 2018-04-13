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

/*
    "type": "Credit App",
    "Salesman's Name": "abcdef",
    "First Name": "Jenky",
    "Last Name": "Nolasco",
    "Middle Name": "",
    "DOB Month": "1",
    "DOB Day": "1",
    "DOB Year": "2018",
    "SSN": "3082133002",
    "Day Time Phone": "3479742990",
    "email": "jenky_nolasco@hotmail.com",
    "Address": "116 Sherman Ave",
    "City": "New York",
    "State": "NY",
    "ZIP Code": "10034",
    "Home Type": "Own",
    "Years Living There": "",
    "Months Living There": "",
    "Previous Address": "116 Sherman Ave",
    "Monthly Payment": "1200",
    "Driver's Licence Number": "ytls-1902340123",
    "Driver's State": "NY",
    "Driver's License Expiration Date Month": "2",
    "Driver's License Expiration Date Day": "10",
    "Driver's License Expiration Date Year": "2028",
    "Employer's Name": "Jenky wilmer nolasco nicasio 11",
    "Employer's Phone": "3479742990",
    "Job Title": "Dev",
    "Employer's Address": "116 Sherman Ave",
    "Employee Years": "",
    "Employee Months": "",
    "Previous Employer": "JN Web Services",
    "Monthly Income": "1499",
    "agree": "1"
*/
