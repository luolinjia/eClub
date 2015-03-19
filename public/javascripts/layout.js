/**
 * Created by luolinj on 3/9/2015.
 */
$(function() {
    var userIcon = $('.icon-user').parent();
    _layout.handleSession();
    _layout.showLRBox(userIcon);
    _layout.bindeClub();
    // show index content
});

var _layout = {
    renderLogin: function(self) {
        var dom = '<div class="lr-box"><div class="lr-box-input"><input type="text" placeholder="Email"></div><div class="lr-box-input"><input type="password" placeholder="Password"></div><button id="btnLogin">Login</button></div>';
        self.append(dom);
        _layout.bindLogin($('.lr-box').find('input'), self);
    },
    renderHasLogin: function(self) {
        var dom = '<div class="lr-box"><div class="user-info"><span>Online Days : <span class="user-time">0</span></span></div><div class="user-info"><span>New Tasks : <span class="user-task">0</span></span></div><div><button id="btnChange">Change Password</button></div><button id="btnLogout">Logout</button></div>';
        self.append(dom);
        var userTask = $('.user-task'), userTime = $('.user-time');
        userTime.text(self.data('loginTime'));
        userTask.text(self.data('tasknum'));
        _layout.bindChange($('#btnChange'), self);
        _layout.bindLogout($('#btnLogout'), self);
        _layout.bindNewTask(userTask, self);
    },
    renderChangePwd: function(self) {
        var dom = '<div class="lr-box-input"><input type="password" placeholder="Old Password"></div><div class="lr-box-input"><input type="password" placeholder="New Password"></div><div class="lr-box-input"><input type="password" placeholder="Confirm Password"></div><button id="btnChanged">Change</button>';
        self.append(dom);
        _layout.bindChanged($('#btnChanged'), $('.lr-box').find('input'));
    },
    renderTips: function(flag, info) {
        return '<span class="' + (flag ? 'info-tip-green' : 'info-tip-red') + '">' + info + '</span>';
    },
    emptyWarningInfo: function (o) {
        $(o).keyup(function () {
            var lrbox = $('.lr-box');
            lrbox.find('input').css({'border-color': '#999'});
            lrbox.find('span').remove();
        });
    },
    bindLogin: function (o, self) {
        var oEmail = $(o[0]), oPwd = $(o[1]);

        _layout.emptyWarningInfo(o);

        $('#btnLogin').click(function(){

            // TODO validate Email and password
            if (oEmail.val() === '') {
                $(_layout.renderTips(false, 'Email can\'t be null!')).insertAfter(oEmail.parent());
                oEmail.css({'border-color': '#ef4036'});
                return;
            }
            if (oPwd.val() === '') {
                $(_layout.renderTips(false, 'Password can\'t be null!')).insertAfter(oPwd.parent());
                oPwd.css({'border-color': '#ef4036'});
                return;
            }

            var loginUser = {
                'email': oEmail.val(),
                'pwd': oPwd.val()
            };
            // login request
            reqHeader.checkLogin({
                data: loginUser
            }, function (res) {
                console.log(res);
                if (res['code'] === 510) {
                    $(_layout.renderTips(false, res['msg'])).insertAfter(oEmail.parent());
                    oEmail.css({'border-color': '#ef4036'});
                } else if (res['code'] === 511) {
                    $(_layout.renderTips(false, res['msg'])).insertAfter(oPwd.parent());
                    oPwd.css({'border-color': '#ef4036'});
                } else {
                    _layout.setLoginParams(res);
                }
            });
        });
    },
    bindChange: function(o, self) {
        // TODO
        o.click(function() {
            var lrbox = $('.lr-box');
            // remove lr-box inner content
            lrbox.empty();
            // render the relevant input
            _layout.renderChangePwd(lrbox);
            // after click change, remove lr-box
        });
    },
    bindChanged: function(o, inputs) {

        _layout.emptyWarningInfo(inputs);

        var oldPass = $(inputs[0]), newPass = $(inputs[1]), confirmPass = $(inputs[2]);
        o.click(function () {
            if (newPass.val() !== confirmPass.val()) {
                console.log('Confirm password is Not correct!');
                $(_layout.renderTips(false, 'Not correct!')).insertAfter(confirmPass.parent());
                confirmPass.css({'border-color': '#ef4036'});
                return;
            }
            var pwds = {
                'oldPass': oldPass.val(),
                'newPass': newPass.val()
            };
            reqHeader.changePwd({
                data: pwds
            }, function(res){
                console.log(res);
                if (res['code'] === 200) {
                    console.log('Change password success!');
                    $(_layout.renderTips(true, res['msg'])).insertAfter(confirmPass.parent());
                    setTimeout(function(){
                        $('.lr-box').remove();
                    }, 2000);
                } else if (res['code'] === 400) {
                    $(_layout.renderTips(false, res['msg'])).insertAfter(oldPass.parent());
                    oldPass.css({'border-color': '#ef4036'});
                }
            });
        });
    },
    bindNewTask: function (o, self) {
        o.click(function(){
            var contentObj = $('#content');
            // empty content
            contentObj.empty();
            reqHeader.getLatestNews({}, function (data) {
                _content.renderContent(contentObj, data);
            });
        });
    },
    bindLogout: function(o, self) {
        o.click(function() {
            // remove lr-box
            $('.lr-box').remove();
            // change icon from email to user
            // change data isLogin to false
            $(self).data('isLogin', false).html('<span class="icon-user"></span>User');
            // empty session
            reqHeader.logout({}, '');
            var content = $('#content');
            content.empty();
            $('#header').data('userId', '');
            _content.renderNavi(content);
        });
    },
    showLRBox: function (self, flag) {
        self.on('mouseover', function() {
            if ($(self).data('isLogin')) {
                if ($('.lr-box').length === 0) _layout.renderHasLogin(self);
            } else {
                if ($('.lr-box').length === 0) _layout.renderLogin(self);
            }
        }).on('mouseleave', function() {
            $('.lr-box').remove();
        });
    },
    bindeClub: function () {
        $('.logo').click(function () {
            _layout.bindToHome();
        });
    },
    bindToHome: function () {
        var self = $('#content');
        self.empty().data('requestURL', 'showAllList');
        _content.renderNavi(self);
    },
    setLoginParams: function (res) {
        var htmlCode = '<span class="icon-user"></span>',
            self = $('.icon-user').parent(), content = $('#content'), header = $('#header'),
            commentObj = $('.p-comment'), mainHolder = $('.main-holder'), btnLike = $('.btn-like');
        self.data('isLogin', true).html(htmlCode + res.data['email']);
        self.data('loginTime', Number(res.data['times'].length));
        self.data('tasknum', Number(res.data['tasknum']));
        header.data('userId', res['data']['_id']);
        commentObj.fadeIn('fast');

        _content.checkLikeBtn();
        btnLike.fadeIn('fast');
        btnLike.next().fadeIn('fast');
        if (mainHolder.length === 1) {
            content.empty().data('requestURL', 'showAllList');
            _content.renderNavi(content);
        }
    },
    handleSession: function () {
        reqHeader.getUserSession({}, function (res) {
            if (res) _layout.setLoginParams(res);
        });
    }
};

var reqHeader = {
    checkLogin: function (options, callback) {
        $.ajax($.extend({
            type: 'POST',
            url: '/users/login',
            dataType: 'JSON'
        }, options, true)).done(function(data){
            if (data && $.isFunction(callback)) {
                callback(data);
            }
        });
    },
    changePwd: function (options, callback) {
        $.ajax($.extend({
            type: 'POST',
            url: '/users/changepwd',
            dataType: 'JSON'
        }, options, true)).done(function(data){
            if (data && $.isFunction(callback)) {
                callback(data);
            }
        });
    },
    logout: function (options, callback) {
        $.ajax($.extend({
            type: 'POST',
            url: '/users/logout',
            dataType: 'JSON'
        }, options, true)).done(function(data){
            if (data && $.isFunction(callback)) {
                callback(data);
            }
        });
    },
    getUserSession: function (options, callback) {
        $.ajax($.extend({
            type: 'POST',
            url: '/users/getsession',
            dataType: 'JSON'
        }, options, true)).done(function(data){
            if (data && $.isFunction(callback)) {
                callback(data);
            }
        });
    }
};