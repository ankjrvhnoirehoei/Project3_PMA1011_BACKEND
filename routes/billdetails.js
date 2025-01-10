var express = require('express');
var router = express.Router();
var billDetailsModel = require("../models/billdetail-model");
const JWT = require('jsonwebtoken');
const config = require("../util/config");

module.exports = router;