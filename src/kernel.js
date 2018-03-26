var Modules = module.exports = {
  _: require('lodash'),
  BSON: require('bson'),
  child_process: require('child_process'),
  config: require('config'),
  cron: require('cron'),
  bodyParser: require('body-parser'),
  events: require('events'),
  express: require('express'),
  http: require('http'),
  io: require('socket.io'),
  crypto: require('crypto'),
  moment: require('moment'),
  mongodb: require('mongodb'),
  mongoose: require('mongoose'),
  mongooseRevisioning: require('mongoose-diff-history'),
  util: require('util'),
  schema: require('./schema'),
}

Modules.bson = new Modules.BSON();
