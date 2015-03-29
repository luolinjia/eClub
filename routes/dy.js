/**
 * Created by wangsen on 3/23/2015.
 */

var express = require('express');
var util = require('../public/javascripts/common/utils.js');
var msgProvider = require('../public/javascripts/common/msgProvider.js');


var router = express.Router();

// show dynamic index
router.post('/showdylist', function (req, res, next) {
    var db = req.db;
    var returnData = {'article': [], 'vocabulary': []};
    /* bad hard code */
    var articleTotal = 1;
    var vocabularyTotal = 1;

    db.collection('article').find({}).sort({'updateDate': -1}).limit(articleTotal).toArray(function (err, items) {
        if (err) {
            res.send({code: 500, msg: err});
        } else {
            for (var index = 0; index < items.length; index++) {
                returnData.article[index] = {};
                returnData.article[index]['id'] = items[index]['_id'];
                returnData.article[index]['creatorID'] = items[index]['creatorID'];
                returnData.article[index]['creatorName'] = items[index]['creatorName'];
                returnData.article[index]['editorName'] = items[index]['editorName'];
                returnData.article[index]['title'] = items[index]['title'];
                returnData.article[index]['updateDate'] = items[index]['updateDate'];
                returnData.article[index]['taskDate'] = items[index]['taskDate'];
                returnData.article[index]['pv'] = items[index]['pv'];
                if (items[index]['likes']) {
                    returnData.article[index]['likeNum'] = items[index]['likes'].length;
                    returnData.article[index]['likes'] = items[index]['likes'];
                } else {
                    returnData.article[index]['likeNum'] = 0;
                    returnData.article[index]['likes'] = [];
                }
                if (items[index]['comments']) {
                    items[index]['comments'].sort(function (a, b) {
                        return a.createDate < b.createDate ? 1 : -1;
                    });
                }
            }

            db.collection('vocabulary').find({}).sort({'updateDate': -1}).limit(vocabularyTotal).toArray(function (err, records) {
                if (err) {
                    res.send({code: 500, msg: err});
                } else {
                    for (var i = 0; i < records.length; i++) {
                        returnData.vocabulary[i] = {};
                        returnData.vocabulary[i]['id'] = records[i]['_id'];
                        returnData.vocabulary[i]['spelling'] = records[i]['spelling'];
                        returnData.vocabulary[i]['symbol'] = records[i]['symbol'];
                        returnData.vocabulary[i]['freq'] = records[i]['freq'] + records[i]['pv'];
                        returnData.vocabulary[i]['updateDate'] = records[i]['updateDate'];
                    }

                    //get daily content
                    var saying = util.getSaying(util.getDayDate()); //util.getDayDate();
                    if (saying === undefined) {
                        saying = {};
                    }
                    returnData.saying = saying;

                    res.send({code: 200, data: returnData});
                }
            });
        }
    });
});

// get daily picture[last or next]
router.post(['/nextpicture','/lastpicture'], function (req, res, next) {
    var returnData = {saying:{}};
    var url = undefined,resMsg = undefined;
    var showDayDate = req.body.dayDate;
    if(showDayDate) {
        if(req.url === '/lastpicture') {
            url = util.getDailyPicture(showDayDate, 1);
            resMsg = msgProvider.msg_dy_show_success('last','picture');
        } else{
            url = util.getDailyPicture(showDayDate, -1);
            resMsg = msgProvider.msg_dy_show_success('next','picture');
        }

        if(url){
            returnData.saying.url = url;
            res.send({code: 200, msg:resMsg, data: returnData});
        } else {
            resMsg = msgProvider.msg_dy_show_success('none','picture');
            res.send({code: 202, msg:resMsg, data: returnData});
        }
    } else {
        res.send({code: 316, msg:msgProvider.msg_dy_date_miss})
    }
});

// get daily sentence[last or next]
router.post(['/nextsentence','/lastsentence'], function (req, res, next) {
    var returnData = {saying:{}};
    var saying = {}, resMsg = undefined;
    var showDayDate = req.body.dayDate;
    if(showDayDate) {

        if(req.url === '/lastsentence') {
            saying = util.getDailySentence(showDayDate, 1);
            resMsg = msgProvider.msg_dy_show_success('last','sentence');
        } else{
            saying = util.getDailySentence(showDayDate, -1);
            resMsg = msgProvider.msg_dy_show_success('next','sentence');
        }

        if(saying){
            returnData.saying = saying;
            res.send({code: 200, msg:resMsg, data: returnData});
        } else {
            resMsg = msgProvider.msg_dy_show_success('none','sentence');
            res.send({code: 202, msg:resMsg, data: returnData});
        }
    } else {
        res.send({code: 316, msg:msgProvider.msg_dy_date_miss})
    }
});

module.exports = router;