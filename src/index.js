var EventEmitter = require('events');

function MongoSchemaManager() {
  this.boot();
}
MongoSchemaManager.prototype = Object.create(EventEmitter.prototype);
MongoSchemaManager.prototype.constructor = MongoSchemaManager;

MongoSchemaManager.kernel = require('./kernel');
MongoSchemaManager.config = MongoSchemaManager.kernel.config;

MongoSchemaManager.prototype.boot = async function () {
  this.kernel = MongoSchemaManager.kernel;
  this.config = MongoSchemaManager.config;
  this.plugins = {};
  this.plugins = require('./plugins')(this);
  this.schema = require('./schema');
  await this.triggerEvent('boot');
}

MongoSchemaManager.prototype.init = async function (data) {
  var servers = this.config.get('Servers');
  console.log(this.currentServer.uri);
  this.mongoose = await this.kernel.mongoose.createConnection(this.currentServer.uri, this.currentServer.options);
  this.models = require('./models')(this.mongoose, this);
  this.app.use(function (req, res, next) {
    req.mongoSchemaManager = this;
    next();
  }.bind(this));
  process.on('unhandledRejection', function(reason, p) {
    console.log("Unhandled Rejection:", reason.stack);
  });
  await this.triggerEvent('init');
}

MongoSchemaManager.prototype.ready = async function (data) {
  await this.triggerEvent('ready');
}

MongoSchemaManager.prototype.run = async function (key) {
  this.currentServer = this.config.get('Servers.' + key);
  this.currentServerKey = key;
  this.app = this.kernel.express();
  this.server = this.kernel.http.Server(this.app);
  this.server.on('listening', this.ready.bind(this));
  this.io = this.kernel.io(this.server);
  await this.init();
  this.server.listen(this.currentServer.client.port, this.currentServer.client.host);
}

MongoSchemaManager.prototype.triggerEvent = async function (ev) {
  console.log('Event: %s', ev);
  console.log(ev);
  return this.emit(ev, Array.prototype.slice.call(arguments, 1));
}

MongoSchemaManager.prototype.isProduction = function () {
  return false;
}

module.exports = MongoSchemaManager;
