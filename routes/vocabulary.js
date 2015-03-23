/**
 * Created by wangsen on 3/21/2015.
 */

var express = require('express');
var util = require('../public/javascripts/common/utils.js');

var router = express.Router();

router.post('/showall', function (req, res, next) {
    var db = req.db;
    var returnData = [], resData = {};
    db.collection('vocabulary').find({}).toArray(function (err, items) {
        if (err) {
            res.send({code: 500, msg: err})
        }

        for (var index = 0; index < items.length; index++) {
            returnData[index] = {};
            returnData[index]['id'] = items[index]['_id'];
            returnData[index]['spelling'] = items[index]['spelling'];
            returnData[index]['symbol'] = items[index]['symbol'];
            returnData[index]['creatorName'] = items[index]['creatorName'];
            returnData[index]['editorName'] = items[index]['editorName'];
            returnData[index]['updateDate'] = items[index]['updateDate'];
            returnData[index]['freq'] = items[index]['freq'];
        }

        resData['list'] = returnData;
        res.send({code: 200, msg: 'ok', data: resData});

    });
});


router.post('/showself', function (req, res, next) {
    var db = req.db;
    var returnData = [], resData = {};

    if (req.session['userID']) {
        var muserid = util.getObjectID(req.session['userID']);
        db.collection('vocabulary').find({"creatorID": muserid}).toArray(function (err, items) {
            if (err) {
                res.send({code: 500, msg: err})
            }
            for (var index = 0; index < items.length; index++) {
                returnData[index] = items[index];
                //returnData[index]['id'] = items[index]['_id'];
                //returnData[index]['spelling'] = items[index]['spelling'];
                //returnData[index]['symbol'] = items[index]['symbol'];
                //returnData[index]['creatorName'] = items[index]['creatorName'];
                //returnData[index]['editorName'] = items[index]['editorName'];
                //returnData[index]['updateDate'] = items[index]['updateDate'];
                //returnData[index]['freq'] = items[index]['freq'];
            }

            resData['list'] = returnData;
            res.send({code: 200, msg: 'ok', data: resData});
        });
    } else {
        res.send({code: 310, msg: 'Please login in'});
    }
});


router.post('/showbypos', function (req, res, next) {
    var db = req.db;
    var returnData = [], resData = {};

    if (req.body.pos) {

        db.collection('vocabulary').find({"descriptions.pos": req.body.pos}).toArray(function (err, items) {
            if (err) {
                res.send({code: 500, msg: err});
            }
            for (var index = 0; index < items.length; index++) {
                returnData[index] = {};
                returnData[index]['id'] = items[index]['_id'];
                returnData[index]['spelling'] = items[index]['spelling'];
                returnData[index]['symbol'] = items[index]['symbol'];
                returnData[index]['creatorName'] = items[index]['creatorName'];
                returnData[index]['editorName'] = items[index]['editorName'];
                returnData[index]['updateDate'] = items[index]['updateDate'];
                returnData[index]['freq'] = items[index]['freq'];
            }

            resData['list'] = returnData;
            res.send({code: 200, msg: 'ok', data: resData});
        });
    } else {
        res.send({code: 311, msg: 'please choose part of speech'});
    }
});


router.post('/showdetail', function (req, res, next) {
    var db = req.db;

    if (req.body.vocabularyID) {
        var mvocabularyID = util.getObjectID(req.body.vocabularyID);
        db.collection('vocabulary').find({'_id': mvocabularyID}).toArray(function (err, items) {
            if (err) {
                res.send({code: 500, msg: err});
            }
            if (items && items.length === 1) {
                res.send({code: 200, msg: 'ok', data: items[0]});
            } else {
                res.send({code: 510, msg: "vocabulary data error"});
            }
        });
    } else {
        res.send({code: 311, msg: 'please choose vocabulary'});
    }
});


// add vocabulary
router.post('/add', function (req, res, next) {
    var db = req.db;
    console.log("url add=>"+req.url);

    if (req.session['userID']) {
        console.log("spelling=>"+req.body.spelling);
        if (req.body.spelling) { //need to check body struct
            var formatDate = util.getMinuteDate();
            var tag = util.getTimeStamp();
            var muserid = util.getObjectID(req.session['userID']);

            db.collection('vocabulry').find({'spelling':req.body.spelling}).toArray(function(err, items){
                if(err) {  res.send({code: 500, msg: err}); }

                if(items && items.length === 0) {
                    //first insert vocabulary, no exist
                    req.body.updateDate = formatDate;
                    req.body.freq = 1; //
                    var creator = [];
                    var creatorInfo = {};
                    creatorInfo.createID = muserid;
                    creatorInfo.creatorName = req.session['userName'];
                    creatorInfo.tag = tag;
                    creator[0] = creatorInfo
                    req.body.creators = creator;
                    for(var index = 0; req.body.descriptions.length > index; index++) {
                        for(var windex = 0; req.body.descriptions[index].words.length > windex; windex++) {
                            var tempData = {};
                            tempData.english = [];
                            for(var eindex = 0; req.body.descriptions[index].words[windex].english.length > eindex; eindex++){
                                tempData.english.push(req.body.descriptions[index].words[windex].english[eindex]);
                            }
                            tempData.chinese = [];
                            for(var cindex = 0; req.body.descriptions[index].words[windex].chinese.length > cindex; cindex++){
                                tempData.chinese.push(req.body.descriptions[index].words[windex].chinese[cindex])
                            }
                            tempData.createDate = formatDate;
                            tempData.tag = tag;
                            req.body.descriptions[index].words[windex] = tempData;
                        }
                        for(var pindex = 0; req.body.descriptions[index].phrases.length > pindex; pindex++) {
                            var tempData = {};
                            tempData.english = req.body.descriptions[index].phrases[pindex].english;
                            tempData.chinese = req.body.descriptions[index].phrases[pindex].chinese;
                            tempData.createDate = formatDate;
                            tempData.tag = tag;
                            req.body.descriptions[index].phrases[pindex] = tempData;
                        }
                        for(var sindex = 0; req.body.descriptions[index].sentences.length > sindex; sindex++) {
                            var tempData = {};
                            tempData.english = req.body.descriptions[index].sentences[sindex].english;
                            tempData.chinese = req.body.descriptions[index].sentences[sindex].chinese;
                            tempData.createDate = formatDate;
                            tempData.tag = tag;
                            req.body.descriptions[index].sentences[sindex] = tempData;
                        }
                    }
                    db.collection('vocabulary').insert(req.body, function (err, result) {
                        res.send(err ? {code: 500, msg: err} : {code: 200, msg: 'Add vocabulary successfully!'});
                    });
                } else if(items && items.length === 1) {
                    // exist this vocabulary, then update arrays


                } else {
                    res.send({code: 513, msg: 'vocabulary data error'});
                }
            });

        } else {
            res.send({code: 311, msg: 'Please input data'});
        }
    } else {
        res.send({code: 310, msg: 'Please login in'});
    }
});

router.post('/addsentence', function (req, res, next) {
    var db = req.db;

    if (req.body.vocabularyID && req.body.chinese && req.body.english) {
        var mvocabularyID = util.getObjectID(req.body.vocabularyID);
        var createDate = util.getMilliSecondDate();
        db.collection('vocabulary').update({'_id': mvocabularyID}, {
            $addToSet: {
                'descriptions.sentences': {
                    'createDate': createDate,
                    'english': req.body.english,
                    'chinese': req.body.chinese
                }
            }
        }, function (err) {
            if (err) {
                res.send({code: 500, msg: err});
            }
            db.collection('vocabulary').find({'_id': mvocabularyID}).toArray(function (err, items) {
                if (err) {
                    res.send({code: 500, msg: err});
                }
                if (items && items.length === 1) {
                    res.send({code: 200, msg: 'ok', data: items[0]});
                } else {
                    res.send({code: 510, msg: "vocabulary data error"});
                }
            });
        });
    } else {
        res.send({code: 311, msg: 'please input sentence'});
    }

});


router.post('/addphrase', function (req, res, next) {
    var db = req.db;

    if (req.body.vocabularyID && req.body.chinese && req.body.english) {
        var mvocabularyID = util.getObjectID(req.body.vocabularyID);
        var createDate = util.getMilliSecondDate();
        db.collection('vocabulary').update({'_id': mvocabularyID}, {
            $addToSet: {
                'descriptions.phrases': {
                    'createDate': createDate,
                    'english': req.body.english,
                    'chinese': req.body.chinese
                }
            }
        }, function (err) {
            if (err) {
                res.send({code: 500, msg: err});
            }
            db.collection('vocabulary').find({'_id': mvocabularyID}).toArray(function (err, items) {
                if (err) {
                    res.send({code: 500, msg: err});
                }
                if (items && items.length === 1) {
                    res.send({code: 200, msg: 'ok', data: items[0]});
                } else {
                    res.send({code: 510, msg: "vocabulary data error"});
                }
            });
        });
    } else {
        res.send({code: 311, msg: 'please input sentence'});
    }

});


router.post(['/addhel{2}o','/addworld'], function (req, res, next) {
    console.log("url=>"+req.url);
    res.send({code:200});
});

module.exports = router;