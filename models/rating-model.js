const mongoose = require('mongoose');
const Schema = mongoose.Schema; //equals connection in mongodb
const ObjectId = Schema.ObjectId;

const Rating = new Schema({   
    id: {type: ObjectId}, 
    ratingID: {type: Number},
    userID: {type: Number}, 
    phoneID: {type: Number}, 
    ratingValue: {type: Number}
});

module.exports = mongoose.models.Rating || mongoose.model('Rating', Rating);