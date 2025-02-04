const mongoose = require('mongoose');
const Schema = mongoose.Schema; //equals connection in mongodb
const ObjectId = Schema.ObjectId;

const Bill = new Schema({   
    id: {type: ObjectId}, 
    billID: {type: String},
    userID: {type: String},
    total: {type: Number, default: 0},
});

module.exports = mongoose.models.Bill || mongoose.model('Bill', Bill);