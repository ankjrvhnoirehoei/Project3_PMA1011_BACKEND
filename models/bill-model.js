const mongoose = require('mongoose');
const Schema = mongoose.Schema; //equals connection in mongodb
const ObjectId = Schema.ObjectId;

const Bill = new Schema({   
    id: {type: ObjectId}, 
    billID: {type: Number},
    userID: {type: Number},
    total: {type: Number},
    dateCreated: {type: String},
});

module.exports = mongoose.models.Bill || mongoose.model('Bill', Bill);