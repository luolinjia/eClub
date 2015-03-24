/**
 * Created by luolinj on 3/12/2015.
 */
var _content = {
    renderPostContent: function (self, data) {
        self.empty();
        var list = [], flagInfo = '', header = $('#header');
        switch (self.data('requestURL')) {
            case 'allPostList': {
                flagInfo = '<span class="home">Home</span> > <span class="home-all-post">All Articles</span>';
            } break;
            case 'userPostList': {
                flagInfo = '<span class="home">Home</span> > <span class="home-all-post">All Articles</span> > ' + (data['list'][0]['creatorName'] + '\'s Articles');
            } break;
            case 'userPostListById': {
                flagInfo = '<span class="home">Home</span> > <span class="home-all-post">All Articles</span> > ' + (data['list'][0]['creatorName'] + '\'s Articles');
            } break;
            case 'allPostByCategory': {
                flagInfo = '<span class="home">Home</span> > <span class="home-all-post">All Articles</span> > Category: ' + data['selectCate'];
            } break;
            case 'allPostByTag': {
                flagInfo = '<span class="home">Home</span> > <span class="home-all-post">All Articles</span> > Tag: ' + data['selectTag'];
            } break;
            case 'taskPostList': {
                flagInfo = '<span class="home">Home</span> > <span class="home-all-post">All Articles</span> > Task Article';
            } break;
            default: {
                flagInfo = 'Other';
            }
        }

        list.push('<ul>');
        _content.renderPostList(self, data['list'], list);
        list.push('</ul>');

        var dom = '<div class="p-list"><div class="p-layout-info">' + flagInfo + '</div>' + list.join('') + '</div>';
        self.append(dom);
        var pLayoutInfo = $('.p-layout-info');
        if (header.attr('data-userRole') === '1') { _content.bindSetTask(self);}
        _content.bindToPost($('.toPost'));
        _article.bindToUserArticle($('.author'));
        _content.bindBreadCrumb($('.home', pLayoutInfo), $('.home-all-post', pLayoutInfo));
    },
    renderPostList: function (self, data, list) {
        var size = data.length, i = 0;
        for (; i < size; i++) {
            var item = data[i];
            list.push('<li><div class="p-list-li"><div class="p-list-li-content width85p"><div class="p-list-li-content-title"><div class="flag-color"><span class="icon-bookmark ' + (item['taskDate'] !== undefined ? 'p-task' : '') + '" title="Task"></span></div><div data-articleid="' + item['id'] + '" class="title toPost"><a href="javascript:;">' + item['title'] + '</a></div></div><div class="p-list-li-content-desc"><span class="time">' + item['updateDate'] + '</span><span data-userid="' + item['creatorID'] + '" class="author">' + item['editorName'] + '</span></div></div><div data-articleid="' + item['id'] + '" class="p-list-li-link width15p toPost"><span class="icon-uniE616"></span></div></div></li>');
        }
    },
    renderCommentsList: function (self, data) {
        if (data !== undefined && data.length !== 0) {
            var list = [], i = 0, size = data.length;
            for (; i< size; i++) {
                var item = data[i];
                list.push('<li><div class="p-comment-article-detail"><div class="p-comment-article-detail-title"><span class="author" data-userid="' + item['userID'] + '">' + item['userName'] + '</span><span class="time">' + item['createDate'] + '</span></div><div class="p-comment-article-detail-content"><p>' + item['content'] + '</p></div><div></div></div></li><hr/>');
            }
            self.append(list.join(''));
        }
    },
    renderNavi: function (self) {
        var dom = '<div class="main-holder"><div class="view"><img src="../images/Taopo_cover.png" alt="Vocabulary"/><div class="info"><h5>Vocabulary</h5>Vocabulary List<div class="btn"><span id="btnUserAddWord" class="icon-plus" title="Add A Vocabulary"></span><span id="btnUserListWord" class="icon-list" title="User Vocabulary List"></span></div></div></div><div class="view"><img src="../images/Ciudad_cover.png" alt="Reading"/><div class="info"><h5>Reading</h5>Reading Article<div class="btn"><span id="btnUserAddPost" class="icon-plus" title="Add A Article"></span><span id="btnUserListPost" class="icon-list" title="User Article List"></span></div></div></div></div>';
        self.append(dom);
        _content.showView();
        _content.bindCRUD();
    },
    bindSetTask: function (self) {
        $('li', self).mouseover(function() {
            var pList = $(this).find('.flag-color span'), hasTask = pList.hasClass('p-task');
            if (!hasTask) pList.fadeIn('fast');
        }).mouseleave(function () {
            var pList = $(this).find('.flag-color span'), hasTask = pList.hasClass('p-task');
            if (!hasTask) pList.fadeOut('fast');
        });
        $('.flag-color').find('span').click(function () {
            var thiz = $(this), articleId = thiz.parent().next().attr('data-articleid'), isTask = thiz.hasClass('p-task');
            if (!isTask) {
                reqContent.setTask({data: {articleID: articleId}}, function (data) {
                    if (data['code'] === 200) {
                        thiz.addClass('p-task');
                        thiz.parents('li').off();
                    }
                });
            }
        });
    },
    bindToPost: function (o) {
        o.click(function () {
            var dataId = $(this).attr('data-articleid'), self = $('#content');
            // empty content
            self.empty();
            // get the article data from db
            reqContent.toDetailPost({data: {'articleID': dataId}}, function (data) {
                _article.renderDetailPost(self, data['data'][0]);
            });
        });
    },
    showView: function() {
        $('.view').on('mouseover', function() {
            $(this).find('.info').fadeIn('fast');
        }).on('mouseleave', function() {
            $(this).find('.info').fadeOut('fast');
        });
        var hasLogin = $('.icon-user').parent().data('isLogin'), btnObj = $('.btn', $('.main-holder'));
        hasLogin ? btnObj.show() : btnObj.hide();
    },
    bindCRUD: function () {
        var btnWord = $('#btnUserListWord');
        btnWord.parents('.view')
            .click(function() {
                var self = $('#content');
                self.empty();
                _vb.renderVbCloud(self, '');
            });

        var btnPost = $('#btnUserListPost');
        btnPost.parents('.view')
            .click(function() { _article.toShowAllArticle(); });
        btnPost.click(function (e) {
            e.stopPropagation();
            _article.toShowUserArticle();
        });
        $('#btnUserAddPost').click(function (e) {
            e.stopPropagation();
            var self = $('#content');
            self.empty();
            _article.renderPushPost(self);
        });
    },
    bindBreadCrumb: function (home, article) {
        home.click(function () {
            _layout.bindToHome();
        });
        article.click(function () {
            _article.toShowAllArticle();
        });
    }
};

var reqContent = {
    showAllArticleList: function (options, callback) {
        $.ajax($.extend({
            type: 'POST',
            url: '/article/showall',
            dataType: 'JSON'
        }, options, true)).done(function(data){
            if (data && $.isFunction(callback)) {
                callback(data);
            }
        });
    },
    showUserArticleList: function (options, callback) {
        $.ajax($.extend({
            type: 'POST',
            url: '/article/showself',
            dataType: 'JSON'
        }, options, true)).done(function(data){
            if (data && $.isFunction(callback)) {
                callback(data);
            }
        });
    },
    showTaskArticleList: function (options, callback) {
        $.ajax($.extend({
            type: 'POST',
            url: '/article/showtask',
            dataType: 'JSON'
        }, options, true)).done(function(data){
            if (data && $.isFunction(callback)) {
                callback(data);
            }
        });
    },
    showUserArticleListByCreator: function (options, callback) {
        $.ajax($.extend({
            type: 'POST',
            url: '/article/showbycreator',
            dataType: 'JSON'
        }, options, true)).done(function(data){
            if (data && $.isFunction(callback)) {
                callback(data);
            }
        });
    },
    toDetailPost: function (options, callback) {
        $.ajax($.extend({
            type: 'POST',
            url: '/article/showdetail',
            dataType: 'JSON'
        }, options, true)).done(function(data){
            if (data && $.isFunction(callback)) {
                callback(data);
            }
        });
    },
    setTask: function (options, callback) {
        $.ajax($.extend({
            type: 'POST',
            url: '/article/settask',
            dataType: 'JSON'
        }, options, true)).done(function(data){
            if (data && $.isFunction(callback)) {
                callback(data);
            }
        });
    }
};