const mongoose = require('mongoose');
const Schema = mongoose.Schema; //equals connection in mongodb
const ObjectId = Schema.ObjectId;

const BillDetails = new Schema({   
    id: {type: ObjectId}, 
    billDetailID: {type: String},
    billID: {type: String},
    phoneID: {type: String},
    status: {type: String, default: "pending"},         // Checking whether the bill is "pending" - admist transporting, "cancelled" - cancelled bill, "sold" - sold
    dateCreated: {type: String},
    quantity: {type: Number}
});

module.exports = mongoose.models.BillDetails || mongoose.model('BillDetails', BillDetails);