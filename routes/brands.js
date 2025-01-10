var express = require('express');
var router = express.Router();
var brandMode = require("../models/brand-model");
const JWT = require('jsonwebtoken');
const config = require("../util/config");

module.exports = router;