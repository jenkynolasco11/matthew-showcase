var mongoose = require('mongoose')
var Schema = mongoose.Schema

// TODO: Add types, constrains, etc

var SellSchema = new Schema({
    firstname : String,
    lastname : String,
    phoneNumber : String,
    email : String,
    year : Number,
    make : String,
    model : String,
    mileage : Number,
    condition : String,
    vin : { type : String, max : 17 },
    // reminded : { type : Boolean, default : () => 0, index : true },
    reviewed : { type : Boolean, default : () => 0, index : true },
    createdBy : { type : Date, default : Date.now }
})

var model = mongoose.model('sell', SellSchema, 'sell')

module.exports = model
