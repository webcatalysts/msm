'use strict'
var mongoose = require('mongoose');

var CollectionTestSchemaFactory = function (msm) {
  var CollectionTestSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
    },
  }, { collection: 'msm_tests' });

  //CollectionTestSchema.plugin(require('mongoose-diff-history/diffHistory').plugin);
  return CollectionTestSchema;
}

module.exports = function (mongoose, msm) {
  return mongoose.model(msm.currentServerKey + 'CollectionTest', CollectionTestSchemaFactory(msm));
}
