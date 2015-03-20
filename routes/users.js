var express = require('express');
var util = require('../public/common/utils.js');

var router = express.Router();

// add user
router.post('/adduser', function (req, res, next) {
    var db = req.db;
    db.collection('user').insert(req.body, function (err, result) {
        res.send(
            (err === null) ? {
                code: 200,
                msg: 'Add successfully!'
            } : {
                code: 500,
                msg: err
            }
        );
    });
});

// inquire userlist
router.get('/userlist', function (req, res, next) {
    var db = req.db;
    db.collection('user').find().toArray(function (err, items) {
        res.json(items);
    });
});

// inquire user
router.get('/getuser/:email', function (req, res, next) {
    var db = req.db, email = req.params.email;
    db.collection('user').find({email: email}).toArray(function (err, items) {
        res.json(items);
    });
});

// check login user// check login user
router.post('/login', function (req, res, next) {
    var db = req.db, email = req.body.email, pwd = req.body.pwd;
    var returnData = {};
    console.log('email:' + email);
    console.log('pwd:' + pwd);
    db.collection('user').find({email: email}).toArray(function (err, items) {
        if (err) {
            res.send({code: 500, msg: err});
        }

        if (items === null || items.length == 0) {
            console.log('user not found');
            res.send({code: 510, msg: 'user not found'});
        } else {
            if (items[0].password === pwd) {
                console.log('login successfully!');
                req.session['email'] = email;
                req.session['password'] = items[0]['password'];
                req.session['userName'] = items[0]['userName'];
                req.session['userType'] = items[0]['userType'];
                req.session['userID'] = items[0]['_id'];
                returnData = items[0];

                /* check user if login before */
                var loginDay = util.getDayDate();
                var exsitDay = false;
                if (items[0]['times']) {
                    for (var i = 0; i < items[0]['times'].length; i++) {
                        if (items[0]['times'][i] === loginDay) {
                            exsitDay = true;
                            break;
                        }
                    }
                } else {
                    items[0]['times'] = [];
                }
                if (!exsitDay) {
                    items[0]['times'].push(loginDay);
                }

                db.collection('user').update({email: email}, {'$addToSet': {'times': loginDay}}, function (err) {
                    if (err) {
                        res.send({code: 500, msg: err});
                    }

                    var muesrid = util.getObjectID(items[0]['_id']);
                    db.collection('article').find({
                        'visitors.userID': {$not: {$eq: muesrid}},
                        'taskDate': {'$exists': true}
                    }).toArray(function (err, records) {
                        if (err) {
                            res.send({code: 500, msg: err});
                        }

                        returnData['tasknum'] = records.length;
                        res.send({code: 200, data: returnData});
                    });
                });
            } else {
                console.log('invalid password');
                res.send({code: 511, msg: 'invalid password'});
            }
        }
    });
});


// change password(need with MD5)
router.post('/changepwd', function (req, res, next) {
    var db = req.db,
        email = req.session['email'],
        password = req.session['password'],
        oldPass = req.body.oldPass,
        newPass = req.body.newPass;

    if (password !== oldPass) {
        res.send({code: 312, msg: 'Old Password is not correct!'});
        return;
    }

    db.collection('user').update({email: email}, {'$set': {'pwd': newPass}}, function (err) {
        if (err) {
            res.send({code: 500, msg: err});
        } else {
            req.session['pwd'] = newPass;
            res.send({code: 200, msg: 'Change successfully!'});
        }
    });
});

//layout and destroy session data
router.post('/logout', function (req, res, next) {
    if (req.session['userID']) {
        req.session.destroy(function (err) {
            if (err) {
                res.send({code: 520, msg: err});
            }
            delete req.session;
            res.send({code: 200, msg: 'logout successfully'});
        });
    } else {
        res.send({code: 310, msg: 'please login in'});
    }
});

//layout and destroy session data
router.post('/getsession', function (req, res, next) {
    if (req.session['userID']) {
        var db = req.db,
            returnData = {};
        var muesrid = util.getObjectID(req.session['userID']);
        db.collection('user').find({'_id': muesrid}).toArray(function (err, items) {
            if (err) {
                res.send({code: 500, msg: err});
            }

            if (items.length === 0) {
                res.send({code: 510, msg: 'user not found'});
            } else {
                returnData = items[0];
                db.collection('article').find({
                    'visitors.userID': {$not: {$eq: muesrid}},
                    'taskDate': {'$exists': true}
                }).toArray(function (err, records) {
                    if (err) {
                        res.send({code: 500, msg: err});
                    }
                    returnData['tasknum'] = records.length;
                    res.send({code: 200, data: returnData});
                });
            }
        });
    } else {
        res.render('index', {title: 'eClub'});
    }
});

module.exports = router;