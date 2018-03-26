var Module = require('./module');
var url = require('url');

class ApiModule extends Module {
  constructor (msm) {
    super(msm);
  }
  init (msm, next) {
    msm.app.use('/v1', require('../../routes/v1/databases'));
    msm.app.use('/v1', require('../../routes/v1/collections'));
  }
}

module.exports = ApiModule;
