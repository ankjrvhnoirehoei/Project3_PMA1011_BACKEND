const mongoose = require('mongoose');
const Schema = mongoose.Schema; //equals connection in mongodb
const ObjectId = Schema.ObjectId;

const Comment = new Schema({   
    id: {type: ObjectId}, 
    commentID: {type: Number},
    commentText: {type: String},
    dateCreated: {type: String},
    deleted: {type: Number},
    userID: {type: Number},
    phoneID: {type: Number}
});

module.exports = mongoose.models.Comment || mongoose.model('Comment', Comment);