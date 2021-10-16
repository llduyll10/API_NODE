var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// set up a mongoose model
var c = new Schema({
    company: { type: Schema.Types.ObjectId, ref: 'Company' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    job: { type: Schema.Types.ObjectId, ref: 'Job' },
    name: String,
    email:String,
    content:String,
    url:String,
    createdDate:Date,
    modifiedDate:Date,
});

module.exports = mongoose.model('Cv', c);