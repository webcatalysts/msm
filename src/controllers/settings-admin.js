

var controller = module.exports = {
  setSingle: function (req, res) {
    var setting = new req.mongoSchemaManager.models.Setting({_id: req.params.id, value: req.body});
    setting.save(function (err, updatedSetting) {
      if (err) res.status(500).send(err);
      else res.send(updatedSetting);
    });
  },
  setMultiple: async function (req, res) {
    var errs = [];
    var keys = Object.keys(req.body)
    var numKeys = keys.length;
    for (var i = 0; i < numKeys; i++) {
      var key = keys[i];
      try {
        await req.mongoSchemaManager.models.Setting.findOneAndUpdate({_id: key}, {value: req.body[key]}, {upsert:true});
      }
      catch (err) {
        errs.push(err.message);
      }
    }
    if (errs.length) {
      res.json({ok: 0, error: errs.join(' ')});
    }
    else {
      var settings = await req.mongoSchemaManager.models.Setting.loadAll();
      res.json(settings);
    }
  },
  unsetSingle: function (req, res) {
  },
  unsetMultiple: function (req, res) {
  },
}
