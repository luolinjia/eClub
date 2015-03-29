/**
 * Created by wangsen on 3/16/2015.
 */

var mongodb = require('mongodb');
var moment = require('moment');
var request = require('request');
var parser = require('markdown-parse');
var fs = require('fs');

var mdDir = 'public/daily/md/';
var mdSuffix = 'md';
var picDir = 'public/daily/pic/';
var picSuffix = 'jpg';
var validDayRange = 5; //for daily range;

var getSaying = function getSaying(date) {
    var saying = getDailySentence(date,1);
    if(saying === undefined) {
        return undefined;
    } else {
        var pictureURL = getDailyPicture(date,1);
        if(pictureURL !== undefined) {
            saying.url = pictureURL;
        }
        return saying;
    }
};

var getValidDate = function getValidDate(index,date,lastflag) {
    var checkDate = date;
    if(lastflag === 1) { //get last day
        checkDate = moment(checkDate, 'MM-DD-YYYY').subtract(1, 'days').format('MM-DD-YYYY');
    }else {
        checkDate = moment(checkDate, 'MM-DD-YYYY').add(1, 'days').format('MM-DD-YYYY');
    }
    if(index === validDayRange) {
        return undefined;
    }
    return checkDate;
};

var getDailyPicture = function getDailyPicture(date,lastflag) {
    var checkDate = date;
    var index = 0;
    /* get pic url */
    while(!isExistFile(checkDate, picDir, picSuffix)){
        //get last one day date
        checkDate = getValidDate(++index,checkDate,lastflag);
        if(checkDate === undefined) {
            return undefined;
        }
    }
    var picPath = picDir.substr(7,picDir.length)+checkDate+'.'+picSuffix;

    return picPath;
};

var getDailySentence = function getDailySentence(date,lastflag) {
    var checkDate = date;
    var index = 0;
    while(!isExistFile(checkDate, mdDir, mdSuffix)){
        //get last one day date
        checkDate = getValidDate(++index,checkDate,lastflag);
        if(checkDate === undefined) {
            return undefined;
        }
    }
    var saying = {}
    var path = mdDir+checkDate+".md";
    var content = fs.readFileSync(path, 'utf8');
    parser(content, function(err, result){
        if(err) { res.send({code:514, msg:err});}
        saying.english = result.attributes['e'];
        saying.chinese = result.attributes['c'];
        saying.author = result.attributes['a'];
    });

    return saying;
};


var isExistFile = function isExistFile(date,dir,suffx) {
    //check file exist
    return fs.existsSync(dir+date+'.'+suffx);
};


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
            imgData.newData = newName.substr(7, newName.length-7);
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
    var finishDate = moment(taskDay,'MM-DD-YYYY').add(3,'days').format('MM-DD-YYYY');
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


var getWordMp3Path = function getWordMp3Path(data){
    if(data == null || data == undefined) {
        return undefined;
    }
    var startWord = data.substr(0,1).toUpperCase();
    var wordMp3Path = 'public/audio/words/'+startWord+'/'+data+'.mp3'

    if(fs.existsSync(wordMp3Path)) {
        return wordMp3Path.substr(7,wordMp3Path.length-7);
    } else {
        return undefined;
    }
}



exports.getSaying = getSaying;
exports.getValidDate = getValidDate;
exports.getDailyPicture = getDailyPicture;
exports.getDailySentence = getDailySentence;
exports.isExistFile = isExistFile;
exports.storePicture = storePicture;
exports.checkvalidDate = checkvalidDate;
exports.getDayDate = getDayDate;
exports.getTimeStamp = getTimeStamp;
exports.getMinuteDate = getMinuteDate;
exports.getMilliSecondDate = getMilliSecondDate;
exports.getSecondDate = getSecondDate;
exports.getObjectID = getObjectID;
exports.getWordMp3Path = getWordMp3Path;