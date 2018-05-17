const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SubmissionSchema = new Schema({
    name: String,
    firstName: String,
    lastName: String,
    middleName: String,
    phoneNumber : { type : String, index : true },
    message: String,
    email: { type: String },
    type : { type: String,  index : true, enum : [ 'message', 'credit', 'sell' ] },
    deleted : { type : Boolean, default : () => false, index : true },
    reply : [{
        text : { type : String, default : () => [] },
        createdBy : { type : Date, default : Date.now }
    }],
    reviewedBy : Date,
    reviewed : { type : Boolean, default : () => false, index : true },
    createdBy : { type : Date, index : true, default : Date.now },
    body: Schema.Types.Mixed
})

const submission = mongoose.model('submission', SubmissionSchema)

module.exports = submission
