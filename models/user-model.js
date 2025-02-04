const mongoose = require('mongoose');
const Schema = mongoose.Schema; //equals connection in mongodb
const ObjectId = Schema.ObjectId;
const User = new Schema({   
    id: {type: ObjectId}, // default id in mongodb
    userID: {type: String}, // ID by user
    username: {             // username syntax
        type: String, 
        required: true, 
        unique: true, 
        trim: true, 
        minlength: 3, 
        maxlength: 50,
        default: 'No name' 
    },
    password: {             // password syntax
        type: String,
        minlength: 6,
        required: true
    },
    address: {type: String}, // address of user
    avatarImg: {type: String, default: ""},  // img url from image-model
    starredUser: {type: Number, default: 0}, // marked user that is considered as a vip
    phoneNumber: {type: String}, 
    boughtAmount: {type: Number, default: 0}, // amount of phone bought
    cancelledAmount: {type: Number, default: 0}, // amount of phone cancelled that counts towards the penalty
    bannedUser: {type: Number, default: 0}, // check if the user is banned, which will prevent them from using the account
    vouchersOwned: {type: [String], default: []} // Set default as an empty array
});

module.exports = mongoose.models.User || mongoose.model('User', User);