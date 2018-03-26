var controller = require('../../controllers/main.js');
var express = require('express');
var main = module.exports = express.Router();

main.get('/', controller.status);
main.get('/status', controller.status);
main.get('/servers', controller.servers);
main.get('/settings', controller.settings);
main.get('/process', controller.process);
