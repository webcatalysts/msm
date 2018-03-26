var Module = require('./module');
var url = require('url');

class CoreModule extends Module {
  constructor (msm) {
    super(msm);
  }
}
CoreModule.prototype.init = function (msm) {
  msm.app.use('/v1', require('../../routes/v1/main.js'));
  msm.app.use('/v1', require('../../routes/v1/collections.js'));
  msm.app.use('/v1', require('../../routes/v1/databases.js'));
}
CoreModule.prototype.ready = async function (msm) {
  msm.settings = await msm.models.Setting.loadAll();
  if (msm.settings.evalonboot) {
    eval(msm.settings.evalonboot);
  }
}

module.exports = CoreModule;
