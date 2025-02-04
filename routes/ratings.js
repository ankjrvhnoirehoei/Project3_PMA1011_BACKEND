var express = require('express');
var router = express.Router();
var ratingModel = require("../models/rating-model");
const JWT = require('jsonwebtoken');
const config = require("../util/config");

// 1. Get all ratings
router.get("/allRatings", async function(req, res, next){
    const authHeader = req.header("Authorization"); // define authHeader
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = req.header("Authorization").split (' ')[1];
        if(token){
            JWT.verify(token, config.SECRETKEY, async function (err, id){
                if(err){
                    res.status(403).json({"status": 403, "err": err});
                }else{  // main activity goes here
                    try {
                        var list = await ratingModel.find();
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

// 2. Get all ratings for a phone by ID
router.get("/phoneRating", async function(req, res, next){
    const authHeader = req.header("Authorization"); // define authHeader
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = req.header("Authorization").split (' ')[1];
        if(token){
            JWT.verify(token, config.SECRETKEY, async function (err, id){
                if(err){
                    res.status(403).json({"status": 403, "err": err});
                }else{  // main activity goes here
                    try {
                        const {phoneID} = req.query; // Extract phoneID 
                        if (!phoneID) {
                            return res.status(400).json({ status: 400, message: "phoneID is required" });
                        }

                        // Query the database to get all ratings for the given phoneID
                        const ratings = await ratingModel.find({phoneID: phoneID});
                        // Check if any ratings were found
                        if (ratings.length === 0) {
                            return res.status(404).json({ status: 404, message: "No ratings found for this phoneID" });
                        }

                        // Calculate the average rating value for the phone 
                        const totalRatingValue = ratings.reduce((sum, rating) => sum + rating.ratingValue, 0);
                        const averageRating = totalRatingValue / ratings.length;    // Use .length to get the total amount

                        // Return the list of ratings
                        res.json({averageRating: parseFloat(averageRating.toFixed(2)), ratings});
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

// 3. Get all ratings by a userID
router.get("/userRating", async function(req, res, next){
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

                        // Query the database to get all ratings for the given userID
                        const ratings = await ratingModel.find({userID: userID});
                        // Check if any ratings were found
                        if (ratings.length === 0) {
                            return res.status(404).json({ status: 404, message: "No ratings found for this userID" });
                        }

                        // Return the list of ratings
                        res.json(ratings);
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

// 4. Add a rating for a phone
router.post("/rate", async function (req, res) {
    const authHeader = req.header("Authorization"); //define authHeader
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = req.header("Authorization").split(' ')[1];
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (err, id) {
                if (err) {
                    res.status(403).json({ "status": 403, "err": err });
                } else {  //main activity goes here
                    try {
                        const {userID, phoneID, ratingValue} = req.body;
                        // Create a timestamp using process.hrtime
                        const hrTime = process.hrtime();
                        const milliseconds = hrTime[0] * 1000 + hrTime[1] / 1000000; // Convert seconds and nanoseconds to milliseconds
                        const ratingID = Math.floor(milliseconds);
    
                        const newItem = {   
                            ratingID,           // ratingID is to be automatically created using the current milliseconds
                            userID,
                            phoneID,
                            ratingValue
                        };
                        
                        await ratingModel.create(newItem);
                        res.status(200).json({
                            status: true,
                            message: "A new rating has been added successfully",
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


module.exports = router;