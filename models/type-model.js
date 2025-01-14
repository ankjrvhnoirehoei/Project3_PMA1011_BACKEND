const mongoose = require('mongoose');
const Schema = mongoose.Schema; //equals connection in mongodb
const ObjectId = Schema.ObjectId;

const Type = new Schema({   
    id: {type: ObjectId}, 
    typeID: {type: String},
    type: {type: String}
});

module.exports = mongoose.models.Type || mongoose.model('Type', Type);