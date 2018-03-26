var controller = module.exports = {
  list: function (req, res) {
    req.mongoSchemaManager.models.Database.listAll(function (err, results) {
      if (err) res.status(500).send(err.message);
      else res.json(results);
    });
  }
}
