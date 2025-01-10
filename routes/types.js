var express = require('express');
var router = express.Router();
var typeModel = require("../models/type-model");
const JWT = require('jsonwebtoken');
const config = require("../util/config");

module.exports = router;