'use strict'

var mongoose = require('mongoose'),
  Admin = mongoose.mongo.Admin;

var DatabaseSchemaFactory = function (msm) {
  var DatabaseSchema = new mongoose.Schema({
    _id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    server: {
      type: String,
      required: true,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
  }, { collection: 'msm_databases' });
  DatabaseSchema.statics.listAll = function (callback) {
    var mergeDbs = function(documents, existing) {
			var results = [];
			// key the existing dbs
			var numExisting = existing.length;
			var keyedExisting = {};
			for (var i = 0; i < numExisting; i++) {
				var db = existing[i];
				keyedExisting[db.name] = 1;
			}
			// key the documents
			var keyedDocs = {};
			var numDocuments = documents.length;
			for (var i = 0; i < numDocuments; i++) {
				var doc = documents[i];
				if (!keyedExisting[doc._id]) {
					results.push({
            name: doc.id,
            sizeOnDisk: 0,
            empty: true,
            enabled: doc.enabled,
          });
				}
				else {
					keyedDocs[doc._id] = doc;
					delete keyedDocs[doc._id]._id;
				}
			}
			for (var i = 0; i < numExisting; i++) {
				var db = existing[i];
				if (db.name == 'admin' || db.name == 'local') continue;
				if (keyedDocs[db.name]) {
					//db = Object.assign({}, db, keyedDocs[db.name]);
					db = Object.assign(keyedDocs[db.name], db);
					db = keyedDocs[db.name];
				}
				else db.enabled = false;
				results.push(db);
			}
			return results;
    }
    this.db.db.admin().listDatabases(function (err, existingDbs) {
      if (err) callback(err);
      else {
        this.find(function (err, dbs) {
          if (err) callback(err);
          else callback(null, mergeDbs(dbs, existingDbs.databases));
        }.bind(this));
      }
    }.bind(this));
  };
  DatabaseSchema.statics.findOne = function (query, callback) {
		var mergeCollections = function(id, existing, docs) {
			var existingKeyed = {},
				docsKeyed = {},
				numExisting = existing.length,
				numDocs = docs.length,
				results = [];
			for (var i = 0; i < numExisting; i++) {
				var c = existing[i];
				existingKeyed[CollectionProvider.makeId(id, c.name)] = c;
			}
			for (var i = 0; i < numDocs; i++) {
				var d = docs[i];
				if (existingKeyed[d._id]) {
					docsKeyed[d._id] = d;
				}
				else {
					results.push(d);
				}
			}
			for (var i = 0; i < numExisting; i++) {
				var c = existing[i];
				var cid = CollectionProvider.makeId(id, c.name);
				if (docsKeyed[cid]) {
					var d = docsKeyed[cid];
					d.collectionInfo = c;
					results.push(d);
				}
				else {
					var d = {
						_id: cid,
						name: 'Uninitialized: ' + c.name,
						collection: c.name,
						database: id,
						enabled: false,
						collectionInfo: c,
					}
					delete d.collectionInfo.name;
					results.push(d);
				}
			}
			return results;
		}
		let dbsrv = this.getCollection();
		let doc = dbsrv.col.findOne(query);
		doc.name = doc._id;
		delete doc._id;
		let existingCollections = dbsrv.con.db(doc.name).listCollections().toArray();
		dbsrv.con.close();
		let cols = this.collectionProvider.find({database: doc.name},{
			_id: 1,
			name: 1,
			type: 1,
			collection: 1,
			database: 1,
			source: 1,
			enabled: 1,
			weight: 1,
			dependencies: 1,
		});
		doc.collections = mergeCollections(doc.name, existingCollections, cols);
		return doc;
	};
  return DatabaseSchema;
}

module.exports = function (mongoose, msm) {
  return mongoose.model(msm.currentServerKey + 'Database', DatabaseSchemaFactory(msm));
}
