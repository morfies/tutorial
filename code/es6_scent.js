// 这是按照老的思路，基于promise写的数据库接口
// 返回的是一个thunk
function userInfo(mid){
    return function(callback){
        getDoc('user').then(doc => {
            doc
                .findOne({mid: mid}, {'mid': 1, 'w': 1, 'h': 1, 'sex': 1}, function(err, result){
                    if(err){
                        return callback(err);
                    }
                    callback(null, result);
                });
        });
    }
}

// 看了mongodb官方出的nodejs版本API后，新出的基于generator的版本
// 该方法直接是generator
function* userInfo(mid){
    try {
        let db = yield MongoClient.connect(url);
        let doc = db.collection('user');
        var user = doc.findOne({mid: mid}, {'mid': 1, 'w': 1, 'h': 1, 'sex': 1});
        return user;
    } catch (e) {
        throw e;
    }
}

// 终于尝到了generator的美
无论
