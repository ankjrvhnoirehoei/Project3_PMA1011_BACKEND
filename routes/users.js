var express = require('express');
var router = express.Router();
var userModel = require("../models/user-model");
const JWT = require('jsonwebtoken');
const config = require("../util/config");

router.post('/signup', async function(req, res) {
  try { 
    const { username, password, address, avatarImg, starredUser, phoneNumber, boughtAmount, cancelledAmount, bannedUser, vouchersOwned } = req.body;
    // Create a timestamp using process.hrtime
    const hrTime = process.hrtime();
    const milliseconds = hrTime[0] * 1000 + hrTime[1] / 1000000; // Convert seconds and nanoseconds to milliseconds
    const userID = Math.floor(milliseconds);
    const newUser = new userModel({   //NOTE: in the frontend must set defaul values for those as follow: avatarImg: 0, starredUser: 0, boughtAmount: 0, cancelledAmount: 0, bannedUser: 0, vouchersOwned: []
      userID,           // userID is to be automatically created using the current milliseconds
      username,
      password,
      address,
      avatarImg,
      starredUser,
      phoneNumber,
      boughtAmount,
      cancelledAmount,
      bannedUser,
      vouchersOwned
    });

    const savedUser = await newUser.save();
    const token = JWT.sign({ id: savedUser._id }, config.SECRETKEY, { expiresIn: '3000s' });
    const refreshToken = JWT.sign({ id: savedUser._id }, config.SECRETKEY, { expiresIn: '1h' });

    res.status(201).json({ status: true, message: 'User created successfully', token: token, refreshToken: refreshToken });
  } catch (error) {
    res.status(400).json({ status: false, message: 'Error creating user: ' + error });
  }
});

router.post("/login", async function (req, res) {
  try {
    const {username, password} = req.body;
    const chkUser = await userModel.findOne({username: username, password: password});
    if (chkUser == null) {
      res.status(404).json({status: false, message: "login failed"});
    } else {
      const token = JWT.sign({id: userModel._id}, config.SECRETKEY,{expiresIn: '3000s'});
      const refreshToken = JWT.sign({id: userModel._id}, config.SECRETKEY,{expiresIn: '1h'});
      res.status(200).json({status: true, message: "login successfully", token: token, refreshToken: refreshToken});
    }
  } catch (error) {
    res.status(404).json({status: false, message: "an error has occured " + error});
    console.log(config.SECRETKEY);
  }
});

module.exports = router;
