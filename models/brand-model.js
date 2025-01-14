const mongoose = require('mongoose');
const Schema = mongoose.Schema; //equals connection in mongodb
const ObjectId = Schema.ObjectId;

const Brand = new Schema({   
    id: {type: ObjectId}, 
    brandID: {type: String},
    brand: {type: String}
});

module.exports = mongoose.models.Brand || mongoose.model('Brand', Brand);