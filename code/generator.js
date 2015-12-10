// A thunk is a function that accepts a callback as the only argument 
// and arranges for that callback to be called at some future turn of the event loop

// first, let's get a thunk
var fs = require('fs');
function readFileThunk(path){
    return function(callback){
        fs.readFile(path, callback);
    }
}

// now readFile('filename') shall return a thunk as a function.
// next, let's construct a generator that yields thunks
function* concatFiles(file1, file2){
    var data1 = yield readFileThunk(file1);
    var data2 = yield readFileThunk(file2);
    return Buffer.concat([data1, data2]);
}

// third, we should find a way to run our generator
// a co like wrapper example
function runGenerator(g, callback){
    setImmediate(resume);

    function resume(resumeErr, resumeValue){
        var yieldedObject;
        try{
            if(resumeErr){
                yieldedObject = g.throw(resumeErr);
            }else {
                yieldedObject = g.next(resumeValue);
            }
        }catch(e){
            callback(e, null);
            return;
        }
        if(yieldedObject.done){
            callback(null, yieldedObject.value);
            return;
        }
        var yieldedFun = yieldedObject.value; // a thunk returned function
        if(typeof yieldedFun !== 'function'){ // when error happenes
            throw new Error('you must yield a function');
        }
        yieldedFun(resume);
    }
}

// finally, we put all this together
runGenerator(concatFiles('test1.txt', 'test2.txt'), function(err, result){
    console.log(`the final contaced string from both files is: ${result.toString()}`);
});
