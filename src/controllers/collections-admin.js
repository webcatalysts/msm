
var controller = module.exports = {
  find: function (req, res) {
    res.send({ok: 1});
  },
  create: function (req, res) {
    console.log('create');
    console.log(req.body);
    var obj = new req.mongoSchemaManager.models.Collection(req.body);
    obj._id = req.params.id;
    console.log(obj.toJSON());
    obj.save(function (err, savedObj) {
      if (err) {
        res.json({ok: 0, error: err.message});
      }
      else res.json({ok: 1, collection: savedObj});
    });
    return;
    req.mongoSchemaManager.models.Collection.create(req.params.id, req.body, function (err, result) {
      if (err) res.json({ok: 0, error: err.message});
      else res.json(result);
    });
  },
  update: function (req, res) {
    console.log(req.body);
    req.mongoSchemaManager.models.Collection.update({_id: req.params.id}, req.body, function (err, result) {
      console.log('updated');
      if (err) res.json({ok: 0, error: err.message});
      else res.json(result);
    });
  },
  delete: function (req, res) {
    req.mongoSchemaManager.models.Collection.findById(req.params.id, {dependencies: 1}, function (err, collection) {
      collection.remove(function (err) {
        if (err) res.json({ok: 0, error: err.message});
        else res.send({ok: 1});
      });
    });

  },
  analyze: function (req, res) {
  },
  overwriteSchema: function (req, res) {
  },
  mergeSchema: function (req, res) {
  },
  process: function (req, res) {
  },
  getDependencies: function (req, res) {
    var id = req.params.id;
    console.log(id);
    req.mongoSchemaManager.models.Collection.find({}, {_id: 1, source: 1, dependencies: 1}, function (err, ucols) {
      if (err) res.status(500).send(err.message);
      else {
        var cols = {};
        ucols.forEach(function (ucol) {
          var col = { dependencies: [], dependents: [], missing: [] };
          if (ucol.source) {
            col.dependencies.push(ucol.source);
          }
          if (ucol.dependencies.length) {
            col.dependencies = ucol.dependencies;
          }
          cols[ucol._id] = col;
        });
        Object.keys(cols).forEach(function (colId) {
          var col = cols[colId];
          col.dependencies.forEach(function (depId) {
            if (typeof cols[depId] === 'undefined') {
              cols[colId].missing.push(colId);
            }
            else cols[depId].dependents.push(colId);
          });
        });
        res.json(cols[id].dependents);
      }
    });
  },
  loadTests: function (req, res) {
    req.mongoSchemaManager.models.CollectionTest.find(function (err, results) {
      res.json(results);
    });
  },
  runTests: function (req, res) {
  },
  loadTest: function (req, res) {
  },
  createTest: function (req, res) {
  },
  updateTest: function (req, res) {
  },
}
