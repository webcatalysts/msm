'use strict'

var Mongoose = require('mongoose'),
  Promise = require('promise');

var SettingSchemaFactory = function (mongoose, msm) {
  var SettingSchema = new Mongoose.Schema({
    _id: {
      type: String,
      required: true,
    },
    value: {
      type: "Mixed",
      required: true,
    },
  }, { collection: 'msm_settings' });
  SettingSchema.statics.loadAll = function () {
    var _this = this;
    return new Promise(function (resolve, reject) {
      var settings = {};
      var results = _this.find({}, function (err, results) {
        if (err) reject(err);
        else {
          results.forEach(function (result) {
            settings[result._id] = result.value;
          });
          resolve(settings);
        }
      });
    });
  }
  return SettingSchema;
}

module.exports = function (mongoose, msm) {
  return mongoose.model(msm.currentServerKey + 'Setting', SettingSchemaFactory(mongoose, msm));
}
