var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var slug = require('mongoose-url-slugs');
// set up a mongoose model
var c = new Schema({
    name: String,
    company: { type: Schema.Types.ObjectId, ref: 'Company' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    slug:String,
    type:String,
    location:String,
    status:String,
    address:String,
    rangeSalary:String,
    dateWorking:String,
    timeWorking:String,
    description:String,
    keyword:String,
    content:String,
    level:String,
    tags:Array,
    rejectedReason:String,
    createdDate:Date,
    modifiedDate:Date,
});
c.plugin(slug('name',{update:true}));
c.index({name: 'text', keyword: 'text'});
module.exports = mongoose.model('Job', c);