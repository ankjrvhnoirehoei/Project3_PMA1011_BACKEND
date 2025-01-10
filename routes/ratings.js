var express = require('express');
var router = express.Router();
var ratingModel = require("../models/rating-model");
const JWT = require('jsonwebtoken');
const config = require("../util/config");

module.exports = router;