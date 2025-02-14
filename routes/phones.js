var express = require('express');
var router = express.Router();
var phoneModel = require("../models/phone-model");
var typeModel = require("../models/type-model");
var brandModel = require("../models/brand-model");
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
}).array('image', 5); // 'images' is the field name, 5 is max count

// 1. get all phones for displaying in the home pages
router.get("/home", async function(req, res, next){
    const authHeader = req.header("Authorization"); // define authHeader
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = req.header("Authorization").split (' ')[1];
        if(token){
            JWT.verify(token, config.SECRETKEY, async function (err, id){
                if(err){
                    res.status(403).json({"status": 403, "err": err});
                }else{  // main activity goes here
                    try {
                        var list = await phoneModel.find();
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

// 2. add new phones to the store
router.post("/add", async function (req, res) {
    const authHeader = req.header("Authorization"); //define authHeader
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = req.header("Authorization").split(' ')[1];
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (err, id) {
                if (err) {
                    res.status(403).json({ "status": 403, "err": err });
                } else {  //main activity goes here
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
                            // Check if file exists
                            if (!req.files || req.files.length === 0) {
                                return res.status(400).json({
                                    status: false,
                                    message: "No images uploaded"
                                });
                            }

                            // Convert all images to base64
                            const base64Images = req.files.map(file =>
                                `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
                            );

                            const { phoneColor, phoneName, phonePrice, phoneBrand, phoneType, phoneDescription, phoneWarranty, phoneStock } = req.body;

                            const hrTime = process.hrtime();
                            const milliseconds = hrTime[0] * 1000 + hrTime[1] / 1000000; // Convert seconds and nanoseconds to milliseconds
                            const phoneID = Math.floor(milliseconds);

                            // NOTE: in the frontend must set default values as follow: phoneSold: 0, phoneInStore: 1
                            const newItem = { phoneID, image: base64Images, phoneColor, phoneName, phonePrice, phoneBrand, phoneType, phoneDescription, phoneWarranty, phoneStock };

                            await phoneModel.create(newItem);
                            res.status(200).json({
                                status: true,
                                message: "New phone was created successfully",
                            });
                        } catch (error) {
                            res.status(400).json({ status: false, message: "An error has occurred - " + error });
                        }
                    }); // Closing the upload function's callback
                }
            }); // Closing the JWT.verify callback
        } else {
            res.status(401).json({ status: 401, message: "Token is missing" });
        }
    } else {
        res.status(401).json({ status: 401, message: "Authorization header missing or malformed" });
    }
});

// 3. Edit a phone's info
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
                    const {phoneID, image, phoneColor, phoneName, phonePrice, phoneBrand, phoneType, phoneSold, phoneDescription, phoneStock, phoneWarranty, phoneInStore} = req.body;  // Extract fields to update

                    // Validate phoneID is provided
                    if (!phoneID) {
                      return res.status(400).json({ status: false, message: "phoneID is required" });
                    }

                    // Find the phone by phoneID
                    const existingPhone = await phoneModel.findOne({ phoneID: phoneID });
                    if (!existingPhone) {
                        return res.status(404).json({ status: false, message: "Phone not found" });
                    }
        
                    // Create an object with only the fields that are provided for update
                    const updateData = {};
                    if (phoneName) updateData.phoneName = phoneName;
                    if (phonePrice) updateData.phonePrice = phonePrice;
                    if (phoneBrand) updateData.phoneBrand = phoneBrand;
                    if (phoneType) updateData.phoneType = phoneType;
                    if (phoneSold) updateData.phoneSold = phoneSold;
                    if (phoneDescription) updateData.phoneDescription = phoneDescription;
                    if (phoneStock) updateData.phoneStock = phoneStock;
                    if (phoneWarranty) updateData.phoneWarranty = phoneWarranty;
                    if (phoneInStore) updateData.phoneInStore = phoneInStore;
                    // Handle phoneColor array, only update if phoneColor is included in request
                    if (phoneColor !== undefined) {
                        if (phoneColor === "" || phoneColor === null) {
                        updateData.phoneColor = []; // Empty array if explicitly set to null or empty
                        } else {
                        updateData.phoneColor = phoneColor; // Update to provided value
                        }
                    }

                    // Handle image uploads and append to existing images
                    if (req.files && req.files.length > 0) {
                        const newImages = req.files.map(file => `data:${file.mimetype};base64,${file.buffer.toString('base64')}`);
                        updateData.image = existingPhone.image ? [...existingPhone.image, ...newImages] : newImages; // Append new images to existing array
                    }

                    // Update the phone phoneID and update the provided fields
                    const updatedPhone = await phoneModel.findOneAndUpdate(
                      { phoneID: phoneID },      // Search by phoneID
                      { $set: updateData },     // Update only the fields provided in req.body
                      { new: true }             // Return the updated document
                    );
        
                    // If not found
                    if (!updatedPhone) {
                      return res.status(404).json({ status: false, message: "Phone not found" });
                    }
        
                    // Successfully updated
                    res.json({
                      status: true,
                      message: "Phone updated successfully",
                      // updatedPhone: updatedPhone
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

// 4. Search for phones by type, brand, name
router.get("/findPhones", async function (req, res) {
    const authHeader = req.header("Authorization"); // define authHeader
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = req.header("Authorization").split(' ')[1];
      if (token) {
        JWT.verify(token, config.SECRETKEY, async function (err, id) {
          if (err) {
            res.status(403).json({ "status": 403, "err": err });
          } else {  // main activity goes here
            try {
              const {searchPhones} = req.body;
              if (!searchPhones) {
                return res.status(400).json({ status: false, message: "Search parameter is required" });
              }
  
              // Create a case-insensitive regex from the search term
              const regex = new RegExp(searchPhones, 'i'); // 'i' for case-insensitive search
  
              // Perform aggregation with lookups to join brand and type names
              const phones = await phoneModel.aggregate([
                {
                  $lookup: {
                    from: 'brands', // Collection name of brands
                    localField: 'phoneBrand', // Field storing the brand ID in phones
                    foreignField: 'brandID', // Field storing the brand ID in brands
                    as: 'brandDetails' // Alias for the joined brand data
                  }
                },
                {
                  $lookup: {
                    from: 'types', // Collection name of types
                    localField: 'phoneType', // Field storing the type ID in phones
                    foreignField: 'typeID', // Field storing the type ID in types
                    as: 'typeDetails' // Alias for the joined type data
                  }
                },
                {
                  $match: { // Match based on regex for phoneName, brand name, or type name
                    $or: [
                      { phoneName: { $regex: regex } }, // Search in phoneName
                      { "brandDetails.name": { $regex: regex } }, // Search in brand name (brandDetails.name)
                      { "typeDetails.name": { $regex: regex } } // Search in type name (typeDetails.name)
                    ]
                  }
                },
                {
                  $unwind: "$brandDetails" // Unwind brand details to make data flat
                },
                {
                  $unwind: "$typeDetails" // Unwind type details to make data flat
                }
              ]);
  
              res.json(phones);
            } catch (error) {
              res.json({ status: false, message: "An error has occurred" });
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

// 5. Sort all phones by price, sold amount or the amount left in stock
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
            // Extract sort option from query parameters 
            const { sortBy } = req.query;
            let sortCondition = {};

            // Define sorting conditions based on the field requested
            if (sortBy === "phonePrice") {
              sortCondition = { phonePrice: -1 }; // Sort by phonePrice in descending order
            } else if (sortBy === "phoneSold") {
              sortCondition = { phoneSold: -1 }; // Sort by phoneSold in descending order
            } else if (sortBy === "phoneStock") {
              sortCondition = { phoneStock: -1 }; // Sort by the length of phoneStock in descending order
            } else {
              return res.status(400).json({ status: false, message: "Invalid sort option" });
            }

            list = await phoneModel.find().sort(sortCondition);
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

// 6. get 1 phone for displaying in the product detail pages
router.get("/onePhone", async function(req, res, next){
  const authHeader = req.header("Authorization"); // define authHeader
  if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = req.header("Authorization").split (' ')[1];
      if(token){
          JWT.verify(token, config.SECRETKEY, async function (err, id){
              if(err){
                  res.status(403).json({"status": 403, "err": err});
              }else{  // main activity goes here
                  try {
                      const { phoneID } = req.query;
                      var onePhone = await phoneModel.findOne({phoneID : phoneID});
                      res.status(200).json(onePhone);
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

module.exports = router;