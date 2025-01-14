const mongoose = require('mongoose');
const Schema = mongoose.Schema; //equals connection in mongodb
const ObjectId = Schema.ObjectId;
const Phone = new Schema({                  // Note: all ID are to be defined as Long in java, as taken by the milliseconds of created date
    id: {type: ObjectId},                   // default id in mongodb
    phoneID: {type: String},                // ID by phone
    image: [{type: String}],               // refer to the images of the phone
    phoneColor: [{type: String}],           // phone's colors
    phoneName: {type: String},              // phone's official name
    phonePrice: {type: Number},             // phone's price of 1 (million VND)
    phoneBrand: {type: String},             // phone's brand (Apple, Android, etc)
    phoneType: {type: String},              // phone's type (Smartphone, Feature phone, gaming phone, etc)
    phoneSold: {type: Number},              // phones that have been accepted and paid for
    phoneDescription: {type: String},       // phone's description that will be displayed in details 
    phoneStock: {type: Number},             // the amount left in stock
    phoneWarranty: {type: Number},          // phone's warranty amount, in months
    phoneInStore: {type: Number},           // Boolean check if the phone is still available in store for sale
});

module.exports = mongoose.models.Phone || mongoose.model('Phone', Phone);