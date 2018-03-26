var MongoSchemaManager = require('./src');
var servers = MongoSchemaManager.config.get('Servers');
Object.keys(servers).forEach(function (serverKey) {
  var mongoSchemaManager = new MongoSchemaManager();
  mongoSchemaManager.run(serverKey);
});
