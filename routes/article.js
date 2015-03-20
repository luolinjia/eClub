/**
 * Created by wangsen on 3/5/2015.
 */
var express = require('express');
var util = require('../public/common/utils.js');
var formidable = require('formidable');
var fs = require('fs');

var AUDIO_UPLOAD_FOLDER = '/audio/';

var router = express.Router();


router.post('/addaudio', function(req, res) {

    var errflag = false;
    var form = new formidable.IncomingForm();   //创建上传表单
    form.encoding = 'utf-8';		//设置编辑
    form.uploadDir = 'public' + AUDIO_UPLOAD_FOLDER;	 //设置上传目录
    form.keepExtensions = true;	 //保留后缀
    form.maxFieldsSize = 512 * 1024 * 1024;   //文件大小

    form.parse(req, function(err, fields, files) {

        if (err) {
            res.send({ code:500, msg:err});
            errflag = true;
            return;
        }

        if(!errflag) {
            if(files.fulAudio) {
                var extName = '';  //后缀名
                switch (files.fulAudio.type) {
                    case 'audio/wav':
                        extName = 'wav';
                        break;
                    case 'audio/mp3':
                        extName = 'mp3';
                        break;
                }

                if(extName.length == 0){
                    res.send({ code:200, msg:'ok', data:{'url':''}});
                    return;
                }

                var tempPath = files.fulAudio.path;
                var newPath =  files.fulAudio.path.substr(0,tempPath.length-4)+'_'+ util.getDayDate()+ '.' + extName;

                fs.renameSync(tempPath, newPath);  //重命名

                var delPublicPath = newPath.substring(7,newPath.length);

                res.send({ code:200, msg:'ok', data:{'url':delPublicPath}});
                console.log("upload successfully");
            } else {
                res.send({ code:200, msg:'ok', data:{'url':''}});
            }
        }
    });
});


// show dynamic index
router.post('/showdylist', function(req, res, next){
    var db = req.db;
    var returnData = {'article':[],'vocabulary':[]};
    /* bad hard code */
    var articleTotal = 3;
    var vocabularyTotal = 7;

    db.collection('article').find({}).sort({'updateDate':-1}).limit(articleTotal).toArray(function(err, items) {
        if(err) {
            res.send({code:500, msg:err});
        }
        for(var index = 0; index< items.length; index++) {
            returnData.article[index] = {};
            returnData.article[index]['id'] = items[index]['_id'];
            returnData.article[index]['creatorID'] = items[index]['creatorID'];
            returnData.article[index]['creatorName'] = items[index]['creatorName'];
            returnData.article[index]['editorName'] = items[index]['editorName'];
            returnData.article[index]['title'] = items[index]['title'];
            returnData.article[index]['updateDate'] = items[index]['updateDate'];
            returnData.article[index]['taskDate'] = items[index]['taskDate'];
            returnData.article[index]['pv'] = items[index]['pv'];
            if(items[index]['like']) {
                returnData.article[index]['likeNum'] = items[index]['like'].length;
            } else {
                returnData.article[index]['likeNum'] = 0;
            }
        }

        db.collection('vocabulary').find({}).sort({'updateDate': -1}).limit(vocabularyTotal).toArray(function (err, records) {
            if(err) {
                res.send({code:500,msg:err});
            }
            for (var i = 0; i < records.length; i++) {
                returnData.vocabulary[i] = {};
                returnData.vocabulary[i]['spelling'] = records[i]['spelling'];
                returnData.vocabulary[i]['symbol'] = records[i]['symbol'];
                returnData.vocabulary[i]['creatorName'] = records[i]['creatorName'];
                returnData.vocabulary[i]['editorName'] = records[i]['editorName'];
                returnData.vocabulary[i]['updateDate'] = records[i]['updateDate'];
            }
            res.send({code:200,msg:'ok',data:returnData});

        });
    });
});

//show all articles
router.post('/showall', function(req, res, next){
    var db = req.db;
    var returnData = [], resData = {};

    db.collection('article').find({}).sort({'updateDate':-1}).toArray(function(err,items){
        if(err){
            res.send({code:500,msg:err});
        }

        for(var index = 0; index< items.length; index++) {
            returnData[index] = {};
            returnData[index]['id'] = items[index]['_id'];
            returnData[index]['creatorID'] = items[index]['creatorID'];
            returnData[index]['creatorName'] = items[index]['creatorName'];
            returnData[index]['editorName'] = items[index]['editorName'];
            returnData[index]['title'] = items[index]['title'];
            returnData[index]['updateDate'] = items[index]['updateDate'];
            returnData[index]['taskDate'] = items[index]['taskDate'];
            returnData[index]['pv'] = items[index]['pv'];
            if(items[index]['like']) {
                returnData[index]['likeNum'] = items[index]['like'].length;
            } else {
                returnData[index]['likeNum'] = 0;
            }
        }
        resData['list'] = returnData;
        res.send({code:200,msg:'ok',data:resData});
    })
});

//show creator all articles
router.post('/showself', function(req, res, next){
    var db = req.db;
    var returnData = [], resData = {};

    if(req.session['userID']) {
        var muserid = util.getObjectID(req.session['userID']);

        db.collection('article').find({"creatorID":muserid}).sort({'updateDate':-1}).toArray(function (err, items) {
            if (err) {
                res.send({code: 500, msg: err});
            }

            for(var index = 0; index< items.length; index++) {
                returnData[index] = {};
                returnData[index]['id'] = items[index]['_id'];
                returnData[index]['creatorID'] = items[index]['creatorID'];
                returnData[index]['creatorName'] = items[index]['creatorName'];
                returnData[index]['editorName'] = items[index]['editorName'];
                returnData[index]['title'] = items[index]['title'];
                returnData[index]['updateDate'] = items[index]['updateDate'];
                returnData[index]['taskDate'] = items[index]['taskDate'];
                returnData[index]['pv'] = items[index]['pv'];
                if(items[index]['like']) {
                    returnData[index]['likeNum'] = items[index]['like'].length;
                } else {
                    returnData[index]['likeNum'] = 0;
                }
            }
            resData['list'] = returnData;
            res.send({code: 200, msg: 'ok', data: resData});
        })
    } else {
        res.send({code: 310, msg: 'Please login in'});
    }
});

// show article by category
router.post('/showbycategory',function (req, res, next){
    var db = req.db;
    var returnData = [], resData = {};
    if(req.body.category) {
        db.collection('article').find({"categories":{$in:[ req.body.category ]}}).sort({'updateDate':-1}).toArray(function (err, items) {
            if (err) {
                res.send({code: 500, msg: err});
            }

            for(var index = 0; index < items.length; index++) {
                returnData[index] = {};
                returnData[index]['id'] = items[index]['_id'];
                returnData[index]['creatorID'] = items[index]['creatorID'];
                returnData[index]['creatorName'] = items[index]['creatorName'];
                returnData[index]['editorName'] = items[index]['editorName'];
                returnData[index]['title'] = items[index]['title'];
                returnData[index]['updateDate'] = items[index]['updateDate'];
                returnData[index]['taskDate'] = items[index]['taskDate'];
                returnData[index]['pv'] = items[index]['pv'];
                if(items[index]['like']) {
                    returnData[index]['likeNum'] = items[index]['like'].length;
                } else {
                    returnData[index]['likeNum'] = 0;
                }
            }
            resData['list'] = returnData;
            resData['selectCate'] = req.body.category;
            res.send({code: 200, msg: 'ok', data: resData});
        });
    } else {
        res.send({code: 311, msg: 'please choose category'});
    }
});

// show articles by tag
router.post('/showbytag',function (req, res, next){
    var db = req.db;
    var returnData = [], resData = {};
    if(req.body.tag) {
        db.collection('article').find({"tags":{$in:[ req.body.tag ]}}).sort({'updateDate':-1}).toArray(function (err, items) {
            if (err) {
                res.send({code: 500, msg: err});
            }

            for(var index = 0; index< items.length; index++) {
                returnData[index] = {};
                returnData[index]['id'] = items[index]['_id'];
                returnData[index]['creatorID'] = items[index]['creatorID'];
                returnData[index]['creatorName'] = items[index]['creatorName'];
                returnData[index]['editorName'] = items[index]['editorName'];
                returnData[index]['title'] = items[index]['title'];
                returnData[index]['updateDate'] = items[index]['updateDate'];
                returnData[index]['taskDate'] = items[index]['taskDate'];
                returnData[index]['pv'] = items[index]['pv'];
                if(items[index]['like']) {
                    returnData[index]['likeNum'] = items[index]['like'].length;
                } else {
                    returnData[index]['likeNum'] = 0;
                }
            }
            resData['list'] = returnData;
            resData['selectTag'] = req.body.tag;
            res.send({code: 200, msg: 'ok', data: resData});
        });
    } else {
        res.send({code: 311, msg: 'please choose tag'});
    }
});

// show article by creator
router.post('/showbycreator',function (req, res, next){
    var db = req.db;
    var returnData = [], resData = {};
    if(req.body.creatorID) {
        var muserid = util.getObjectID(req.body.creatorID);

        db.collection('article').find({"creatorID":muserid}).sort({'updateDate':-1}).toArray(function (err, items) {
            if (err) {
                res.send({code: 500, msg: err});
            }

            for(var index = 0; index< items.length; index++) {
                returnData[index] = {};
                returnData[index]['id'] = items[index]['_id'];
                returnData[index]['creatorID'] = items[index]['creatorID'];
                returnData[index]['creatorName'] = items[index]['creatorName'];
                returnData[index]['editorName'] = items[index]['editorName'];
                returnData[index]['title'] = items[index]['title'];
                returnData[index]['updateDate'] = items[index]['updateDate'];
                returnData[index]['taskDate'] = items[index]['taskDate'];
                returnData[index]['pv'] = items[index]['pv'];
                if(items[index]['like']) {
                    returnData[index]['likeNum'] = items[index]['like'].length;
                } else {
                    returnData[index]['likeNum'] = 0;
                }
            }
            resData['list'] = returnData;
            res.send({code: 200, msg: 'ok', data: resData});
        });
    } else {
        res.send({code: 311, msg: 'please choose creator'});
    }
});

//show detail article content
router.post('/showdetail',function (req, res, next){
    var db = req.db;
    var returnData = [];
    if(req.body.articleID) {
        var articleid = util.getObjectID(req.body.articleID);
        db.collection('article').update({'_id':articleid},{$inc:{'pv':1}},function(err){
            if (err) {
                res.send({code: 500, msg: err});
            }

            db.collection('article').find({"_id":articleid}).toArray(function (err, items) {
                if (err) {
                    res.send({code: 500, msg: err});
                }
                if(items.length === 1) {
                    returnData[0] = items[0];
                    if(items[0]['like']) {
                        returnData[0]['likeNum'] = items[0]['like'].length;
                    } else {
                        returnData[0]['likeNum'] = 0;
                    }
                    if(items[0]['comments']) {
                        returnData[0]['commentNum'] = items[0]['comments'].length;
                    } else {
                        returnData[0]['commentNum'] = 0;
                    }
                    res.send({code: 200, msg: 'ok', data: returnData});
                } else {
                    res.send({code: 510, msg: "article data isn't exist"});
                }
            });
        });

    } else {
        res.send({code: 311, msg: 'please choose article'});
    }
});

//admin user set the task article
router.post('/settask',function (req, res, next){
    var db = req.db;
    console.log("userType=>"+req.session['userType']);
    if(req.session['userType'] === '1') {
        if(req.body.articleID) {
            var marticleid = util.getObjectID(req.body.articleID);
            var taskDate = util.getDayDate();

            db.collection('article').update({'_id': marticleid}, {$set: {'taskDate': taskDate}}, function (err) {
                if (err) {
                    res.send({code: 500, msg: err});
                }

                res.send({code: 200, msg: 'ok'});
            });
        } else {
            res.send({code:310, msg:'please choose article'});
        }
    } else {
        res.send({code: 313, msg: 'please login in admin role'});
    }
});

//show no finish task articles by creator
router.post('/showtask',function (req, res, next){
    var db = req.db;
    var returnData = [];
    if(req.session['userID']) {
        console.log("userID"+req.session['userID']);
        var muserid = util.getObjectID(req.session['userID']);

        db.collection('article').find({'visitors.userID': {$not:{$eq:muserid}},'taskDate':{'$exists':true}}).toArray(function(err,items){
            if (err) {
                res.send({code: 500, msg: err});
            }

            for(var index = 0; index< items.length; index++) {
                returnData[index] = {};
                returnData[index]['id'] = items[index]['_id'];
                returnData[index]['creatorName'] = items[index]['creatorName'];
                returnData[index]['editorName'] = items[index]['editorName'];
                returnData[index]['title'] = items[index]['title'];
                returnData[index]['updateDate'] = items[index]['updateDate'];
                returnData[index]['type'] = items[index]['type'];
                returnData[index]['pv'] = items[index]['pv'];
                if(items[index]['like']) {
                    returnData[index]['likeNum'] = items[index]['like'].length;
                } else {
                    returnData[index]['likeNum'] = 0;
                }
            }

            res.send({code:200,msg: 'ok', data:returnData});
        });
    } else {
        res.send({code: 310, msg: 'please login in'});
    }
});

// add article
router.post('/add',function (req, res, next){
    console.log('/article/add');
    var db = req.db;

    if (req.session['userID']) {
        if(req.body) {

            req.body.content = util.storePicture(req.body.content);
            console.log("new content=>"+req.body.content);

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

            console.log('muserid' + muserid);
//            console.log('now' + curDate.format('MM-DD-YYYY HH:mm'));

            db.collection('article').insert(req.body, function (err, result) {
                res.send(err? {code: 500, msg: err}: {code: 200, msg: 'Add article successfully!'});
            });
        } else {
            res.send({code: 311, msg: 'Please input data'});
        }
    } else {
        res.send({code: 310, msg: 'Please login in'});
    }
});

//add finish task's user
router.post('/addvisitor', function(req, res, next){
    var db = req.db;
    console.log('addvisitor session ID: ' + req.session['userID'] + ', ' + req.body.articleID);
    if(req.session['userID']) {
        if(req.body.articleID) {
            var mongoid = util.getObjectID(req.body.articleID);
            var muesrid = util.getObjectID(req.session['userID']);

            // need to modify
            db.collection('article').find({ '_id': mongoid,'taskDate': {'$exists': true}}).toArray(function(err, items){
                if(err){ res.send({code: 500, msg: err}); }
                console.log(err + ',' + items.length);
                if(items.length === 1) {
                    if(util.checkvalidDate(items[0]['taskDate'])) {
                        console.log("flag=>" + items[0]);
                        db.collection('article').update({
                                '_id': mongoid, 'taskDate': {'$exists': true}
                            },
                            {$addToSet: {'visitors': {'userID': muesrid}}}, function (err) {
                                res.send(err ? {code: 500, msg: err} : {
                                    code: 200,
                                    msg: 'add article visitor successfully'
                                });
                            });
                    } else {
                        res.send({code: 512, msg: 'you are so late'});
                    }
                } else {
                    res.send({code: 510, msg: 'task article is not exist'});
                }
            });
        } else {
            res.send({code: 311, msg: 'please choose article'});
        }
    } else {
        res.send({code: 310, msg: 'please login in'});
    }
});



router.post('/update',function(req, res, next){
    var db = req.db;

    if(req.body.articleid && req.session['userID']) {
        var articleid = util.getObjectID(req.body.articleid);
        var muesrid = util.getObjectID(req.session['userID']);
        var curDate = util.getDayDate();

        console.log("articleid=>" + articleid);
        console.log('user id=>'+muesrid);
        console.log('content=>'+req.body.content);

        db.collection('article').update({'_id':articleid},{
            '$set':{'editorID':muesrid,'editorName':req.session['userName'], 'updateDate':curDate, 'content':req.body.content},
            '$addToSet':{'tags':{'$each':req.body.tags}, 'categories': {'$each':req.body.categorys}}
        },function(err){
            res.send(err ? {code: 500, msg: err} : {
                code: 200,
                msg: 'update article successfully'
            });
        });
    } else {
        res.send({
            code:310,
            msg:'please login in'
        })
    }
});


router.post('/addcomment', function(req, res, next){
    var db = req.db;
    console.log(req.session['userID'] + ',' + req.body.articleID);
    if(req.session['userID'] && req.body.articleID) {
        var curMSELDate = util.getMSELDate();
        var muserid = util.getObjectID(req.session['userID']);
        var articleid = util.getObjectID(req.body.articleID);
        console.log(',' + muserid + ',' + curMSELDate + ',' + articleid);
        db.collection('article').update({'_id':articleid},{$addToSet: {'comments':{
            'userID':muserid, 'userName':req.session['userName'], 'content': req.body.content,
            'createDate':curMSELDate}}}, function(err){
            if(err){res.send({code:500, msg:err});}

            db.collection('article').find({'_id':articleid}).sort({'updateDate':-1}).toArray(function(err,items){
                if(err){res.send({code:500, msg:err});}

                if(items != undefined && items.length === 1) {
                    res.send({code: 200, msg: 'add comment successfully',data:items[0]['comments']});
                } else {
                    res.send({code:510, msg:"find no comments"}); //may cause issue
                }
            });
        });
    } else {
        res.send({code:310,msg:'please login in[empty data]'})
    }
});


router.post('/deletecomment', function(req, res, next){
    var db = req.db;
    if(req.session['userID'] && req.body.articleid) {
        var muserid = util.getObjectID(req.session['userID']);
        var articleid = util.getObjectID(req.body.articleid);

        db.collection('article').update({'_id':articleid},{$pop:{'comments':{'userID':muserid,'createDate': req.body.createDate}}}, function(err){
            res.send(err ? {code: 500, msg: err} : {
                code: 200,
                msg: 'delete comment successfully'
            });
        });
    } else {
        res.send({code:310,msg:'please login in[empty data]'})
    }
});


router.post('/addlike',function (req, res, next){
    var db = req.db;

    if(req.session['userID'] && req.body.articleID) {
        var articleid = util.getObjectID(req.body.articleID);
        var muserid = util.getObjectID(req.session['userID']);

        db.collection('article').find({'_id':articleid, 'likes.userID':{$eq:muserid}}).toArray(function(err,items){
            if(err) {
                res.send({code: 500, msg: err});
            }
            /*
            console.log("username =>"+req.session['userName']);
            console.log("items.length =>"+items.length);
            */
            if(items && items.length === 0) {
                db.collection('article').update({'_id':articleid},{$addToSet:{'likes':{'userID':muserid, 'userName':req.session['userName']}}},function(err){
                    res.send(err ? {code: 500, msg: err} : {
                        code: 200,
                        msg: 'ok'
                    });
                });
            } else {
                res.send({code: 200, msg: "you have like it"});
            }
        });
    } else {
        res.send({code: 310, msg: 'please login in'});
    }
});


module.exports = router;

