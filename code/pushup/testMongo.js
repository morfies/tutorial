"use strict";
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const url = 'mongodb://localhost:27017/test';
const co = require('co');

function* getDoc(docname){
  return yield MongoClient.connect(url);
}
// create unique index
function createIndex(){
    getDoc('docOne').then(doc => {
        // createIndex(keys, opts)
        // keys: hash object of field name and its ordering method
        // opts: other options for this index, eg. unique to avoid duplicate
        doc.createIndex({name: 1}, {unique: true});
    });
}
// 1, test insert
function* normalInsert(){
    try{
    let db = yield MongoClient.connect(url);
    let doc = db.collection('docOne');

        let data = {
            name: "Lily",
            desc: "Specialized in singing",
            career: [
                {year: 1985, position: 'teacher', type: 1},
                {year: 2000, position: 'singer', type: 2},
                {year: 2005, position: 'master', type: 3}
            ]
        };
    let result = yield doc.insert(data);
    db.close();
    console.log(result);
    return result;
    }catch(e){
        console.log('eeeeeeeeeeeeeeeeeeee',e);
        throw e;
    }
}

// 2, test updateOne
function* updateFirstLevelField(){
    try {
        let db = yield MongoClient.connect(url);
        let doc = db.collection('docOne');
        var newObj = {
            desc: 'hahaha with $currentDate operator',
            name: 'morfies'
        };
        let result = yield doc.updateOne({_id:new ObjectId("56710bdc20b525e44db2eacf")},
                    {$set:newObj, $currentDate:{updateDate: true}});
        console.log(result);
        db.close();
        return result;
    } catch (e) {
        throw e;
    }
}

// co(updateFirstLevelField);

// 3, test update child document
// refer to mongodb-manual for more detail about nested document operation
function* updateChildDocField(){
    try {
        let db = yield MongoClient.connect(url);
        let doc = db.collection('docOne');
        let result = yield doc.updateOne({"name": "morfies"},
                    {$set:{"career.0.position":"new position"}})
        db.close();
        return result;
    } catch (e) {
        console.log(e);
        throw e;
    }
}

//co(updateChildDocField);

// 4, test find from nested doc
function* findByChildDocField(){
    try {
        let db = yield MongoClient.connect(url);
        let doc = db.collection('docOne');
        let result = yield doc.findOne({"career.type": 1});
        db.close();
        console.log(result);
        return result;
    } catch (e) {
        throw e;
    }
}
//co(findByChildDocField);

// 5, update child doc, incr number field
// use the positional "$" operator
//
function* incrChildDocField(){
    try {
        let db = yield MongoClient.connect(url);
        let doc = db.collection('docOne');
        let result = yield doc.updateOne({'name':'morfies','career.year':1985},
                                         {$inc: {'career.$.type':10}});
        console.log(result);
        db.close();
        return result;
    }catch(e){
        throw e;
    }
}
//co(incrChildDocField);

// 6, update child doc, add item into nested array
// $ne: return true if values are not equivalent
function* addItemToNestedArray(){
    try {
        let db = yield MongoClient.connect(url);
        let doc = db.collection('docOne');
        let result = yield doc.updateOne({'name': 'morfies', 'career.year':{$ne: 2001}},
                                         {$addToSet: {"career": {'year':2001, 'position should not exist':'chef','type':1}}});
        console.log(result);
        db.close();
        return result;
    } catch (e) {
        throw e;
    }
}
co(addItemToNestedArray);

// drop a doc
function dropDoc(){
    getDoc('docOne').then(doc => {
        doc.drop();
    })
}
// get indexes
function getIndexes() {
    getDoc('docOne').then(doc => {
        var i = doc.listIndexes(function(err, result){
            console.log(err || result)
        });
        console.log('indexes:', i);
    }).catch(function(e){
        console.log('err:', e);
    })
}

//createIndex();
// should go well
// should go wrong, because of unique index
//normalInsert();





module.exports = {
    normalInsert: normalInsert
};
