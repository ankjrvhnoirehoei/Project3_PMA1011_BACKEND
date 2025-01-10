var express = require('express');
var router = express.Router();
var phoneModel = require("../models/phone-model");
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

                            const { phoneName, phonePrice, phoneBrand, phoneType, phoneSold, phoneDescription, phoneStock, phoneWarranty, phoneInStore } = req.body;

                            const hrTime = process.hrtime();
                            const milliseconds = hrTime[0] * 1000 + hrTime[1] / 1000000; // Convert seconds and nanoseconds to milliseconds
                            const phoneID = Math.floor(milliseconds);

                            // NOTE: in the frontend must set default values as follow: phoneSold: 0, phoneInStore: 1
                            const newItem = { phoneID, image: base64Images, phoneName, phonePrice, phoneBrand, phoneType, phoneSold, phoneDescription, phoneStock, phoneWarranty, phoneInStore };

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


module.exports = router;