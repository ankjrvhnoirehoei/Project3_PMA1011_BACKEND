var express = require('express');
var router = express.Router();
var imageModel = require("../models/image-model");
const JWT = require('jsonwebtoken');
const config = require("../util/config");

module.exports = router;