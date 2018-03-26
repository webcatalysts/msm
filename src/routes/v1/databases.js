'use strict'

var express = require('express');
var router = module.exports = express.Router();
var controller = require('../../controllers/databases.js');
router.get('/databases', controller.list);
