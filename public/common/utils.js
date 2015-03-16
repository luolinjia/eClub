/**
 * Created by wangsen on 3/16/2015.
 */

var mongodb = require('mongodb');
var moment = require('moment');


var getDayDate = function getDayDate(){
    var curDate = moment(new Date());
    var loginDay = curDate.format('MM-DD-YYYY');
    return loginDay;
}

var getObjectID = function getObjectID(id) {
    var mid = mongodb.BSONPure.ObjectID(id);
    return mid;
}


exports.getDayDate = getDayDate;
exports.getObjectID = getObjectID;