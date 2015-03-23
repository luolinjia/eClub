/**
 * Created by wangsen on 3/16/2015.
 */

var mongodb = require('mongodb');
var moment = require('moment');
var request = require('request');
var fs = require('fs');


var storePicture = function storePicture(dataString) {
    var regexImg = /<img.*?src="([^"]*?)"/gi;
    var imgArray = [], img = [], type = undefined;
    var imgSrcURL = undefined; //only use for getting remote img file
    //check if <img> tag exist
    if (dataString.indexOf('<img') != -1) {
        while ((img = regexImg.exec(dataString))) {
            type = img[1].substr(0, 4);
            var imgData = {}, newName = undefined;
            imgData.originData = img[1];

            if (type === "data") {
                var regexLocal = /^data:.+\/(.+);base64,(.*)$/;
                var matches = img[1].match(regexLocal);
                //skip check directory
                newName = 'public/images/picture/local_' + getTimeStamp() + '.' + matches[1];
                var buffer = new Buffer(matches[2], 'base64');
                fs.writeFileSync(newName, buffer);

            } else if (type === "http") {
                var splitItem = img[1].split('.');
                var ext = splitItem[splitItem.length - 1];
                //skip check directory
                newName = 'public/images/picture/remote_' + getTimeStamp() + '.' + ext;

                imgSrcURL = img[1];
                var proxiedRequest = request.defaults({proxy: "http://web-proxy.corp.hp.com:8080"});
                proxiedRequest.get({url: imgSrcURL}).pipe(fs.createWriteStream(newName));//TODO add callback in get()

            } else {
                return "";
            }
            imgData.newData = newName.substr(7, newName.length);
            imgArray.push(imgData);
        }

        imgArray.forEach(function (e) {
            dataString = dataString.replace(e.originData, e.newData);
        });
    }

    var regexP = /<p.*?(style="[^"]*?")/gi;
    dataString = removeContent(dataString, regexP, 1, "");

    var regexDiv = /<div.*?(style="[^"]*?")/gi;
    dataString = removeContent(dataString, regexDiv, 1, "");

    return dataString;
};

var removeContent = function (dataString, regex, index, replacement) {

    var matches = [];
    var dataArray = [];
    while ((matches = regex.exec(dataString))) {
        dataArray.push(matches[index]);
    }
    dataArray.forEach(function (e) {
        dataString = dataString.replace(e, replacement);
    });
    return dataString;
};


var checkvalidDate = function checkvalidDate(taskDay) {
    var curDate = getDayDate();
    var finishDate = moment(taskDay).add('days', 3).format('MM-DD-YYYY');
    if (moment(curDate).isSame(taskDay) || moment(curDate).isSame(finishDate)) {
        return true;
    }
    return moment(curDate).isBetween(taskDay, finishDate);
};


var getDayDate = function getDayDate() {
    return moment(new Date()).format('MM-DD-YYYY');
};


var getTimeStamp = function getTimeStamp() {
    return moment(new Date()).format('x');
};


var getMinuteDate = function getMinuteDate() {
    return moment(new Date()).format('MM-DD-YYYY HH:mm');
};


var getSecondDate = function getSecondDate() {
    return moment(new Date()).format('MM-DD-YYYY HH:mm:ss');
};

var getMilliSecondDate = function getMilliSecondDate() {
    return moment(new Date()).format('MM-DD-YYYY HH:mm:ss SSS');
};

var getObjectID = function getObjectID(id) {
    return mongodb.BSONPure.ObjectID(id);
};


exports.storePicture = storePicture;
exports.checkvalidDate = checkvalidDate;
exports.getDayDate = getDayDate;
exports.getTimeStamp = getTimeStamp;
exports.getMinuteDate = getMinuteDate;
exports.getMilliSecondDate = getMilliSecondDate;
exports.getSecondDate = getSecondDate;
exports.getObjectID = getObjectID;