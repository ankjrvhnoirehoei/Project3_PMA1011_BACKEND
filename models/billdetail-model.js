const mongoose = require('mongoose');
const Schema = mongoose.Schema; //equals connection in mongodb
const ObjectId = Schema.ObjectId;

const BillDetails = new Schema({   
    id: {type: ObjectId}, 
    billID: {type: Number},
    phoneID: {type: Number},
    quantity: {type: Number}
});

module.exports = mongoose.models.BillDetails || mongoose.model('BillDetails', BillDetails);