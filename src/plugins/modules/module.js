var EventEmitter = require('events');

function Module (msm) {
  if (this.constructor === Module) {
    throw new Error("Can't instantiate abstract class!");
  }
}

Module.prototype = Object.create(EventEmitter.prototype);
Module.prototype.constructor = Module;

Module.prototype.install = function () {}
Module.prototype.enable = function () {}
Module.prototype.disable = function () {}
Module.prototype.uninstall = function () {}
Module.prototype.boot = function () {}
Module.prototype.init = function () {}
Module.prototype.connect = function () {}
Module.prototype.error = function () {}
Module.prototype.info = function () {}
Module.prototype.warning = function () {}
Module.prototype.close = function () {}
Module.prototype.exit = function () {}
Module.prototype.ready = function (msm) {}

module.exports = Module;
