var express = require('express');
var mongodb = require('mongodb');
var router = express.Router();

// add user
router.post('/adduser', function (req, res, next) {
    var db = req.db;
    db.collection('user').insert(req.body, function(err, result) {
        res.send(
            (err === null) ? {
                code: 200,
                msg: 'Add successfully!'
            } : {
                code: 500,
                msg: err}
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

//// check login user
//router.post('/login', function (req, res, next) {
//    var db = req.db, email = req.body.email, pwd = req.body.pwd;
//    console.log('email:' + email);
//    console.log('pwd:' + pwd);
//    db.collection('user').find({email: email}).toArray(function (err, items) {
//        if (items.length === 0) {
//            console.log('User not found');
//            res.send({code: 400, msg: 'User not found!'});
//        } else {
//            console.log(items);
//            if (items[0].pwd === pwd) {
//                console.log('login successfully!');
//                req.session['userId'] = items[0]['_id'];
//                req.session['email'] = email;
//                req.session['pwd'] = pwd;
//                req.session['time'] = items[0]['time'];
//                res.json(items[0]);
//                db.collection('user').update({email: email}, {'$set': {'time': req.session['time'] + 1}}, function(err){
//                    if (err) {
//                        res.send({code: 500, msg: err});
//                    }
//                });
//            } else {
//                console.log('invalid password');
//                res.send({code: 500, msg: 'invalid password'});
//            }
//        }
//    });
//});

router.post('/login', function (req, res, next) {
    var db = req.db, email = req.body.email, pwd = req.body.pwd, resData = {};
    console.log('email:' + email);
    console.log('pwd:' + pwd);
    db.collection('user').find({email: email}).toArray(function (err, items) {
        if (items.length === 0) {
            console.log('User not found');
            res.send({code: 400, msg: 'User not found'});
        } else {
            console.log(items);
            if (items[0].pwd === pwd) {
                console.log('login successfully!');
                req.session['time'] = items[0]['time'];
                req.session['username'] = items[0]['username'];
                resData = items[0];
                db.collection('user').update({email: email}, {'$set': {'time': req.session['time'] + 1}}, function(err){
                    if (err) {
                        res.send({code: 500, msg: err});
                    }

                    var userId = mongodb.BSONPure.ObjectID(items[0]['_id']);
                    req.session['userId'] = items[0]['_id'];
                    req.session['email'] = email;
                    console.log('user session: ' + req.session['userId']);

                    db.collection('article').find({'visitors.userId': {$not:{$eq:userId}}}).toArray(function(err,records){
                        if(err) {
                            console.log("err=>" + err);
                            res.send({code: 500, msg: err});
                        }
                        resData['newTask'] = records.length;
                        console.log("times=>" + records.length);
                        console.log("json=>" + resData);
                        res.send({code: 200,data: resData});
                    });

                });
            } else {
                console.log('invalid password');
                res.send({code: 500, msg: 'invalid password'});
            }
        }
    });
});


// change password
router.post('/changepwd', function (req, res, next) {
    var db = req.db,
        email = req.session['email'],
        password = req.session['pwd'],
        oldPass = req.body.oldPass,
        newPass = req.body.newPass;

    if (password !== oldPass) {
        res.send({code: 400, msg: 'Old Password is not correct!'});
        return;
    }

    db.collection('user').update({email: email}, {'$set': {'pwd': newPass}}, function(err){
        if (err) {
            res.send({code: 500, msg: err});
        } else {
            req.session['pwd'] = newPass;
            res.send({code: 200, msg: 'Change successfully!'});
        }
    });
});

router.post('/logout', function (req, res, next) {
    req.session.destroy(function(err) {
        if(err) {
            res.send({code: 500, msg: 'Session destroy failed!'})
        }
    });
    console.log('session: ' + req.session);
});

// add user
router.post('/word', function (req, res, next) {
    var db = req.db;
    db.collection('word').insert(req.body, function(err, result) {
        res.send(
            (err === null) ? {
                code: 200,
                msg: 'Add successfully!'
            } : {
                code: 500,
                msg: err}
        );
    });
});

// showArticleAll
router.post('/showword', function(req, res, next){
    var db = req.db;
    db.collection('word').find({}).toArray(function(err,items){
        if(err){
            res.send({code: 500,msg: err});
        }
        res.send({code: 200,msg: 'ok',data: items});
    })
});

module.exports = router;