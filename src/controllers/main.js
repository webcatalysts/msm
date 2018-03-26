
var controller = module.exports = {
  servers: function (req, res) {
    var servers = req.mongoSchemaManager.config.get('Servers');
    var ret = {};
    Object.keys(servers).forEach(function (key) {
      var server = Object.assign({}, servers[key]);
      delete server.uri;
      delete server.options;
      ret[key] = server;
    });
    res.json(ret);
    //res.json(servers);
  },
  status: function (req, res) {
    req.mongoSchemaManager.mongoose.db.admin()
      .serverStatus(function (err, result) {
      if (err) res.status(500).send(err);
      else res.json(result);
    });
  },
  databaseList: function (req, res) {
  },
  databaseFind: function (req, res) {
  },
  process: function (req, res) {
  },
  settings: async function (req, res) {
    var results = await req.mongoSchemaManager.models.Setting.loadAll();
    res.json(results);
  }
}
