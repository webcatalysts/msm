
module.exports = function (msm) {
  return {
    field: require('./field'),
    modules: require('./modules')(msm),
  }
}
