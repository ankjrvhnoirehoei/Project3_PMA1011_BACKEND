const mongoose = require('mongoose');
const Schema = mongoose.Schema; //equals connection in mongodb
const ObjectId = Schema.ObjectId;

const Image = new Schema({   
    id: {type: ObjectId}, 
    imgID: {type: Number},      // ID by the creation date
    img: {type: String}         // image URL (base64)
});

module.exports = mongoose.models.Image || mongoose.model('Image', Image);