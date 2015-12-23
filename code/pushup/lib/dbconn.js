var MongoClient = require('mongodb').MongoClient;
// protocol + serverAddr + database
var url = 'mongodb://localhost:27017/pushup';

exports.connect = function(ctx, next){
    return new Promise(function(resolve, reject){
    MongoClient.connect(url, function(err, db){
        if(err){
            console.log(`Mongodb connection error: ${err.message}`);
            return reject(err);
        }
        console.log(`Mongodb connected successfully`);
        ctx.state.mongo = db;
        reolve();
    });
    });
}

