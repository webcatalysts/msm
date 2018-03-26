module.exports = async function (msm) {
  msm.modules = [];
  msm.moduleIndex = {};
  msm.registerModule = function (ns, moduleClass) {
    var idx = this.modules.length;
    this.moduleIndex[ns] = idx;
    this.modules.push(new moduleClass(msm));
  }
  msm.forEachModule = function (callback) {
    return this.modules.forEach(callback);
  }
  msm.registerModule('core', require('./core'));
  if (msm.config.get('Api.enabled')) {
    msm.registerModule('api', require('./api'));
  }
  if (msm.config.get('Admin.enabled')) {
    if (!msm.isProduction() || msm.config.get('Admin.allowInProduction')) {
      msm.registerModule('admin', require('./admin'));
    }
  }

  msm.on('boot', async function () {
    this.forEachModule(async function (module) {
      await module.boot(msm);
    });
  });
  msm.on('init', async function () {
    this.forEachModule(async function (module) {
      await module.init(msm);
    });
  });
  msm.on('ready', async function () {
    this.forEachModule(async function (module) {
      await module.ready(msm);
    });
  });
}
