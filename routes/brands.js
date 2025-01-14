var express = require('express');
var router = express.Router();
var brandMode = require("../models/brand-model");
const JWT = require('jsonwebtoken');
const config = require("../util/config");
const brandModel = require('../models/brand-model');

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

module.exports = router;