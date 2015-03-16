/**
 * Created by wangsen on 3/16/2015.
 */

var mongodb = require('mongodb');
var moment = require('moment');


var checkvalidDate = function checkvalidDate(taskDay){
    var curDate = getDayDate();
    var finishDate = moment(taskDay).add('days',3).format('MM-DD-YYYY');
    if(moment(curDate).isSame(taskDay) || moment(curDate).isSame(finishDate)) {
        return true;
    }
    return  moment(curDate).isBetween(taskDay, finishDate);
}

var getDayDate = function getDayDate(){
    return moment(new Date()).format('MM-DD-YYYY');
}

var getMinuteDate = function getMinuteDate(){
    return moment(new Date()).format('MM-DD-YYYY HH:mm');
}

var getMSELDate = function getMSELDate(){
    return moment(new Date()).format('MM-DD-YYYY HH:mm:ss');
}


var getObjectID = function getObjectID(id) {
    var mid = mongodb.BSONPure.ObjectID(id);
    return mid;
}


exports.checkvalidDate = checkvalidDate;
exports.getDayDate = getDayDate;
exports.getMinuteDate = getMinuteDate;
exports.getMSELDate = getMSELDate;
exports.getObjectID = getObjectID;