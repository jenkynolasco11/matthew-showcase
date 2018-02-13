var mongoose = require('mongoose')
var Schema = mongoose.Schema

var CarSchema = new Schema({
    year: Number,
    make: String,
    model: String,
    configuration : String,
    mileage: Number,
    engine: String,
    transmission: String,
    bodyType: String,
    inColor: String,
    outColor: String,
    fuel: String,
    drivetrain : String,
    price: Number,
    msrp: Number,
    status: String,
    vin: { type : String, max : 17, unique : { index : true }},
    hp : Number,
    description : String,
    overview : String,
    extraFeatures : [ String ],
    isFeatured : { type : Boolean, default : false },
    imgs : [{
        src : String,
        name : String,
        main : Boolean,
    }]
})

var model = mongoose.model('car',CarSchema, 'car')

module.exports = model
