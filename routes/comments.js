var express = require('express');
var router = express.Router();
var commentModel = require("../models/comment-model");
const JWT = require('jsonwebtoken');
const config = require("../util/config");

// 1. Get all comments
router.get("/allComments", async function(req, res, next){
    const authHeader = req.header("Authorization"); // define authHeader
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = req.header("Authorization").split (' ')[1];
        if(token){
            JWT.verify(token, config.SECRETKEY, async function (err, id){
                if(err){
                    res.status(403).json({"status": 403, "err": err});
                }else{  // main activity goes here
                    try {
                        var list = await commentModel.find();
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

// 2. Get all comments for a phone by ID
router.get("/phoneComment", async function(req, res, next){
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

                        // Query the database to get all comments for the given phoneID
                        const comments = await commentModel.find({phoneID: phoneID});
                        // Check if any comments were found
                        if (comments.length === 0) {
                            return res.status(404).json({ status: 404, message: "No comments found for this phoneID" });
                        }

                        // Return the list of comments
                        res.json({totalComment: parseInt(comments.length), comments});
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

// 3. Get all comments by a userID
router.get("/userComment", async function(req, res, next){
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

                        // Query the database to get all comments for the given userID
                        const comments = await commentModel.find({userID: userID});
                        // Check if any comments were found
                        if (comments.length === 0) {
                            return res.status(404).json({ status: 404, message: "No comments found for this userID" });
                        }

                        // Return the list of comments
                        res.json({totalComment: parseInt(comments.length), comments});
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

// 4. Add a new comment
router.post("/comment", async function (req, res) {
    const authHeader = req.header("Authorization"); //define authHeader
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = req.header("Authorization").split(' ')[1];
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (err, id) {
                if (err) {
                    res.status(403).json({ "status": 403, "err": err });
                } else {  //main activity goes here
                    try {
                        const {commentText, userID, phoneID} = req.body;
                        // Create a timestamp using process.hrtime
                        const hrTime = process.hrtime();
                        const milliseconds = hrTime[0] * 1000 + hrTime[1] / 1000000; // Convert seconds and nanoseconds to milliseconds
                        const commentID = Math.floor(milliseconds);
    
                        // Generate the current date in yyyy/MM/dd format
                        const currentDate = new Date();
                        const year = currentDate.getFullYear();
                        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Pad with leading zero if necessary
                        const day = String(currentDate.getDate()).padStart(2, '0'); // Pad with leading zero if necessary
                        const dateCreated = `${year}/${month}/${day}`;

                        const newItem = {   
                            commentID,           // commentID is to be automatically created using the current milliseconds
                            commentText,
                            dateCreated,
                            userID,
                            phoneID
                        };
                        
                        await commentModel.create(newItem);
                        res.status(200).json({
                            status: true,
                            message: "A new comment has been added successfully",
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