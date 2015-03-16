/**
 * Created by luolinj on 3/5/2015.
 */
var express = require('express');
var mongodb = require('mongodb');
var moment = require('moment');
var router = express.Router();

// add an article
router.post('/add',function (req, res, next){
    console.log('/article/add');

    if (req.session['userId'] && req.body) {
        var db = req.db;
        var curDate = moment(new Date());
        var muserid = mongodb.BSONPure.ObjectID(req.session['userId']);

        req.body.creatorID = muserid;
        req.body.creatorName = req.session['username'];
        req.body.editorID = muserid;
        req.body.editorName = req.session['username'];
        req.body.createDate = curDate.format('MM-DD-YYYY HH:mm');
        req.body.updateDate = curDate.format('MM-DD-YYYY HH:mm');
        req.body.type = 0; //
        req.body.pv = 0;

        console.log('muserid' + muserid);
        console.log('now' + curDate.format('MM-DD-YYYY HH:mm'));

        db.collection('article').insert(req.body, function (err, result) {
            if (err) {
                console.log(err);
            }
            res.send(err == null ? {code: 200, msg: 'Add article successfully!'} : {code: 500, msg: err});
        });
    } else {
        console.log('null data!');
        res.send({code: 500, msg: 'Please input data'});
    }
});

// show dynamic index
router.post('/showdylist', function(req, res, next){
    var db = req.db, resData = {'article':[],'vocabulary':[]};
    /* bad hard code */
    var articleTotal = 3;
    var vocabularyTotal = 7;

    db.collection('article').find({}).sort({'updateDate': -1}).limit(articleTotal).toArray(function(err, item) {
        var index = 0;
        if(err) {
            res.send({code: 500, msg: 'Get article failed'});
        }
        for(index; index < item.length; index++) {
            resData.article[index] = item[index];
        }

        db.collection('vocabulary').find({}).sort({'updateDate': -1}).limit(vocabularyTotal).toArray(function (err, item) {
            if (err) {
                res.send({code:500,msg:'get vocabulary failed'});
            }
            for (var i = 0; i < item.length; i++) {
                resData.vocabulary[i] = item[i];
            }
            res.send({code: 200,msg: 'ok',data: resData});

        });
    });
});

// showArticleAll
router.post('/showallarticle', function(req, res, next){
    var db = req.db;
    db.collection('article').find({}).toArray(function(err,items){
        if(err){
            res.send({code: 500,msg: err});
        }
        res.send({code: 200,msg: 'ok',data: items});
    })
});



// mark the visitor
router.post('/addvisitor', function(req, res, next){
    var db = req.db;
    console.log("article id =>"+req.body.articleid);
    console.log("user id =>"+req.session['userId']);
    if(req.session['userId']) {
        var articleId = mongodb.BSONPure.ObjectID(req.body.articleid);
        var userId = mongodb.BSONPure.ObjectID(req.session['userId']);
        console.log("userId =>" + userId);

        db.collection('article').update({'_id': articleId}, {'$addToSet': {'visitors': {'userId': userId}}}, function (err) {
            if (err) {
                console.log("err =>" + err);
                res.send({code: 500, msg: 'add article visitor failed'});
            } else {
                res.send({code: 200, msg: 'add article visitor successfully'});
            }
        });
    } else {
        res.send({code: 500, msg: 'please login in'});
    }
});


module.exports = router;