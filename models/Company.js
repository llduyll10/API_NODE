var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var slug = require('mongoose-url-slugs');
// set up a mongoose model
var c = new Schema({
    name: String,
    status:String,
    location:String,
    address:String,
    type:String,
    rangeEmployee:String,
    dateWorking:String,
    timeWorking:String,
    content:String,
    logo:String,
    banner:String,
    position:String,
    rejectedReason:String,
    video:String,
    keyword:String,
    taxCode:String,
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    createdDate:Date,
    modifiedDate:Date,
    isOT:Boolean,
    temp:Object,
    isApproved:Boolean,
    fromCountry:String
});
c.index({name: 'text', keyword: 'text'});
c.plugin(slug('name',{update:true}));
module.exports = mongoose.model('Company', c);