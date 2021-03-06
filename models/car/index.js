const mongoose = require('mongoose')
const Schema = mongoose.Schema

const referenceCarSchema = new Schema({
    modelId: String,
    modelMakeId: { type : String, index : true },
    model: { type : String, index : true },
    modelTrim: { type : String, index : true },
    modelYear: { type : String, index : true },
    modelBody: String,
    modelEnginePosition: String,
    modelEngineCC: String,
    modelEngineCyl: String,
    modelEngineType: String,
    modelEngineValvesPerCyl: String,
    modelEnginePowerPs: String,
    modelEnginePowerRPM: String,
    modelEngineTorqueNm: String,
    modelEngineTorqueRPM: String,
    modelEngineBoreMM: String,
    modelEngineStroke_mm: String,
    modelEngineCompression: String,
    modelEngineFuel: String,
    modelTopSpeedKPH: String,
    modelTopSpeedMPH: String,
    modelCeroToOneHundred: String,
    modelDrive: String,
    modelTransmission_type: String,
    modelSeats: String,
    modelDoors: String,
    modelWeightKG: String,
    modelLengthMM: String,
    modelWidthMM: String,
    modelHeightMM: String,
    modelWheelbaseMM: String,
    modelLkmHwy: String,
    modelLkmMixed: String,
    modelLkmCity: String,
    modelFuelCapL: String,
    modelSoldInUS: Boolean,
    modelCO2: String,
    modelMakeDisplay: String
});

const CarSchema = new Schema({
    id : { type : String, required : true, unique : { index : true }},
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
    vin: { type : String, max : 17 },
    hp : Number,
    description : [ String ],
    overview : String,
    extraFeatures : [ String ],
    isFeatured : { type : Boolean, default : false },
    imgs : [{
        src : String,
        name : String,
        main : Boolean,
    }],
    likedBy : [ String ],
    createdBy : { type : Date, index : true, default : Date.now },
    deleted : { type : Boolean, default : () => false },
    hasBluetooth : { type : Boolean, default : () => false },
    hasNavigation : { type : Boolean, default : () => false },
    hasBackupCamera : { type : Boolean, default : () => false },
    hasSunroof : { type : Boolean, default : () => false },
    hasLeatherSeats : { type : Boolean, default : () => false },
    hasSatelliteCameras : { type : Boolean, default : () => false },
})

const BuiltCarSchema = new Schema({
    firstname : String,
    lastname : String,
    phone : { type : String, index : true },
    email : { type : String, index : true },
    hasLease : String,
    isVeteran : String,
    isGraduate : String,
    hasTradeIn : String,
    downPayment : String,
    options : {
        year : Number,
        make : String,
        model : String,
        invoice : String,
        dest : String,
        msrp : String,
        trim : String,
        optionsPrice : String,
        selectedOptions : []
    },
    url : String,
    reply : [{
        text : { type : String, default : () => [] },
        createdBy : { type : Date, default : Date.now }
    }],
    reviewedBy : Date,
    reviewed : { type : Boolean, default : () => false, index : true },
    createdBy : { type : Date, default : Date.now },
    type : { type : String, default : () => 'build' },
    deleted : { type : Boolean, default : () => false, index : true },
})

const ReferenceCar = mongoose.model('referenceCar', referenceCarSchema)
const Car = mongoose.model('car', CarSchema, 'car')
const BuiltCar = mongoose.model('builtCar', BuiltCarSchema, 'builtCar')

module.exports = { Car, BuiltCar, ReferenceCar }
