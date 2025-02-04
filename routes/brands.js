var express = require('express');
var router = express.Router();
var brandModel = require("../models/brand-model");
const JWT = require('jsonwebtoken');
const config = require("../util/config");

// 1. add a new phone brand
router.post("/add", async function (req, res) {
    const authHeader = req.header("Authorization"); //define authHeader
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = req.header("Authorization").split(' ')[1];
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (err, id) {
                if (err) {
                    res.status(403).json({ "status": 403, "err": err });
                } else {  //main activity goes here
                    const { brand } = req.body;
                    // Create a timestamp using process.hrtime
                    const hrTime = process.hrtime();
                    const milliseconds = hrTime[0] * 1000 + hrTime[1] / 1000000; // Convert seconds and nanoseconds to milliseconds
                    const brandID = Math.floor(milliseconds);

                    const newItem = {   
                        brandID,           // brandID is to be automatically created using the current milliseconds
                        brand
                    };
                    
                    await brandModel.create(newItem);
                    res.status(200).json({
                        status: true,
                        message: "New brand was created successfully",
                    });
                }
            }); // Closing the JWT.verify callback
        } else {
            res.status(401).json({ status: 401, message: "Token is missing" });
        }
    } else {
        res.status(401).json({ status: 401, message: "Authorization header missing or malformed" });
    }
});

// 2. List out all brands
router.get("/allBrands", async function(req, res, next){
    const authHeader = req.header("Authorization"); // define authHeader
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = req.header("Authorization").split (' ')[1];
        if(token){
            JWT.verify(token, config.SECRETKEY, async function (err, id){
                if(err){
                    res.status(403).json({"status": 403, "err": err});
                }else{  // main activity goes here    
                    try {     
                      var list = await brandModel.find();
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

// 3. Edit a brand's info
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
                    const {brandID, brand} = req.body;  // Extract fields to update

                    // Validate brandID is provided
                    if (!brandID) {
                      return res.status(400).json({ status: false, message: "brandID is required" });
                    }
        
                    // Create an object with only the fields that are provided for update
                    const updateData = {};
                    if (brand) updateData.brand = brand;

                    // Find by brandID and update the provided fields
                    const update = await voucherModel.findOneAndUpdate(
                      { brandID: brandID },      // Search by brandID
                      { $set: updateData },     // Update only the fields provided in req.body
                      { new: true }             // Return the updated document
                    );
        
                    // If the voucher is not found
                    if (!update) {
                      return res.status(404).json({ status: false, message: "voucher not found" });
                    }
        
                    // Successfully updated
                    res.json({
                      status: true,
                      message: "voucher updated successfully",
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

// 4. Search for a brand by name
router.get("/find", async function (req, res) {
  const authHeader = req.header("Authorization"); // define authHeader
  if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = req.header("Authorization").split (' ')[1];
      if(token){
          JWT.verify(token, config.SECRETKEY, async function (err, id){
              if(err){
                  res.status(403).json({"status": 403, "err": err});
              }else{  // main activity goes here
                try {
                    const {search} = req.body;
                    if (!search) {
                      return res.status(400).json({status: false, message: "Search parameter is required"});
                    }
                  
                    // Use regex to search approximately
                    const regex = new RegExp(search, 'i'); // 'i' makes it case-insensitive
                  
                    // Use $regex 
                    var list = await brandModel.find({brand: {$regex: regex}});
                    res.json(list);
                  } catch (error) {
                    res.json({status: false, message: "An error has occurred"});
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

// 5. Sort all brands by name
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
                        var list = await brandModel.aggregate([
                            {$addFields: {brand_lower: {$toLower: "$brand"}}},
                            {$sort: {brand_lower: 1}}
                        ]);
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