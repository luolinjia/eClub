/**
 * Created by wangsen on 3/24/2015.
 */

var util = require('./utils.js');

/*
 items:  meaning is  items[0].descriptions
 */
var isExistWPS = function isExistWPS(items,pos,english,type) {

    for (var j = 0; j < items.length; j++) {
        if (items[j].pos === pos) {

            if(type === 1 && items[j].words) {
                if (isExistSameEngEle(items[j].words, english)) {
                    return true;
                }
            } else if(type === 2 && items[j].phrases) {
                if (isExistSameEngEle(items[j].phrases, english)) {
                    return true;
                }
            } else if(type === 3 && items[j].sentences){
                if (isExistSameEngEle(items[j].sentences, english)) {
                    return true;
                }
            } else {
                return false;
            }
        }
    }

    return false;
};


var isUserExistTag = function isUserExistTag(items, muserID){
    var tag = undefined;
    if(items === undefined || items === null || items.length == 0) {
        return undefined;
    }

    for (var i = 0; i < items.length; i++) {
        //check user tag
        if (items[i].creatorID && muserID === items[i].creatorID) {
            tag = items[i].tag;
            break;
        }
    }

    return tag;
};

var isExistSameIndex = function isExistSameIndex(items, element) {
    for (var i = 0; i < items.length; i++) {
        if (items[i] === element) {
            return true;
        }
    }
    return false;
};

var isExistSameEngEle = function isExistElement(items, element) {
    if(items && items.length > 0) {
        for (var i = 0; i < items.length; i++) {
            if (items[i].english == element) {
                return true;
            }
        }
    }
    return false;
};

var mergeContentArray = function mergeContentArray(baseArray, newArray) {
    var mergeArray = [];

    if (newArray === undefined || newArray.length === 0) {
        return;
    }
    if(baseArray && baseArray.length > 0) {
        baseArray.forEach(function (e) {
            mergeArray.push(e);
        });
    }

    for (var i = 0; i < newArray.length; i++) {
        if (!isExistSameEngEle(baseArray, newArray[i].english)) {
            mergeArray.push(newArray[i]);
        }
    }
    return mergeArray;
};

/*
 * para1: data in db
 * para2: data which user post from client
 */
var mergeDescription = function mergeDescription(baseData, newData) {
    var description = {};
    description.pos = baseData.pos;
    description.rank = baseData.rank + 1; //rank level increase 1
    if (newData.words && newData.words.length > 0) {
        description.words = mergeContentArray(baseData.words, newData.words);
    }
    if (newData.sentences && newData.sentences.length > 0) {
        description.sentences = mergeContentArray(baseData.sentences, newData.sentences);
    }
    if (newData.phrases && newData.phrases.length > 0) {
        description.phrases = mergeContentArray(baseData.phrases, newData.phrases);
    }

    return description;
};

var mergeDescriptionArray = function mergeDescriptionArray(userDataArray, dbDataArray) {

    if (userDataArray === undefined || userDataArray === null || userDataArray.length === 0) {
        return dbData;
    }
    var mergeData = [], delUserIndex = [], delDBIndex = [];
    var isExist = false, samePosNum = 0;
    var uindex = 0, dindex = 0;
    for (uindex = 0; uindex < userDataArray.length; uindex++) {
        isExist = false;
        for (dindex = 0; dindex < dbDataArray.length; dindex++) {
            if (userDataArray[uindex].pos === dbDataArray[dindex].pos) {
                delUserIndex.push(uindex);
                delDBIndex.push(dindex);
                isExist = true;
                samePosNum++;
                break;
            }
        }

        if (!isExist) {
            continue;
        }
        //merge description with same pos
        mergeData.push(mergeDescription(dbDataArray[dindex], userDataArray[uindex]));
    }

    if (samePosNum == 0) {
        userDataArray.forEach(function (e) {
            mergeData.push(e);
        });
        dbDataArray.forEach(function (e) {
            mergeData.push(e);
        });
    } else {
        if (delUserIndex.length !== userDataArray.length) {
            for (var i = 0; i < userDataArray.length; i++) {
                if (!isExistSameIndex(delUserIndex, i)) {
                    mergeData.push(userDataArray[i]);
                }
            }
        }

        if (delDBIndex.length !== dbDataArray.length) {
            for (var j = 0; j < dbDataArray.length; j++) {
                if (!isExistSameIndex(delDBIndex, j)) {
                    mergeData.push(dbDataArray[j]);
                }
            }
        }
    }

    return mergeData;
};


exports.isExistWPS = isExistWPS;
exports.isUserExistTag = isUserExistTag;
exports.mergeDescriptionArray = mergeDescriptionArray;

//exports.getMatchTag = getMatchTag;


