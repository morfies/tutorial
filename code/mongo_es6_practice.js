"use strict";
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/test';
const co = require('co');

// create unique index
function createIndex() {
    getDoc('docOne').then(doc => {
        // createIndex(keys, opts)
        // keys: hash object of field name and its ordering method
        // opts: other options for this index, eg. unique to avoid duplicate
        doc.createIndex({
            name: 1
        }, {
            unique: true
        });
    });
}
// 1, test insert
function * normalInsert() {
    try {
        let db = yield MongoClient.connect(url);
        let doc = db.collection('docOne');

        let data = {
            name: "Lily",
            desc: "Specialized in singing",
            career: [{
                year: 1985,
                position: 'teacher',
                type: 1
            }, {
                year: 2000,
                position: 'singer',
                type: 2
            }, {
                year: 2005,
                position: 'master',
                type: 3
            }]
        };
        let result = yield doc.insert(data);
        console.log(result);
        db.close(); //need to close db connection
        return result;
    } catch (e) {
        console.log('eeeeeeeeeeeeeeeeeeee', e);
        throw e;        //need to throw error in order for outer branch to catch it
    }
}
// drop a doc
function dropDoc() {
    getDoc('docOne').then(doc => {
        doc.drop();
    })
}

//createIndex();
// should go well
co(normalInsert).then(function(result) {
    console.log('in the resolve branch, result:', result);
}).catch(function(e) {
    console.log('in the reject branch, reason:', e);
});
/*  first time, data should be inserted successfully, resolve branch should go
{ result: { ok: 1, n: 1 },
  ops:
   [ { name: 'Lily',
       desc: 'Specialized in singing',
       career: [Object],
       _id: 5671090eb933b9f04c9f04b0 } ],
  insertedCount: 1,
  insertedIds: [ [ '0' ], 5671090eb933b9f04c9f04b0 ] }
in the resolve branch, result: { result: { ok: 1, n: 1 },
  ops:
   [ { name: 'Lily',
       desc: 'Specialized in singing',
       career: [Object],
       _id: 5671090eb933b9f04c9f04b0 } ],
  insertedCount: 1,
  insertedIds: [ [ '0' ], 5671090eb933b9f04c9f04b0 ] }
 */
 
// should go wrong, because of unique index
co(normalInsert);

/* after we set up unique index on name field, reject branch should be reached to handle errors.
eeeeeeeeeeeeeeeeeeee { [MongoError: E11000 duplicate key error index: test.docOne.$name_1 dup key: { : "Lily" }]
  name: 'MongoError',
  message: 'E11000 duplicate key error index: test.docOne.$name_1 dup key: { : "Lily" }',
  driver: true,
  code: 11000,
  index: 0,
  errmsg: 'E11000 duplicate key error index: test.docOne.$name_1 dup key: { : "Lily" }',
  getOperation: [Function],
  toJSON: [Function],
  toString: [Function] }
in the reject branch, reason: { [MongoError: E11000 duplicate key error index: test.docOne.$name_1 dup key: { : "Lily" }]
  name: 'MongoError',
  message: 'E11000 duplicate key error index: test.docOne.$name_1 dup key: { : "Lily" }',
  driver: true,
  code: 11000,
  index: 0,
  errmsg: 'E11000 duplicate key error index: test.docOne.$name_1 dup key: { : "Lily" }',
  getOperation: [Function],
  toJSON: [Function],
  toString: [Function] }
 */