const mongoose = require('mongoose');
const Schema = mongoose.Schema; //equals connection in mongodb
const ObjectId = Schema.ObjectId;

const Voucher = new Schema({   
    id: {type: ObjectId}, 
    voucherID: {type: Number}, 
    voucherName: {type: String},
    monetaryValue: {type: String}
});

module.exports = mongoose.models.Voucher || mongoose.model('Voucher', Voucher);