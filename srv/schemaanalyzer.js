//
// https://github.com/variety/variety-cli
var child = require('child-process-promise');
var program = require('./node_modules/variety-cli/lib/program');
var utils = require('./node_modules/variety-cli/lib/utils');
var bson = require('bson');

var SchemaAnalysis = function(dbName, colName, databaseWrapper, collectionProvider) {
    this.databaseName = dbName;
    this.collectionName = colName;
    this.collectionId = dbName + '.' + colName;
    this.databaseWrapper = databaseWrapper;
    this.collectionProvider = collectionProvider;
}

var analyzeSchema = function(schemaAnalysis, options = {}, callback) {
    var data = { "$set": {
        name: 'Pre-existing: ' + schemaAnalysis.collectionName,
        collection: schemaAnalysis.collectionName,
        database: schemaAnalysis.databaseName,
        enabled: false,
        analyzingSchema: true
    }};

    var schemaDatabase = 'varietyResults';
    var schemaCollection = schemaAnalysis.databaseName + '.' + schemaAnalysis.collectionName + '.schemaFields';

    var runSchemaAnalysis = function () {
        var libPath = './node_modules/variety/variety.js';
        options = Object.assign({
            limit: 100,
            persistResults: 'true',
            resultsCollection: schemaCollection,
        }, options);

        var spawnArgs = [schemaAnalysis.databaseName, '--eval='+utils.buildParams(schemaAnalysis.collectionName, options), './node_modules/variety/variety.js'];

        var promise = child.spawn('mongo', spawnArgs);
        console.log('spawn started');
        return promise;
    }

    var extractSchema = function(callback) {
        schemaAnalysis.databaseWrapper.connect(function(err, con) {
            con.db(schemaDatabase).collection(schemaCollection).find().toArray(function(err, fields) {
                var fieldNames = [];
                var schema = {};
                var numFields = fields.length;
                for (var i = 0; i < numFields; i++) {
                    var field = fields[i];
                    if (typeof field.value.types.Number !== 'undefined' || typeof field.value.types.NumberLong !== 'undefined') {
                        var value = { type: 'int' };
                    }
                    else if (typeof field.value.types.String !== 'undefined') {
                        var value = { type: 'text' };
                    }
                    else if (typeof field.value.types.Object !== 'undefined') {
                        var value = { type: 'group', children: {} };
                    }
                    else if (typeof field.value.types.Array !== 'undefined') {
                        var value = { type: 'array', children: {} };
                    }
                    else if (typeof field.value.types.Boolean !== 'undefined') {
                        var value = { type: 'boolean' };
                    }
                    else { continue; }

                    var fieldName = field['_id'].key;

                    if (fieldName.match(/^_versionHash/) || fieldName.match(/^_changeHistory/)) {
                        continue;
                    }

                    if (fieldName.match(new RegExp(/XX\./))) {
                        var fieldName = fieldName.replace(/XX\./g, "");
                    }
                    if (fieldName.match(/\./)) {
                        var parts = fieldName.split('.');
                        var lastPart = parts.length-1;
                        var fieldName = parts[lastPart];
                        delete parts[lastPart];
                        var parts = parts.filter(function (part) { return typeof part !== 'undefined' });
                        var parentFieldName = parts.length > 1 ? parts.join('.children.') : parts[0];
                        eval('var fieldName = "' + parentFieldName + '.children.' + fieldName + '";');
                    }
                    fieldNames.push(fieldName);
                    eval('schema.' + fieldName + ' = value;');
                }
                callback(null, schema);
            });
        });
    }

    schemaAnalysis.collectionProvider.save(schemaAnalysis.collectionId, data, function (err, result) {
        if (err) callback(err);
        else {
            runSchemaAnalysis()
                .then(function() { 
                    extractSchema(function (err, schema) {
                        var update = {
                            "$unset": { analyzingSchema: "" },
                        }
                        if (err) {
                            update['$set'] = { enabled: false, error: "Failed to import schema." };
                        }
                        else {
                            update['$set'] = { enabled: true, schema: schema, schemaImported: true };
                        }
                        schemaAnalysis.collectionProvider.save(schemaAnalysis.collectionId, update, function(err, res) {
                            console.log('done with: ' + schemaAnalysis.collectionId);
                        });
                    });
                })
                .catch(function(err) { callback(err); });

            callback(null, {ok: 1});
        }
    });
}

module.exports = {
    SchemaAnalysis: SchemaAnalysis,
    analyzeSchema: analyzeSchema
}
