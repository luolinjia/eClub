/**
 * Created by wangsen on 3/5/2015.
 */
var express = require('express');
var util = require('../public/javascripts/common/utils.js');
var msgProvider = require('../public/javascripts/common/msgProvider.js');
var formidable = require('formidable');
var fs = require('fs');

var AUDIO_UPLOAD_FOLDER = '/audio/';

var router = express.Router();


router.post('/addaudio', function (req, res) {

    var form = new formidable.IncomingForm();   //创建上传表单
    form.encoding = 'utf-8';		//设置编辑
    form.uploadDir = 'public' + AUDIO_UPLOAD_FOLDER;	 //设置上传目录
    form.keepExtensions = true;	 //保留后缀
    form.maxFieldsSize = 512 * 1024 * 1024;   //文件大小

    form.parse(req, function (err, fields, files) {

        if (err) {
            res.send({code: 500, msg: err});
        } else {
            if (files.fulAudio) {
                var extName = '';  //后缀名
                switch (files.fulAudio.type) {
                    case 'audio/wav':
                        extName = 'wav';
                        break;
                    case 'audio/mp3':
                        extName = 'mp3';
                        break;
                }

                if (extName.length == 0) {
                    res.send({code: 202, msg: msgProvider.msg_article_warn_addaudio, data: {'url': ''}});
                } else {

                    var tempPath = files.fulAudio.path;
                    var newPath = files.fulAudio.path.substr(0, tempPath.length - 4) + '_' + util.getDayDate() + '.' + extName;

                    fs.renameSync(tempPath, newPath);  //重命名
                    var delPublicPath = newPath.substring(7, newPath.length);
                    res.send({code: 200, msg: 'ok', data: {'url': delPublicPath}});
                }
            } else {
                res.send({code: 200, msg: 'ok', data: {'url': ''}});
            }
        }
    });
});


//show all articles
router.post('/showall', function (req, res, next) {
    var db = req.db;
    var returnData = [], resData = {};

    db.collection('article').find({}).sort({'updateDate': -1}).toArray(function (err, items) {
        if (err) {
            res.send({code: 500, msg: err});
        } else {
            for (var index = 0; index < items.length; index++) {
                returnData[index] = {};
                returnData[index]['id'] = items[index]['_id'];
                returnData[index]['creatorID'] = items[index]['creatorID'];
                returnData[index]['creatorName'] = items[index]['creatorName'];
                returnData[index]['editorName'] = items[index]['editorName'];
                returnData[index]['title'] = items[index]['title'];
                returnData[index]['updateDate'] = items[index]['updateDate'];
                returnData[index]['taskDate'] = items[index]['taskDate'];
                returnData[index]['pv'] = items[index]['pv'];
                if (items[index]['likes']) {
                    returnData[index]['likeNum'] = items[index]['likes'].length;
                    returnData[index]['likes'] = items[index]['likes'];
                } else {
                    returnData[index]['likeNum'] = 0;
                    returnData[index]['likes'] = [];
                }
                if (items[index]['comments']) {
                    items[index]['comments'].sort(function (a, b) {
                        return a.createDate < b.createDate ? 1 : -1;
                    });
                }
            }
            resData['list'] = returnData;
            res.send({code: 200, data: resData});
        }
    })
});

//show creator all articles
router.post('/showself', function (req, res, next) {
    var db = req.db;
    var returnData = [], resData = {};

    if (req.session['userID']) {
        var muserid = util.getObjectID(req.session['userID']);

        db.collection('article').find({"creatorID": muserid}).sort({'updateDate': -1}).toArray(function (err, items) {
            if (err) {
                res.send({code: 500, msg: err});
            } else {
                for (var index = 0; index < items.length; index++) {
                    returnData[index] = {};
                    returnData[index]['id'] = items[index]['_id'];
                    returnData[index]['creatorID'] = items[index]['creatorID'];
                    returnData[index]['creatorName'] = items[index]['creatorName'];
                    returnData[index]['editorName'] = items[index]['editorName'];
                    returnData[index]['title'] = items[index]['title'];
                    returnData[index]['updateDate'] = items[index]['updateDate'];
                    returnData[index]['taskDate'] = items[index]['taskDate'];
                    returnData[index]['pv'] = items[index]['pv'];
                    if (items[index]['likes']) {
                        returnData[index]['likeNum'] = items[index]['likes'].length;
                        returnData[index]['likes'] = items[index]['likes'];
                    } else {
                        returnData[index]['likeNum'] = 0;
                        returnData[index]['likes'] = [];
                    }
                    if (items[index]['comments']) {
                        items[index]['comments'].sort(function (a, b) {
                            return a.createDate < b.createDate ? 1 : -1;
                        });
                    }
                }
                resData['list'] = returnData;
                res.send({code: 200, data: resData});
            }
        });
    } else {
        res.send({code: 310, msg: msgProvider.msg_user_warn_login});
    }
});

// show article by category
router.post('/showbycategory', function (req, res, next) {
    var db = req.db;
    var returnData = [], resData = {};
    if (req.body.category) {
        db.collection('article').find({"categories": {$in: [req.body.category]}}).sort({'updateDate': -1}).toArray(function (err, items) {
            if (err) {
                res.send({code: 500, msg: err});
            } else {
                for (var index = 0; index < items.length; index++) {
                    returnData[index] = {};
                    returnData[index]['id'] = items[index]['_id'];
                    returnData[index]['creatorID'] = items[index]['creatorID'];
                    returnData[index]['creatorName'] = items[index]['creatorName'];
                    returnData[index]['editorName'] = items[index]['editorName'];
                    returnData[index]['title'] = items[index]['title'];
                    returnData[index]['updateDate'] = items[index]['updateDate'];
                    returnData[index]['taskDate'] = items[index]['taskDate'];
                    returnData[index]['pv'] = items[index]['pv'];
                    if (items[index]['likes']) {
                        returnData[index]['likeNum'] = items[index]['likes'].length;
                        returnData[index]['likes'] = items[index]['likes'];
                    } else {
                        returnData[index]['likeNum'] = 0;
                        returnData[index]['likes'] = [];
                    }
                    if (items[index]['comments']) {
                        items[index]['comments'].sort(function (a, b) {
                            return a.createDate < b.createDate ? 1 : -1;
                        });
                    }
                }
                resData['list'] = returnData;
                resData['selectCate'] = req.body.category;
                res.send({code: 200, msg: 'ok', data: resData});
            }
        });
    } else {
        res.send({code: 311, msg: msgProvider.msg_word_err_input('article catagory')});
    }
});

// show articles by tag
router.post('/showbytag', function (req, res, next) {
    var db = req.db;
    var returnData = [], resData = {};
    if (req.body.tag) {
        db.collection('article').find({"tags": {$in: [req.body.tag]}}).sort({'updateDate': -1}).toArray(function (err, items) {
            if (err) {
                res.send({code: 500, msg: err});
            }
            else {
                for (var index = 0; index < items.length; index++) {
                    returnData[index] = {};
                    returnData[index]['id'] = items[index]['_id'];
                    returnData[index]['creatorID'] = items[index]['creatorID'];
                    returnData[index]['creatorName'] = items[index]['creatorName'];
                    returnData[index]['editorName'] = items[index]['editorName'];
                    returnData[index]['title'] = items[index]['title'];
                    returnData[index]['updateDate'] = items[index]['updateDate'];
                    returnData[index]['taskDate'] = items[index]['taskDate'];
                    returnData[index]['pv'] = items[index]['pv'];
                    if (items[index]['likes']) {
                        returnData[index]['likeNum'] = items[index]['likes'].length;
                        returnData[index]['likes'] = items[index]['likes'];
                    } else {
                        returnData[index]['likeNum'] = 0;
                        returnData[index]['likes'] = [];
                    }
                    if (items[index]['comments']) {
                        items[index]['comments'].sort(function (a, b) {
                            return a.createDate < b.createDate ? 1 : -1;
                        });
                    }
                }
                resData['list'] = returnData;
                resData['selectTag'] = req.body.tag;
                res.send({code: 200, data: resData});
            }
        });
    } else {
        res.send({code: 311, msg: msgProvider.msg_word_err_input('article tag')});
    }
});

// show article by creator
router.post('/showbycreator', function (req, res, next) {
    var db = req.db;
    var returnData = [], resData = {};
    if (req.body.creatorID) {
        var muserid = util.getObjectID(req.body.creatorID);

        db.collection('article').find({"creatorID": muserid}).sort({'updateDate': -1}).toArray(function (err, items) {
            if (err) {
                res.send({code: 500, msg: err});
            } else {
                for (var index = 0; index < items.length; index++) {
                    returnData[index] = {};
                    returnData[index]['id'] = items[index]['_id'];
                    returnData[index]['creatorID'] = items[index]['creatorID'];
                    returnData[index]['creatorName'] = items[index]['creatorName'];
                    returnData[index]['editorName'] = items[index]['editorName'];
                    returnData[index]['title'] = items[index]['title'];
                    returnData[index]['updateDate'] = items[index]['updateDate'];
                    returnData[index]['taskDate'] = items[index]['taskDate'];
                    returnData[index]['pv'] = items[index]['pv'];
                    if (items[index]['likes']) {
                        returnData[index]['likeNum'] = items[index]['likes'].length;
                        returnData[index]['likes'] = items[index]['likes'];
                    } else {
                        returnData[index]['likeNum'] = 0;
                        returnData[index]['likes'] = [];
                    }
                    if (items[index]['comments']) {
                        items[index]['comments'].sort(function (a, b) {
                            return a.createDate < b.createDate ? 1 : -1;
                        });
                    }
                }
                resData['list'] = returnData;
                res.send({code: 200, data: resData});
            }
        });
    } else {
        res.send({code: 311, msg: msgProvider.msg_word_err_input('article creator')});
    }
});

//show detail article content
router.post('/showdetail', function (req, res, next) {
    var db = req.db;
    var returnData = [];
    if (req.body.articleID) {
        var articleid = util.getObjectID(req.body.articleID);
        db.collection('article').update({'_id': articleid}, {$inc: {'pv': 1}}, function (err) {
            if (err) {
                res.send({code: 500, msg: err});
            } else {

                db.collection('article').find({"_id": articleid}).toArray(function (err, items) {
                    if (err) {
                        res.send({code: 500, msg: err});
                    } else {
                        if (items && items.length === 1) {
                            returnData[0] = items[0];
                            if (items[0]['likes']) {
                                returnData[0]['likeNum'] = items[0]['likes'].length;
                                returnData[0]['likes'] = items[0]['likes'];
                            } else {
                                returnData[0]['likeNum'] = 0;
                                returnData[0]['likes'] = [];
                            }
                            if (items[0]['comments']) {
                                returnData[0]['commentNum'] = items[0]['comments'].length;
                                items[0]['comments'].sort(function (a, b) {
                                    return a.createDate < b.createDate ? 1 : -1;
                                });
                            } else {
                                returnData[0]['commentNum'] = 0;
                            }
                            res.send({code: 200, data: returnData});
                        } else {
                            res.send({code: 510, msg: msgProvider.msg_article_showdetail_nofind});
                        }
                    }
                });
            }
        });
    } else {
        res.send({code: 311, msg: 'please choose article'});
    }
});

//admin user set the task article
router.post('/settask', function (req, res, next) {
    var db = req.db;
    if (req.session['userType'] === '1') {
        if (req.body.articleID) {
            var marticleid = util.getObjectID(req.body.articleID);
            var taskDate = util.getDayDate();

            db.collection('article').update({'_id': marticleid}, {$set: {'taskDate': taskDate}}, function (err) {
                if (err) {
                    res.send({code: 500, msg: err});
                } else {
                    res.send({code: 200});
                }
            });
        } else {
            res.send({code: 310, msg: msgProvider.msg_word_err_input('article')});
        }
    } else {
        res.send({code: 313, msg: msgProvider.msg_adminuser_miss});
    }
});

//show no finish task articles by creator
router.post('/showtask', function (req, res, next) {
    var db = req.db;
    var returnData = [], resData = {};
    if (req.session['userID']) {
        var muserid = util.getObjectID(req.session['userID']);

        db.collection('article').find({
            'visitors.userID': {$not: {$eq: muserid}},
            'taskDate': {'$exists': true}
        }).toArray(function (err, items) {
            if (err) {
                res.send({code: 500, msg: err});
            } else {
                for (var index = 0; index < items.length; index++) {
                    returnData[index] = {};
                    returnData[index]['id'] = items[index]['_id'];
                    returnData[index]['creatorID'] = items[index]['creatorID'];
                    returnData[index]['creatorName'] = items[index]['creatorName'];
                    returnData[index]['editorName'] = items[index]['editorName'];
                    returnData[index]['title'] = items[index]['title'];
                    returnData[index]['updateDate'] = items[index]['updateDate'];
                    returnData[index]['taskDate'] = items[index]['taskDate'];
                    returnData[index]['pv'] = items[index]['pv'];
                    if (items[index]['like']) {
                        returnData[index]['likeNum'] = items[index]['like'].length;
                    } else {
                        returnData[index]['likeNum'] = 0;
                    }
                    if (items[index]['comments']) {
                        items[index]['comments'].sort(function (a, b) {
                            return a.createDate < b.createDate ? 1 : -1;
                        });
                    }
                }
                resData['list'] = returnData;
                res.send({code: 200, data: resData});
            }
        });
    } else {
        res.send({code: 310, msg: msgProvider.msg_user_nofind});
    }
});

// add article
router.post('/add', function (req, res, next) {
    var db = req.db;

    if (req.session['userID']) {
        if (req.body.content) {

            req.body.content = util.storePicture(req.body.content);
            if (req.body.content === "") {
                res.send({code: 311, msg: msgProvider.msg_article_storepic_failed});
            } else {
                var formatDate = util.getMinuteDate();
                var muserid = util.getObjectID(req.session['userID']);

                req.body.creatorID = muserid;
                req.body.creatorName = req.session['userName'];
                req.body.editorID = muserid;
                req.body.editorName = req.session['userName'];
                req.body.createDate = formatDate;
                req.body.updateDate = formatDate;
                req.body.type = 0; //
                req.body.pv = 0;

                db.collection('article').insert(req.body, function (err, result) {
                    res.send(err ? {code: 500, msg: err} : {code: 200, msg: 'Add article successfully!'});
                });
            }
        } else {
            res.send({code: 311, msg: msgProvider.msg_word_err_input('article coentent')});
        }
    } else {
        res.send({code: 310, msg: msgProvider.msg_user_nofind});
    }
});

//add finish task's user
router.post('/addvisitor', function (req, res, next) {
    var db = req.db;
    if (req.session['userID']) {
        if (req.body.articleID) {
            var mongoID = util.getObjectID(req.body.articleID);
            var muesrID = util.getObjectID(req.session['userID']);

            // need to modify
            db.collection('article').find({
                '_id': mongoID,
                'taskDate': {'$exists': true}
            }).toArray(function (err, items) {
                if (err) {
                    res.send({code: 500, msg: err});
                } else {
                    if (items.length === 1) {
                        if (util.checkvalidDate(items[0]['taskDate'])) {
                            db.collection('article').update({
                                    '_id': mongoID, 'taskDate': {'$exists': true}
                                },
                                {$addToSet: {'visitors': {'userID': muesrID}}}, function (err) {
                                    res.send(err ? {code: 500, msg: err} : {
                                        code: 200,
                                        msg:msgProvider.msg_article_finsh_task
                                    });
                                });
                        } else {
                            res.send({code: 512, msg: msgProvider.msg_article_task_timeout});
                        }
                    } else {
                        res.send({code: 510, msg: msgProvider.msg_article_task_miss});
                    }
                }
            });
        } else {
            res.send({code: 311, msg: msgProvider.msg_word_err_input('article')});
        }
    } else {
        res.send({code: 310, msg: msgProvider.msg_user_nofind});
    }
});


router.post('/update', function (req, res, next) {
    var db = req.db;

    if (req.body.articleID && req.session['userID']) {
        var articleID = util.getObjectID(req.body.articleID);
        var muesrID = util.getObjectID(req.session['userID']);
        var curDate = util.getDayDate();
        var content = util.storePicture(req.body.content);

        if(content != "") {
            db.collection('article').update({'_id': articleID}, {
                '$set': {
                    'editorID': muesrID,
                    'editorName': req.session['userName'],
                    'updateDate': curDate,
                    'content': content
                },
                '$addToSet': {'tags': {'$each': req.body.tags}, 'categories': {'$each': req.body.categorys}} //TODO need to test
            }, function (err) {
                res.send(err ? {code: 500, msg: err} : {
                    code: 200,
                    msg: 'update article successfully'
                });
            });
        } else{
            res.send({code: 311, msg: msgProvider.msg_article_storepic_failed});
        }
    } else {
        res.send({
            code: 310,
            msg: msgProvider.msg_user_nofind
        })
    }
});


router.post('/addcomment', function (req, res, next) {
    var db = req.db;
    if (req.session['userID']) {
        if(req.body.articleID) {
            var curMSELDate = util.getSecondDate();
            var muserID = util.getObjectID(req.session['userID']);
            var articleID = util.getObjectID(req.body.articleID);
            db.collection('article').update({'_id': articleID}, {
                $addToSet: {
                    'comments': {
                        'userID': muserID, 'userName': req.session['userName'], 'content': req.body.content,
                        'createDate': curMSELDate
                    }
                }
            }, function (err) {
                if (err) {
                    res.send({code: 500, msg: err});
                } else {
                    db.collection('article').find({'_id': articleID}).sort({'updateDate': -1}).toArray(function (err, items) {
                        if (err) {
                            res.send({code: 500, msg: err});
                        } else {
                            if (items != undefined && items.length === 1) {
                                if (items[0]['comments']) {
                                    items[0]['comments'] = items[0]['comments'].sort(function (a, b) {
                                        return a.createDate < b.createDate ? 1 : -1;
                                    })
                                }
                                res.send({code: 200, msg: msgProvider.msg_article_addcomment, data: items[0]['comments']});
                            } else {
                                res.send({code: 510, msg: msgProvider.msg_article_showdetail_nofind}); //may cause issue
                            }
                        }
                    });
                }
            });
        } else {
            res.send({code: 311, msg: msgProvider.msg_word_err_input('article')})
        }
    } else {
        res.send({code: 310, msg: msgProvider.msg_user_nofind})
    }
});


router.post('/deletecomment', function (req, res, next) {
    var db = req.db;
    if (req.session['userID']) {
        if(req.body.articleID) {
            var muserID = util.getObjectID(req.session['userID']);
            var articleID = util.getObjectID(req.body.articleID);

            db.collection('article').update({'_id': articleID}, {
                $pop: {
                    'comments': {
                        'userID': muserID,
                        'createDate': req.body.createDate
                    }
                }
            }, function (err) {
                res.send(err ? {code: 500, msg: err} : {
                    code: 200,
                    msg: 'delete comment successfully'
                });
            });
        } else {
            res.send({code: 311, msg: msgProvider.msg_word_err_input('article')})
        }
    } else {
        res.send({code: 310, msg: msgProvider.msg_user_nofind})
    }
});


router.post('/addlike', function (req, res, next) {
    var db = req.db;

    if (req.session['userID']) {

        if(req.body.articleID) {
            var articleID = util.getObjectID(req.body.articleID);
            var muserID = util.getObjectID(req.session['userID']);

            db.collection('article').find({
                '_id': articleID,
                'likes.userID': {$eq: muserID}
            }).toArray(function (err, items) {
                if (err) {
                    res.send({code: 500, msg: err});
                }
                if (items && items.length === 0) {
                    db.collection('article').update({'_id': articleID}, {
                        $addToSet: {
                            'likes': {
                                'userID': muserID,
                                'userName': req.session['userName']
                            }
                        }
                    }, function (err) {
                        if (err) {
                            res.send({code: 500, msg: err});
                        } else {
                            db.collection('article').find({'_id': articleID}).toArray(function (err, items) {
                                if (err) {
                                    res.send({code: 500, msg: err});
                                } else {
                                    if (items.length === 1) {
                                        res.send({code: 200, msg: "you has liked it", data: items[0]['likes']});
                                    } else {
                                        res.send({code: 513, msg: msgProvider.msg_article_showdetail_nofind});
                                    }
                                }
                            });
                        }
                    });
                } else {
                    res.send({code: 202, msg: "you had liked it"});
                }
            });
        } else {
            res.send({code: 311, msg:msgProvider.msg_word_err_input('article')});
        }
    } else {
        res.send({code: 310, msg: msgProvider.msg_user_nofind});
    }
});


module.exports = router;

