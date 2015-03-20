var express = require('express');
var util = require('../public/common/utils.js');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    if(req.session['userID']) {
        var db = req.db,
            returnData = {};
        var muesrid = util.getObjectID(req.session['userID']);
        db.collection('user').find({'_id': muesrid}).toArray(function(err,items){
            if(err){res.send({code:500, msg:err});}

            if (items.length === 0) {
                res.send({code: 510, msg: 'user not found'});
            } else {
                returnData = items[0];
                db.collection('article').find({'visitors.userID': {$not:{$eq:muesrid}},'taskDate':{'$exists':true}}).toArray(function(err,records){
                    if(err) {
                        res.send({code: 500, msg: err});
                    }
                    returnData['tasknum'] = records.length;
                    res.render('index', {title: 'eClub', data:returnData});
                });
            }
        });
    } else {
        res.render('index', {title: 'eClub'});
    }
});

module.exports = router;
