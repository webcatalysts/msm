var express = require('express');

var router = module.exports = express.Router();
var controller = require('../../controllers/collections.js');
router.get('/collections', controller.list);
router.get('/collection/:id', controller.find);
router.get('/collection/:id/count', controller.count);
router.get('/collection/:id/query', controller.query);
router.get('/collection/:id/schema', controller.schema);
router.get('/collection/:id/process', controller.process);
router.get('/collection/:id/test', controller.loadTest);
router.post('/collection/:id/test', controller.runTest);
