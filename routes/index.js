var express = require('express');
var util = require('../public/javascripts/common/utils.js');
var msgProvider = require('../public/javascripts/common/msgProvider.js');

var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    if (req.session['userID']) {
        var db = req.db,
            returnData = {};
        var muesrID = util.getObjectID(req.session['userID']);
        db.collection('user').find({'_id': muesrID}).toArray(function (err, items) {
            if (err) {
                res.send({code: 500, msg: err});
            }

            else {
                if (items.length === 0) {
                    res.send({code: 510, msg: msgProvider.msg_user_nofind});
                } else {
                    returnData = items[0];
                    db.collection('article').find({
                        'visitors.userID': {$not: {$eq: muesrID}},
                        'taskDate': {'$exists': true}
                    }).toArray(function (err, records) {
                        if (err) {
                            res.send({code: 500, msg: err});
                        }
                        returnData['tasknum'] = records.length;
                        res.render('index', {title: 'eClub', data: returnData});
                    });
                }
            }
        });
    } else {
        res.render('index', {title: 'eClub'});
    }
});

module.exports = router;
