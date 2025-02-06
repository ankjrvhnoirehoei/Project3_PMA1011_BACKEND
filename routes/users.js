var express = require('express');
var router = express.Router();
var userModel = require("../models/user-model");
const JWT = require('jsonwebtoken');
const config = require("../util/config");
const multer = require('multer');
// Configure multer
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
}).array('avatarImg', 1); // 'avatarImg' is the field name, 5 is max count

// 1. signup for new users
router.post('/signup', async function(req, res) {
  try { 
    const { username, password, address, phoneNumber } = req.body;
    // Create a timestamp using process.hrtime
    const hrTime = process.hrtime();
    const milliseconds = hrTime[0] * 1000 + hrTime[1] / 1000000; // Convert seconds and nanoseconds to milliseconds
    const userID = Math.floor(milliseconds);
    const newUser = new userModel({   //NOTE: in the frontend must set defaul values for those as follow: avatarImg: "", starredUser: 0, boughtAmount: 0, cancelledAmount: 0, bannedUser: 0, vouchersOwned: []
      userID,           // userID is to be automatically created using the current milliseconds
      username,
      password,
      address,
      phoneNumber,
    });

    const savedUser = await newUser.save();
    const token = JWT.sign({ id: savedUser._id }, config.SECRETKEY, { expiresIn: '3000s' });
    const refreshToken = JWT.sign({ id: savedUser._id }, config.SECRETKEY, { expiresIn: '1h' });

    res.status(201).json({ status: true, message: 'User created successfully', token: token, refreshToken: refreshToken });
  } catch (error) {
    res.status(400).json({ status: false, message: 'Error creating user: ' + error });
  }
});

// 2. login for existing users
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

// 3. view all users as admin
router.get("/allUsers", async function(req, res, next){
    const authHeader = req.header("Authorization"); // define authHeader
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = req.header("Authorization").split (' ')[1];
        if(token){
            JWT.verify(token, config.SECRETKEY, async function (err, id){
                if(err){
                    res.status(403).json({"status": 403, "err": err});
                }else{  // main activity goes here    
                    try {     
                      var list = await userModel.find();
                      res.status(200).json(list);
                    } catch (error) {
                        res.json({status: false, message: "an error has occured"});
                    }
                }
            });
        } else{
            res.status(401).json({status: 401, message: "Token is missing"});
        }
    } else {
        res.status(401).json({status: 401, message: "Authorization header missing or malformed"});
    }
});

// 4. Edit a user's info
router.post("/edit", async function(req, res, next){
  const authHeader = req.header("Authorization"); // define authHeader
  if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = req.header("Authorization").split (' ')[1];
      if(token){
          JWT.verify(token, config.SECRETKEY, async function (err, id){
              if(err){
                  res.status(403).json({"status": 403, "err": err});
              }else{  // main activity goes here
                // Handle file upload
                upload(req, res, async function (err) {
                  if (err instanceof multer.MulterError) {
                      return res.status(400).json({
                          status: false,
                          message: "Upload error: " + err.message
                      });
                  } else if (err) {
                      return res.status(500).json({
                          status: false,
                          message: "Unknown error: " + err.message
                      });
                  }      
                  
                  try {
                    const {userID, username, password, address, starredUser, phoneNumber, boughtAmount, cancelledAmount, bannedUser, vouchersOwned} = req.body;  // Extract fields to update

                    // Validate userID is provided
                    if (!userID) {
                      return res.status(400).json({ status: false, message: "UserID is required" });
                    }
        
                    // Create an object with only the fields that are provided for update
                    const updateData = {};
                    if (username) updateData.username = username;
                    if (password) updateData.password = password;
                    if (starredUser) updateData.starredUser = starredUser;
                    if (address) updateData.address = address;
                    if (boughtAmount) updateData.boughtAmount = boughtAmount;
                    if (cancelledAmount) updateData.cancelledAmount = cancelledAmount;
                    if (bannedUser) updateData.bannedUser = bannedUser;
                    if (vouchersOwned) updateData.vouchersOwned = vouchersOwned;
                    if (vouchersOwned === "" || vouchersOwned === null || vouchersOwned === undefined) {
                      updateData.vouchersOwned = []; // Treat empty as null
                    }
                    if (phoneNumber) updateData.phoneNumber = phoneNumber;
                    // Process the avatarImg only if an image is uploaded
                    if (req.files && req.files.length > 0) {
                      const file = req.files[0]; // Only process the first uploaded file
                      updateData.avatarImg = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
                    }

                    // Find the user by userID and update the provided fields
                    const updatedUser = await userModel.findOneAndUpdate(
                      { userID: userID },      // Search by userID
                      { $set: updateData },     // Update only the fields provided in req.body
                      { new: true }             // Return the updated document
                    );
        
                    // If the user is not found
                    if (!updatedUser) {
                      return res.status(404).json({ status: false, message: "User not found" });
                    }
        
                    // Successfully updated
                    res.json({
                      status: true,
                      message: "User updated successfully",
                      // updatedUser: updatedUser
                    });
                  } catch (error) {
                      res.json({status: false, message: "an error has occured"});
                  }
                });
              }
          });
      } else{
          res.status(401).json({status: 401, message: "Token is missing"});
      }
  } else {
      res.status(401).json({status: 401, message: "Authorization header missing or malformed"});
  }
});

// 5. Search for a user by username or address
router.get("/findUsers", async function (req, res) {
  const authHeader = req.header("Authorization"); // define authHeader
  if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = req.header("Authorization").split (' ')[1];
      if(token){
          JWT.verify(token, config.SECRETKEY, async function (err, id){
              if(err){
                  res.status(403).json({"status": 403, "err": err});
              }else{  // main activity goes here
                try {
                  const {searchUsers} = req.body;
                  if (!searchUsers) {
                      return res.status(400).json({ status: false, message: "Search parameter is required" });
                  }

                  // Use regex to search for both username and address
                  const regex = new RegExp(searchUsers, 'i'); // 'i' makes it case-insensitive

                  var list = await userModel.find({
                    $or: [ // Search both fields using $or
                      { username: { $regex: regex } },  // Search in username
                      { address: { $regex: regex } }    // Search in address
                    ]
                  });

                  res.json(list);
                  } catch (error) {
                      res.json({status: false, message: "an error has occured"});
                  }
              }
          });
      } else{
          res.status(401).json({status: 401, message: "Token is missing"});
      }
  } else {
      res.status(401).json({status: 401, message: "Authorization header missing or malformed"});
  }
});

// 6. Sort by bought amount, cancelled amount, or numbers of vouchers
router.get("/sort", async function (req, res) {
  const authHeader = req.header("Authorization"); // define authHeader
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = req.header("Authorization").split(' ')[1];
    if (token) {
      JWT.verify(token, config.SECRETKEY, async function (err, id) {
        if (err) {
          res.status(403).json({ "status": 403, "err": err });
        } else { // main activity goes here
          try {
            // Extract sort option from query parameters (instead of req.body)
            const { sortBy } = req.query;
            let sortCondition = {};

            // Define sorting conditions based on the field requested
            if (sortBy === "boughtAmount") {
              sortCondition = { boughtAmount: -1 }; // Sort by boughtAmount in descending order
            } else if (sortBy === "cancelledAmount") {
              sortCondition = { cancelledAmount: -1 }; // Sort by cancelledAmount in descending order
            } else if (sortBy === "vouchersOwned") {
              sortCondition = { vouchersCount: -1 }; // Sort by the length of vouchersOwned in descending order
            } else {
              return res.status(400).json({ status: false, message: "Invalid sort option" });
            }

            // If sorting by vouchersOwned, add a field with the array length
            const aggregatePipeline = [];
            if (sortBy === "vouchersOwned") {
              aggregatePipeline.push({
                $addFields: { vouchersCount: { $size: "$vouchersOwned" } } // Add field for sorting by array size
              });
            }

            // Add the sorting condition to the pipeline or apply directly to find
            aggregatePipeline.push({ $sort: sortCondition });

            // Execute the query using aggregation if vouchersOwned is included, otherwise use normal find with sort
            let list;
            if (sortBy === "vouchersOwned") {
              list = await userModel.aggregate(aggregatePipeline);
            } else {
              list = await userModel.find().sort(sortCondition);
            }

            res.json(list);

          } catch (error) {
            res.status(400).json({ status: false, message: "An error has occurred" });
          }
        }
      });
    } else {
      res.status(401).json({ status: 401, message: "Token is missing" });
    }
  } else {
    res.status(401).json({ status: 401, message: "Authorization header missing or malformed" });
  }
});


module.exports = router;
