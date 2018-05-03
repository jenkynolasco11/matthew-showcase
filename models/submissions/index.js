var mongoose = require('mongoose')
var Schema = mongoose.Schema


var SubmissionSchema = new Schema({
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
    createdBy : { type : Date, default : Date.now },
    body: Schema.Types.Mixed
})

var submission = mongoose.model('submission', SubmissionSchema)


module.exports = {
    submission,
    SubmissionSchema
}