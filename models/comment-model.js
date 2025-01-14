const mongoose = require('mongoose');
const Schema = mongoose.Schema; //equals connection in mongodb
const ObjectId = Schema.ObjectId;

const Comment = new Schema({   
    id: {type: ObjectId}, 
    commentID: {type: String},
    commentText: {type: String},
    dateCreated: {type: String},
    deleted: {type: Number},
    userID: {type: String},
    phoneID: {type: String}
});

module.exports = mongoose.models.Comment || mongoose.model('Comment', Comment);