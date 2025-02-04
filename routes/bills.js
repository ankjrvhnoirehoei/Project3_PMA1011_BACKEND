var express = require('express');
var router = express.Router();
var billModel = require("../models/bill-model");
const JWT = require('jsonwebtoken');
const config = require("../util/config");

// 1. Get all bills
router.get("/all", async function(req, res, next){
    const authHeader = req.header("Authorization"); // define authHeader
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = req.header("Authorization").split (' ')[1];
        if(token){
            JWT.verify(token, config.SECRETKEY, async function (err, id){
                if(err){
                    res.status(403).json({"status": 403, "err": err});
                }else{  // main activity goes here
                    try {
                        var list = await billModel.find();
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

// 2. Create a new bill
router.post("/newBill", async function (req, res) {
    const authHeader = req.header("Authorization"); //define authHeader
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = req.header("Authorization").split(' ')[1];
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (err, id) {
                if (err) {
                    res.status(403).json({ "status": 403, "err": err });
                } else {  //main activity goes here
                    try {
                        const {userID} = req.body;
                        // Create a timestamp using process.hrtime
                        const hrTime = process.hrtime();
                        const milliseconds = hrTime[0] * 1000 + hrTime[1] / 1000000; // Convert seconds and nanoseconds to milliseconds
                        const billID = Math.floor(milliseconds);

                        const newItem = {   
                            billID,           // billID is to be automatically created using the current milliseconds
                            userID
                        };
                        
                        await billModel.create(newItem);
                        res.status(200).json({
                            status: true,
                            message: "A new bill has been made successfully",
                        });
                    } catch (error) {
                        res.json({status: false, message: "an error has occured"});
                    }
                }
            }); // Closing the JWT.verify callback
        } else {
            res.status(401).json({ status: 401, message: "Token is missing" });
        }
    } else {
        res.status(401).json({ status: 401, message: "Authorization header missing or malformed" });
    }
});

// 3. List all bill from a user
router.get("/userBill", async function(req, res, next){
    const authHeader = req.header("Authorization"); // define authHeader
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = req.header("Authorization").split (' ')[1];
        if(token){
            JWT.verify(token, config.SECRETKEY, async function (err, id){
                if(err){
                    res.status(403).json({"status": 403, "err": err});
                }else{  // main activity goes here
                    try {
                        const {userID} = req.query; // Extract userID 
                        if (!userID) {
                            return res.status(400).json({ status: 400, message: "userID is required" });
                        }

                        // Query the database to get all bills for the given userID
                        const bills = await billModel.find({userID: userID});
                        // Check if any bills were found
                        if (bills.length === 0) {
                            return res.status(404).json({ status: 404, message: "No bills found for this userID" });
                        }

                        // Return the list of bills
                        res.json({totalBill: parseInt(bills.length), bills});
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

// 4. Edit a bill, mostly the total
router.post("/edit", async function(req, res, next){
  const authHeader = req.header("Authorization"); // define authHeader
  if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = req.header("Authorization").split (' ')[1];
      if(token){
          JWT.verify(token, config.SECRETKEY, async function (err, id){
              if(err){
                  res.status(403).json({"status": 403, "err": err});
              }else{  // main activity goes here                  
                  try {
                    const {billID, userID, total} = req.body;  // Extract fields to update

                    // Validate billID is provided
                    if (!billID) {
                      return res.status(400).json({ status: false, message: "billID is required" });
                    }
        
                    // Create an object with only the fields that are provided for update
                    const updateData = {};
                    if (userID) updateData.userID = userID;
                    if (total) updateData.total = total;
                    // if (status === "sold") {
                    //     // Generate the current date in yyyy/MM/dd format
                    //     const currentDate = new Date();
                    //     const year = currentDate.getFullYear();
                    //     const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Pad with leading zero if necessary
                    //     const day = String(currentDate.getDate()).padStart(2, '0'); // Pad with leading zero if necessary
                    //     const dateUpdated = `${year}/${month}/${day}`;
                    //     updateData.dateCreated = dateUpdated;
                    //     updateData.status = status;
                    // } else if (status !== undefined && status !== null && status !== "") {
                    //     updateData.status = status;
                    // };

                    // Update the bill through the provided fields
                    const updatedBill = await billModel.findOneAndUpdate(
                      { billID: billID },      // Search by billID
                      { $set: updateData },     // Update only the fields provided in req.body
                      { new: true }             // Return the updated document
                    );
        
                    // If not found
                    if (!updatedBill) {
                      return res.status(404).json({ status: false, message: "Bill not found" });
                    }
        
                    // Successfully updated
                    res.json({
                      status: true,
                      message: "Bill updated successfully",
                      // updatedBill: updatedBill
                    });
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

// 5. Sort all bills by total
router.get("/sort", async function (req, res) {
    const authHeader = req.header("Authorization"); //define authHeader
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = req.header("Authorization").split (' ')[1];
        if(token){
            JWT.verify(token, config.SECRETKEY, async function (err, id){
                if(err){
                    res.status(403).json({"status": 403, "err": err});
                }else{  //main activity goes here
                    try {
                        var list = await billModel.find().sort({total: -1});
                        res.status(200).json(list);
                    } catch (error) {
                        res.status(400).json({status: false, message: "an error has occured"});
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

module.exports = router;