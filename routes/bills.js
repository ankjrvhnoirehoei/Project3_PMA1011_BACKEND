var express = require('express');
var router = express.Router();
var billModel = require("../models/bill-model");
const JWT = require('jsonwebtoken');
const config = require("../util/config");

module.exports = router;