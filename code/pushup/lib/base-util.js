"use strict";

exports.getNewObj = function(obj, propArr, prefix){
    var n = {},
        prefix = prefix || "";
    for (let i = propArr.length - 1; i >= 0; i--){
        if (undefined != obj[propArr[i]]) {
            n[prefix + propArr[i]] = obj[propArr[i]];
        }
    }
    return n;
}

exports.propExist = function(obj, propArr) {
    for (let i = propArr.length -1; i >= 0; i--){
        if (!obj[propArr[i]]) {
            return false;
        }
    }
    return true;
}
