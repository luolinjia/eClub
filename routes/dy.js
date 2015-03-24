/**
 * Created by wangsen on 3/23/2015.
 */

var express = require('express');
var fs = require('fs');
var util = require('../public/javascripts/common/utils.js');

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
        }
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
            }
            for (var i = 0; i < records.length; i++) {
                returnData.vocabulary[i] = {};
                returnData.vocabulary[i]['spelling'] = records[i]['spelling'];
                returnData.vocabulary[i]['symbol'] = records[i]['symbol'];
                //returnData.vocabulary[i]['creatorName'] = records[i]['creatorName'];
                //returnData.vocabulary[i]['editorName'] = records[i]['editorName'];
                returnData.vocabulary[i]['freq'] = records[i]['freq'] + records[i]['pv'];
                returnData.vocabulary[i]['updateDate'] = records[i]['updateDate'];
            }

            //get daily content
            var saying = util.getSaying(util.getDayDate()); //util.getDayDate();
            if(saying === undefined) {
                saying = {};
            }
            returnData.saying = saying;

            res.send({code: 200, msg: 'ok', data: returnData});
        });
    });
});




module.exports = router;