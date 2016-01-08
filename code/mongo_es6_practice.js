"use strict";
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const url = 'mongodb://localhost:27017/weiclass';
const md5 = require('md5');

var db;
MongoClient.connect(url, function(err, database){
  if(err){
    console.error(`Connecting to mongodb error: ${err.message}`);
    process.exit(1);
  }
  db = database;
});

/**
 * [saveTeacher description]
 * @param   {String} teacher.name
 * @param   {String} teacher.avator	 img url, stored on same server
 * @param   {String} teacher.desc	 teacher info intro
 * @param   {String} teacher.createDate
 * @param   {String} teacher.updateDate
 * @yield   {Object} yielded with insert result, ObjectId
 */
exports.saveTeacher = function* (teacher) {
  try {
    //let db = yield MongoClient.connect(url);
    let doc = db.collection('teacher');
    let result = yield doc.insertOne(teacher);
    //db.close();
    return result;
  } catch (e) {
    throw e;
  }
}

/**
 * update teacher data of certain field
 * @param  {String} objectId [description]
 * @param  {Object} teacher  [description]
 * @param  {String} teacher.updateDate
 * @yield  {Object}          [description]
 */
exports.updateTeacher = function* (objectId, teacher) {
  try {
    //let db = yield MongoClient.connect(url);
    let doc = db.collection('teacher');
    let result = yield doc.updateOne({_id: new ObjectId(objectId)} , {$set: teacher});
    //db.close();
    return result;
  } catch (e) {
    throw e;
  }
}

/**
 * save a class data into db
 * @param {Array}  data.content  audio ordered array of object
 *                                {audio:'audio url path',text:'related text speech'}
 * @param {Array}  data.comment  comments array of object
 *                                {author,desc,sameVote,fvtVote,hash(author+desc)}
 * @param {String} [data.title]  [class title]
 * @param {String} [data.intro]  [class intro]
 * @param {String} [data.dir]    [class content directory, relate to directory name holding audio files]
 * @param {String} data.teacher
 * @param {String} data.createDate
 * @param {String} data.updateDate
 * @yield {Object}
 */
exports.saveClass = function* (data) {
  try {
    //let db = yield MongoClient.connect(url);
    let doc = db.collection('class');
    data.createDate = data.updateDate = new Date;
    data.teacher = data.teacher || "莲子老师";
    let result = yield doc.insertOne(data);
    //db.close();
    return result;
  } catch (e) {
    throw e;
  }
}
/**
 * update part of a class data
 * @param  {String} objectId
 * @param  {Object} data     new data
 * @param  {String} teacher.updateDate
 * @yield  {Object}          [description]
 */
exports.updateClass = function* (objectId, data) {
  try {
    //let db = yield MongoClient.connect(url);
    let doc = db.collection('class');
    data.updateDate = new Date;
    let result = yield doc.updateOne({_id: new ObjectId(objectId)}, {$set: data});
    //db.close();
    return result;
  } catch (e) {
    throw e;
  }
}

/**
 * get teacher info
 * @param {String} name          teacher name
 * @yield {Object} data
 */
exports.getTeacher = function* (name) {
  try {
    //let db = yield MongoClient.connect(url);
    let doc = db.collection('teacher');
    let result = yield doc.findOne({name: name});
    //db.close();
    return result;
  } catch (e) {
    throw e;
  }
}

/**
 * get teacher and related classes data
 * @param {[type]} name          [description]
 * @yield {[type]} [description]
 */
exports.getTeacherClasses = function* (name) {
  try {
    //let db = yield MongoClient.connect(url);
    let classDoc = db.collection('class');
    let classes = yield classDoc.find({teacher: name}).sort({create_date: -1});
    //db.close();
    return classes;
  } catch (e) {
    throw e;
  }
}

/**
 * get single class data, content of audio array and comment array
 * @param {String} objectId      [description]
 * @yield {Object} [description]
 */
exports.getClassById = function* (objectId) {
  try {
    //let db = yield MongoClient.connect(url);
    let classDoc = db.collection('class');
    let cData = yield classDoc.findOne({_id: new ObjectId(objectId)},{updateDate:0, createDate:0});
    //db.close();
    return cData;
  } catch (e) {
    throw e;
  }
}
/**
 * save a comment to this class
 * @param {ObjectID} classId
 * @param {Object}   comment       {author,desc,sameVote,fvtVote, hash}
 *                                 hash: generated from 'author+desc'
 * @yield {[type]}
 *
 * TODO: should createIndex on hash field
 */
exports.saveComment = function* (classId, comment) {
  try {
    if(!comment.desc){
      throw new Error('fields should not be null');
    }
    let hash = comment.hash = md5(comment.author + comment.desc);
    comment.sameVote = 0;
    comment.fvtVote = 0;
    //let db = yield MongoClient.connect(url);
    let classDoc = db.collection('class');
    let result = yield classDoc.updateOne({
      _id: new ObjectId(classId),
      'comment.hash': {$ne: hash}
    }, {
      $addToSet: {'comment': comment},
      $currentDate: {updateDate: true}
    });
    //db.close();
    return result;
  } catch (e) {
    throw e;
  }
}

/**
 * 'I like this question' operation
 * @param {[type]} classId       [description]
 * @param {[type]} cmthash       [comment hash string]
 * @yield {[type]} [description]
 */
exports.fvtComment = function* (classId, cmthash){
  try {
    //let db = yield MongoClient.connect(url);
    let doc = db.collection('class');
    let result = yield doc.updateOne({
      _id: new ObjectId(classId),
      'comment.hash': cmthash
    }, {
      $inc: {'comment.$.fvtVote': 1}
    });
    //db.close();
    return result;
  } catch (e) {
    throw e;
  }
}

/**
 * 'I have the same problem' operation
 * @param {[type]} classId       [description]
 * @param {[type]} cmthash       [comment hash string]
 * @yield {[type]} [description]
 */
exports.sameComment = function* (classId, cmthash) {
  try {
    //let db = yield MongoClient.connect(url);
    let doc = db.collection('class');
    let result = yield doc.updateOne({
      _id: new ObjectId(classId),
      'comment.hash': cmthash
    }, {
      $inc: {'comment.$.sameVote': 1}
    });
    //db.close();
    return result;
  } catch (e) {
    throw e;
  }
}

exports.deleteComment = function* (classId, cmthash){
  try {
    // db.class.update({dir:"class-4"},{$pull:{"comment":{"hash":"87069818a331c938af092a5158d2ca5b"}}})
    //let db = yield MongoClient.connect(url);
    let doc = db.collection('class');
    let result = yield doc.update({
      _id: new ObjectId(classId)
    },{
      $pull:{
        "comment": {
          "hash": cmthash
        }
      }
    });
    //db.close();
    return result;
  } catch (e) {
    throw e;
  }
}

exports.getStats = function* (page){
  try {
    //let db = yield MongoClient.connect(url);
    let doc = db.collection('vstats');
    let result = yield doc.find({"page": page},{pv:1, linkv:1}).limit(1).toArray();
    //db.close();
    return result;
  } catch (e) {
    throw e;
  }
}

exports.getStatsReport = function* (cid){
  try {
    //let db = yield MongoClient.connect(url);
    let doc = db.collection('vstats');
    let result = yield doc.find({"page": "class" + cid}).limit(1).toArray();
    let cdata = yield db.collection('class').find({_id: new ObjectId(cid)}, {dir:1}).limit(1).toArray();
    if(result.length && cdata.length){
      result[0]["cindex"] = cdata[0]["dir"];
    }
    //db.close();
    return result;
  } catch (e) {
    throw e;
  }
}

/**
 * get all audio pv of a certain class index,
 * audio file names: 2weike7.mp3, then index is 7
 * @param {[type]} cindex        [class index]
 * @yield {[type]} [description]
 */
exports.getAudioStatsReport = function* (cindex){
  try {
    //let db = yield MongoClient.connect(url);
    let doc = db.collection('audiostats');
    let result = yield doc.find({"resource":{$regex: '.*'+cindex+'\\.mp3'}}).toArray();
    //db.close();
    return result;
  } catch (e) {
    throw e;
  }
}
