var express = require('express');
var router = express.Router();
var voucherModel = require("../models/voucher-model");
const JWT = require('jsonwebtoken');
const config = require("../util/config");

module.exports = router;