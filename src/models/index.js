'use strict'

module.exports = function (mongoose, msm) {
  return {
    Setting: require('./setting')(mongoose, msm),
    Database: require('./database')(mongoose, msm),
    Collection: require('./collection')(mongoose, msm),
    CollectionTest: require('./collection-test')(mongoose, msm),
  };
}
