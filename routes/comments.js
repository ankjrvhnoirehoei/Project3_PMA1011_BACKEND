var express = require('express');
var router = express.Router();
var commentMode = require("../models/comment-model");
const JWT = require('jsonwebtoken');
const config = require("../util/config");

module.exports = router;