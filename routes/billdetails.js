var express = require('express');
var router = express.Router();
var billDetailsModel = require("../models/billdetail-model");
var billModel = require("../models/bill-model");
var phoneModel = require("../models/phone-model");
var userModel = require("../models/user-model");
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
                        var list = await billDetailsModel.find();
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

// 2. Create a new bill detail
router.post("/newBill", async function (req, res) {
    const authHeader = req.header("Authorization"); //define authHeader
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = req.header("Authorization").split(' ')[1];
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (err, id) {
                if (err) {
                    res.status(403).json({ status: 403, err: err });
                } else {  // main activity goes here
                    try {
                        const {billID, phoneID, quantity} = req.body;

                        // Fetch the phone details to get the phonePrice
                        const phone = await phoneModel.findOne({phoneID});
                        if (!phone) {
                            return res.status(404).json({ status: false, message: "Phone not found" });
                        }
                        const { phonePrice, phoneStock } = phone;

                        // Ensure there is enough stock
                        if (phoneStock < quantity) {
                            return res.status(400).json({ status: false, message: "Not enough stock" });
                        }
                        // Calculate the total for this item
                        const itemTotal = phonePrice * quantity;

                        // Create a timestamp using process.hrtime
                        const hrTime = process.hrtime();
                        const milliseconds = hrTime[0] * 1000 + hrTime[1] / 1000000; // Convert seconds and nanoseconds to milliseconds
                        const billDetailID = Math.floor(milliseconds);

                        // Generate the current date in yyyy/MM/dd format
                        const currentDate = new Date();
                        const year = currentDate.getFullYear();
                        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Pad with leading zero if necessary
                        const day = String(currentDate.getDate()).padStart(2, '0'); // Pad with leading zero if necessary
                        const dateCreated = `${year}/${month}/${day}`;

                        // Create the new bill item
                        const newItem = {
                            billDetailID,
                            billID,
                            phoneID,
                            dateCreated,
                            quantity,
                        };

                        await billDetailsModel.create(newItem);

                        // Update the phone stock and phoneInStore
                        const newStock = phoneStock - quantity;
                        const phoneInStore = newStock > 0 ? 1 : 0;
                        await phoneModel.updateOne(
                            { phoneID: phoneID },
                            { $set: { phoneStock: newStock, phoneInStore: phoneInStore } }
                        );

                        // Update the total of the bill in the 'bills' schema
                        const updatedBill = await billModel.findOneAndUpdate(
                            { billID: billID },
                            { $inc: { total: parseFloat(itemTotal) } }, // Increment the total field by itemTotal
                            { new: true } // Return the updated document
                        );

                        if (!updatedBill) {
                            return res.status(404).json({ status: false, message: "Bill not found" });
                        }

                        // Successfully added the item and updated the bill
                        res.status(200).json({
                            status: true,
                            message: "A new detail has been added to the bill and total updated successfully",
                        });
                    } catch (error) {
                        console.error("Error:", error);
                        res.status(500).json({ status: false, message: "An error has occurred" });
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


// 3. List all bill details from a single bill
router.get("/billFullDetails", async function(req, res, next){
    const authHeader = req.header("Authorization"); // define authHeader
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = req.header("Authorization").split (' ')[1];
        if(token){
            JWT.verify(token, config.SECRETKEY, async function (err, id){
                if(err){
                    res.status(403).json({"status": 403, "err": err});
                }else{  // main activity goes here
                    try {
                        const {billID} = req.query; // Extract billID 
                        if (!billID) {
                            return res.status(400).json({ status: 400, message: "billID is required" });
                        }

                        // Query the database to get all bills for the given billID
                        const bills = await billDetailsModel.find({billID: billID});
                        // Check if any bills were found
                        if (bills.length === 0) {
                            return res.status(404).json({ status: 404, message: "No info found for this billID" });
                        }

                        // Return the list of bills
                        res.json({totalPhone: parseInt(bills.length), bills});
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

// 4. List all bill according to their status: pending, cancelled or sold
router.get("/billStatus", async function(req, res, next){
    const authHeader = req.header("Authorization"); // define authHeader
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = req.header("Authorization").split (' ')[1];
        if(token){
            JWT.verify(token, config.SECRETKEY, async function (err, id){
                if(err){
                    res.status(403).json({"status": 403, "err": err});
                }else{  // main activity goes here
                    try {
                        const {status} = req.query; // Extract status 
                        if (!status) {
                            return res.status(400).json({ status: 400, message: "status is required" });
                        }

                        // Query the database to get all bills for the given status
                        const bills = await billDetailsModel.find({status: status});
                        // Check if any bills were found
                        if (bills.length === 0) {
                            return res.status(404).json({ status: 404, message: "No bills found for this status" });
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

// 5. Edit a bill detail
router.post("/edit", async function(req, res, next) {
    const authHeader = req.header("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = req.header("Authorization").split(' ')[1];
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function(err, id) {
                if (err) {
                    res.status(403).json({ "status": 403, "err": err });
                } else {
                    try {
                        const { billDetailID, billID, phoneID, status, quantity } = req.body;

                        if (!billDetailID) {
                            return res.status(400).json({ status: false, message: "billDetailID is required" });
                        }

                        // Fetch the existing bill detail to compare the status
                        const existingBillDetail = await billDetailsModel.findOne({ billDetailID });
                        if (!existingBillDetail) {
                            return res.status(404).json({ status: false, message: "BillDetail not found" });
                        }

                        // Create an object with only the fields that are provided for update
                        const updateData = {};
                        if (billID) updateData.billID = billID;
                        if (phoneID) updateData.phoneID = phoneID;
                        if (quantity) updateData.quantity = quantity;

                        let phoneUpdateNeeded = false;

                        // Fetch the corresponding user by the existing bill ID (assuming billID is linked to users)
                        const bill = await billModel.findOne({ billID: existingBillDetail.billID });
                        const user = await userModel.findOne({ userID: bill.userID });

                        // Case 1: Handle status change
                        if (status && status !== existingBillDetail.status) {
                            phoneUpdateNeeded = true;

                            // Fetch the phone to adjust stock and in-store status
                            const phone = await phoneModel.findOne({ phoneID: existingBillDetail.phoneID });
                            if (!phone) {
                                return res.status(404).json({ status: false, message: "Phone not found" });
                            }

                            // Handle cancellation
                            if (status === "cancelled") {
                                // Add quantity back to stock
                                const newStock = phone.phoneStock + existingBillDetail.quantity;
                                await phoneModel.updateOne(
                                    { phoneID: existingBillDetail.phoneID },
                                    { $set: { phoneStock: newStock, phoneInStore: 1 } }
                                );

                                // Increase user's cancelledAmount
                                await userModel.updateOne(
                                    { userID: user.userID },
                                    { $inc: { cancelledAmount: 1 } }
                                );

                                // If the status was originally sold, decrement boughtAmount
                                if (existingBillDetail.status === "sold") {
                                    await userModel.updateOne(
                                        { userID: user.userID },
                                        { $inc: { boughtAmount: -1 } }
                                    );
                                }

                            } else if (status === "sold") {
                                // Add quantity to phoneSold
                                const newPhoneSold = phone.phoneSold + existingBillDetail.quantity;
                                await phoneModel.updateOne(
                                    { phoneID: existingBillDetail.phoneID },
                                    { $set: { phoneSold: newPhoneSold } }
                                );

                                // Increase user's boughtAmount
                                await userModel.updateOne(
                                    { userID: user.userID },
                                    { $inc: { boughtAmount: 1 } }
                                );

                                // If the status was originally cancelled, decrement cancelledAmount
                                if (existingBillDetail.status === "cancelled") {
                                    await userModel.updateOne(
                                        { userID: user.userID },
                                        { $inc: { cancelledAmount: -1 } }
                                    );
                                }
                            }

                            updateData.status = status;
                        }

                        // Case 2: Handle phoneID or quantity change and update total
                        if (phoneID || quantity) {
                            const oldPhone = await phoneModel.findOne({ phoneID: existingBillDetail.phoneID });
                            const newPhone = phoneID ? await phoneModel.findOne({ phoneID }) : oldPhone;

                            if (!newPhone || !oldPhone) {
                                return res.status(404).json({ status: false, message: "Phone not found" });
                            }

                            // Calculate old total (using current phoneID and quantity)
                            const oldTotal = oldPhone.phonePrice * existingBillDetail.quantity;

                            // Calculate new total (using new phoneID or new quantity)
                            const newTotal = newPhone.phonePrice * (quantity || existingBillDetail.quantity);

                            // Update total in the bills schema
                            await billModel.updateOne(
                                { billID: existingBillDetail.billID },
                                { $inc: { total: -oldTotal + newTotal } }
                            );
                        }

                        // Update the bill details with provided fields
                        const updatedBill = await billDetailsModel.findOneAndUpdate(
                            { billDetailID: billDetailID },
                            { $set: updateData },
                            { new: true }
                        );

                        if (!updatedBill) {
                            return res.status(404).json({ status: false, message: "BillDetail not found" });
                        }

                        res.json({
                            status: true,
                            message: "BillDetail updated successfully",
                        });
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


// 6. Sort all bills by date created or quantity
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
                        // Extract sort option from query parameters 
                        const { sortBy } = req.query;
                        let sortCondition = {};

                        // Define sorting conditions based on the field requested
                        if (sortBy === "dateCreated") {
                        sortCondition = { dateCreated: -1 }; // Sort by dateCreated in descending order
                        } else if (sortBy === "quantity") {
                        sortCondition = { quantity: -1 }; // Sort by quantity in descending order
                        } else {
                        return res.status(400).json({ status: false, message: "Invalid sort option" });
                        }

                        list = await billDetailsModel.find().sort(sortCondition);
                        res.json(list);
                    } catch (error) {
                        res.status(400).json({ status: false, message: "An error has occurred" });
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