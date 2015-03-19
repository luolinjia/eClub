/**
 * Created by wangsen on 3/16/2015.
 */

var mongodb = require('mongodb');
var moment = require('moment');
var request = require('request');
var fs = require('fs');


var storePicture = function storePicture(dataString) {
    var regexImg = /<img.*?src="([^"]*?)"/gi;
    var imgArray = [], img = undefined, type = undefined;
    //check if <img> tag exist
   if(dataString.indexOf('<img') != -1) {
        while((img = regexImg.exec(dataString))){
            type = img[1].substr(0,4);
            var imgData = {}, newName = undefined;
            imgData.originData = img[1];
            if(type === "data"){
                var regexLocal = /^data:.+\/(.+);base64,(.*)$/;
                var matches = img[1].match(regexLocal);
                //skip check directory
                newName =  'public/picture/local_'+ getTimeStamp()+ '.' + matches[1];
                var buffer = new Buffer(matches[2], 'base64');
                fs.writeFileSync(newName, buffer);
            } else if(type === "http") {
                var splitItem = img[1].split('.');
                var ext = splitItem[splitItem.length - 1];
                //skip check directory
                newName =  'public/picture/remote_'+ getTimeStamp()+ '.' + ext;
                request(img[1]).pipe(fs.createWriteStream(newName));
            } else {
                console.log("the img content is error");
                return "";
            }
            imgData.newData = newName.substr(7, newName.length);
            imgArray.push(imgData);
        }

        imgArray.forEach(function(e){
            dataString = dataString.replace(e.originData, e.newData);
        });
    }

    return dataString;
};


var checkvalidDate = function checkvalidDate(taskDay){
    var curDate = getDayDate();
    var finishDate = moment(taskDay).add('days',3).format('MM-DD-YYYY');
    if(moment(curDate).isSame(taskDay) || moment(curDate).isSame(finishDate)) {
        return true;
    }
    return  moment(curDate).isBetween(taskDay, finishDate);
};


var getDayDate = function getDayDate(){
    return moment(new Date()).format('MM-DD-YYYY');
};


var getTimeStamp = function getTimeStamp(){
    return moment(new Date()).format('x');
}


var getMinuteDate = function getMinuteDate(){
    return moment(new Date()).format('MM-DD-YYYY HH:mm');
};


var getMSELDate = function getMSELDate(){
    return moment(new Date()).format('MM-DD-YYYY HH:mm:ss');
};


var getObjectID = function getObjectID(id) {
    return mongodb.BSONPure.ObjectID(id);
};


exports.storePicture = storePicture;
exports.checkvalidDate = checkvalidDate;
exports.getDayDate = getDayDate;
exports.getTimeStamp = getTimeStamp;
exports.getMinuteDate = getMinuteDate;
exports.getMSELDate = getMSELDate;
exports.getObjectID = getObjectID;