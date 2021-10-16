var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// set up a mongoose model
var c = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    title:String,
    content:String,
    url:String,
    status:String,
    createdDate:Date,
    modifiedDate:Date,
});

module.exports = mongoose.model('Pdf', c);