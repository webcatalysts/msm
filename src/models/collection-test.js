var
  assert = require('assert'),
  mongoose = require('mongoose'),
  asyncEval = require('async-eval');

var evalTestUnit = async function (testUnit, testDoc) {
      var testExpr = {
        sumUnemptyString: function (val) { return { '$sum': { '$cond': { if: { '$and': [ { '$eq': [{ '$type': val}, 'string'] }, { '$ne': [val, ''] } ]}, then: 1, else: 0 }}}; },
        sumPositiveInteger: function (val) { return {'$sum': {'$cond': {if: {'$and': [{'$eq': [{ '$type': val}, 'int']}, {'$gt': [val, 0]}]}, then: 1, else: 0 }}}; },
        sumEqual: function (val1, val2) { return { '$sum': {'$cond': {if: {'$eq': [val1,val2]}, then: 1, else: 0}}} },
        sumBetween: function (val, start, end) { return { '$sum': {'$cond': {if: {'$and': [{'$gte': [val,start]},{'$lte':[val,end]}]}, then: 1, else: 0 }}}; },
        sumGreaterThan: function (val, gtv) { return { '$sum': {'$cond': {if: {'$gt': [val,gtv]}, then: 1, else: 0 }}}; },
        sumGreaterThanEqualTo: function (val, gtev) { return { '$sum': {'$cond': {if: {'$gte': [val,gtev]}, then: 1, else: 0 }}}; },
        sumLessThan: function (val, ltv) { return { '$sum': {'$cond': {if: {'$lt': [val,ltv]}, then: 1, else: 0 }}}; },
        sumLessThanEqualTo: function (val, ltev) { return { '$sum': {'$cond': {if: {'$lte': [val,ltev]}, then: 1, else: 0 }}}; },
        sumIsObject: function (val) { return { '$sum': { '$cond': { if: { '$eq': [{ '$type': val}, 'object'] }, then: 1, else: 0 } } }; },
        sumValidDate: function (val, md = null) {
          md = md ? md : new Date(1000); // 1970-01-01T00:00:01 - Detect empty dates
          return { '$sum': { '$cond': {
            if: { '$and': [{ '$eq': [{ '$type': val}, 'date'] }, { '$gte': [val, md] }] },
            then: 1,
            else: 0
          }}};
        }
      };
      var db = testDoc.db.client.db(testDoc.databaseName);
      eval('var evalUnit = async function (testDoc, col, con, db) { ' + testUnit.code + '; };');
  try {
      await evalUnit(testDoc, db.collection(testDoc.collectionName), testDoc.db.client, db);
  }
  catch (err) {
      return err.message;
  }
  return null;
}

var CollectionTestSchemaFactory = function (msm) {
  var CollectionTestSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true,
    },
    collectionName: {
      type: String,
      required: true,
    },
    databaseName: {
      type: String,
      required: true,
    },
    error: String,
    unitFailed: Number,
    pass: Boolean,
    units: {
      type: [],
    },
  }, { collection: 'msm_tests' });

  //CollectionTestSchema.plugin(require('mongoose-diff-history/diffHistory').plugin);
  CollectionTestSchema.methods.runTest = async function (msm, lockOnPass = false, verbose = false) {
    if (verbose) console.log('Running test: %s', this._id);
    var numUnits = this.units.length;
    for (var i = 0; i < numUnits; i++) {
      if (verbose) console.log('  Running unit: %d', i);
      var result = await evalTestUnit(this.units[i], this);
      if (result) {
        this.error = result;
        this.pass = false;
        this.unitFailed = i;
        await this.save();
        return this;
        if (verbose) console.log('  FAIL');
      }
      if (verbose) console.log('  PASS');
    }
    this.pass = true;
    this.error = null;
    this.unitFailed = null;
    await this.save();
    return this;
  }

  return CollectionTestSchema;
}

module.exports = function (mongoose, msm) {
  return mongoose.model(msm.currentServerKey + 'CollectionTest', CollectionTestSchemaFactory(msm));
}
