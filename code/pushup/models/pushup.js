"use strict";
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/pushup';
/**
 * Add new user to the collection
 * @param  {Object} user
 * @return {Thunk}
 */
function* userAdd(user){
    try {
        user.createDate = new Date;
        let db = yield MongoClient.connect(url);
        let doc = db.collection('user');
        let result = yield doc.insertOne(user);
        db.close();
        return result;
    } catch (e) {
        console.error('save user error:', e);
        throw e;
    }
}
/**
 * Get user info by mid
 *
 */
function* userInfo(mid){
    try {
        let db = yield MongoClient.connect(url);
        let doc = db.collection('user');
        let user = yield doc.findOne({mid: mid}, {'mid': 1, 'w': 1, 'h': 1, 'sex': 1});
        db.close();
        return user;
    } catch (e) {
        throw e;
    }
}
/**
 * Delete user info by mid
 *
 */
function* deleteUserByMid(mid){
    try {
        let db = yield MongoClient.connect(url);
        let doc = db.collection('user');
        let result = yield doc.findOneAndDelete({mid: mid});
        db.close();
        return result;
    } catch (err) {
        throw err;
    }
}

/**
 * Add new practice record
 *
 *
 */
function* recordAdd(record){
    try {
        let db = yield MongoClient.connect(url);
        let doc = db.collection('pushuprecord');
        let result = yield doc.insertOne(record);
        db.close();
        return result;
    } catch (e) {
        throw e;
    }
}
/**
 * get records within specified date span
 *
 */
function* getRecordWithinSpan(beginDate, endDate) {
    try {
        console.log('---------------------------1');
        let db = yield MongoClient.connect(url);
        let doc = db.collection('pushuprecord');
        console.log('---------------------------2');
        let result = yield doc.find({timestart:{
            $gte: beginDate,
            $lt: endDate
        }}).toArray();
        console.log('---------------------------3');
        db.close();
        return result;
    } catch (err) {
        throw err;
    }
}
module.exports = {
    userAdd: userAdd,
    userInfo: userInfo,
    recordAdd: recordAdd,
    deleteUserByMid: deleteUserByMid,
    getRecordWithinSpan: getRecordWithinSpan
};
