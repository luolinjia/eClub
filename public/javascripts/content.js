/**
 * Created by luolinj on 3/12/2015.
 */
$(function () {

    _content.renderDyContent();
});

var _content = {
    initWysiwyg: function (o) {
        o.wysiwyg({
            classes: 'some-more-classes',
            toolbar: 'selection',
            buttons: {
                    insertimage: {
                        title: 'Insert image',
                        image: '\uf030', // <img src="path/to/image.png" width="16" height="16" alt="" />
                        //showstatic: true,    // wanted on the toolbar
                        showselection: true    // wanted on selection
                    },
                removeformat: {
                    title: 'Remove format',
                    image: '\uf12d' // <img src="path/to/image.png" width="16" height="16" alt="" />
                },
                insertvideo: {
                    title: 'Insert video',
                    image: '\uf03d', // <img src="path/to/image.png" width="16" height="16" alt="" />
                    //showstatic: true,    // wanted on the toolbar
                    showselection: true    // wanted on selection
                },
                insertlink: {
                    title: 'Insert link',
                    image: '\uf08e' // <img src="path/to/image.png" width="16" height="16" alt="" />
                },
                bold: {
                    title: 'Bold (Ctrl+B)',
                    image: '\uf032', // <img src="path/to/image.png" width="16" height="16" alt="" />
                    hotkey: 'b'
                },
                italic: {
                    title: 'Italic (Ctrl+I)',
                    image: '\uf033', // <img src="path/to/image.png" width="16" height="16" alt="" />
                    hotkey: 'i'
                },
                underline: {
                    title: 'Underline (Ctrl+U)',
                    image: '\uf0cd', // <img src="path/to/image.png" width="16" height="16" alt="" />
                    hotkey: 'u'
                },
                strikethrough: {
                    title: 'Strikethrough (Ctrl+S)',
                    image: '\uf0cc', // <img src="path/to/image.png" width="16" height="16" alt="" />
                    hotkey: 's'
                },
                forecolor: {
                    title: 'Text color',
                    image: '\uf1fc' // <img src="path/to/image.png" width="16" height="16" alt="" />
                },
                highlight: {
                    title: 'Background color',
                    image: '\uf043' // <img src="path/to/image.png" width="16" height="16" alt="" />
                }
            },
            submit: {
                title: 'Submit',
                image: '\uf00c' // <img src="path/to/image.png" width="16" height="16" alt="" />
            },
            selectImage: 'Click or drop image',
            placeholderUrl: 'www.example.com',
            placeholderEmbed: '<embed/>',
            maxImageSize: [800,600],
//            onImageUpload: function( insert_image ) {
//                $(this).parents('form')
//                    .attr('action','/path/to/file')
//                    .attr('method','POST')
//                    .attr('enctype','multipart/form-data')
//                    .ajaxSubmit({
//                       success: function(xhrdata,textStatus,jqXHR){
//                         var image_url = xhrdata;
//                         console.log( 'URL: ' + image_url );
//                         insert_image( image_url );
//                       }
//                    });
//            },
            onKeyPress: function( code, character, shiftKey, altKey, ctrlKey, metaKey ) {
                // E.g.: submit form on enter-key:
                //if( (code == 10 || code == 13) && !shiftKey && !altKey && !ctrlKey && !metaKey ) {
                //    submit_form();
                //    return false; // swallow enter
                //}
            }
        });
    },
    renderContent: function(self, data){
        self.empty();
        var list = [];
        list.push('<ul>');
        _content.renderPostList(self, data['article'], list);
        _content.renderWordList(self, data['vocabulary'], list);
        list.push('</ul>');

        var dom = '<div class="p-list"><div class="p-layout-info">Latest Trends</div>' + list.join('') + '</div>';
        self.append(dom);
        _content.bindToPost($('.toPost'));
        _content.bindToUserArticle($('.author'));
    },
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
        if (header.data('userRole') === '1') { _content.bindSetTask(self);}
        _content.bindToPost($('.toPost'));
        _content.bindToUserArticle($('.author'));
        _content.bindBreadCrumb($('.home', pLayoutInfo), $('.home-all-post', pLayoutInfo));
    },
    renderPostList: function (self, data, list) {
        var size = data.length, i = 0;
        for (; i < size; i++) {
            var item = data[i];
            list.push('<li><div class="p-list-li"><div class="p-list-li-content width85p"><div class="p-list-li-content-title"><div class="flag-color"><span class="icon-bookmark ' + (item['taskDate'] !== undefined ? 'p-task' : '') + '" title="Set Task"></span></div><div data-articleid="' + item['id'] + '" class="title toPost"><a href="javascript:;">' + item['title'] + '</a></div></div><div class="p-list-li-content-desc"><span class="time">' + item['updateDate'] + '</span><span data-userid="' + item['creatorID'] + '" class="author">' + item['editorName'] + '</span></div></div><div data-articleid="' + item['id'] + '" class="p-list-li-link width15p toPost"><span class="icon-uniE616"></span></div></div></li>');
        }
    },
    renderWordList: function (self, data, list) {
        var size = data.length, i = 0;
        for (; i < size; i++) {
            var item = data[i];
            list.push('<li><div class="p-list-li"><div class="p-list-li-content width85p"><div class="p-list-li-content-title"><div class="flag-color"></div><div data-articleid="' + item['spelling'] + '" class="title toWord"><a href="javascript:;">' + (item['spelling'] + ' ' + item['symbol']) + '</a></div></div><div class="p-list-li-content-desc"><span class="time">' + item['updateDate'] + '</span><span class="author">' + item['editorName'] + '</span></div></div><div data-articleid="' + item['spelling'] + '" class="p-list-li-link width15p toWord"><span class="icon-uniE616"></span></div></div></li>');
        }
    },
    renderDetailPost: function(self, data) {
        var categoriesList = [], tags = [], i = 0, j = 0, cSize = data['categories'].length, tSize = data['tags'].length,
            url = data['url'] ? data['url'].replace(/\\/g,"/") : '', header = $('#header');
        for (; i < cSize; i++) {
            var cItem = data['categories'][i];
            categoriesList.push('<p><a href="#">' + cItem + '</a></p>');
        }
        for (; j < tSize; j++) {
            var tItem = data['tags'][j];
            tags.push('<li><a href="#"><span>' + tItem + '</span></a></li>');
        }
        var dom = '<div class="p-back"><span class="icon-arrow-left"></span></div><div class="p-detail"><div class="p-category">' + categoriesList.join('') + '</div><div style="clear:both;margin-bottom:-50px;"></div><div class="p-title" data-articleid="' + data['_id'] + '"><h1>' + data['title'] + '</h1></div><div class="p-meta"><div class="dateblock"><span class="date">' + data['createDate'] + '</span><span>Views(' + data['pv'] + ')</span><span class="icon-heart btn-like"></span><span>(' + (data['likes'] !== undefined ? data['likes'].length : 0) + ')</span></div><div class="author"><div data-userid="' + data['creatorID'] + '" class="author-div1"><a href="javascript:;"><span class="author-name">' + data['creatorName'] + '</span></a></div><div class="author-div2"><audio src="' + url + '" controls="" autoplay></audio></div><div style="clear:both;"></div></div></div><div class="p-text">' + data['content'] + '</div><div class="p-tag"><ul>' + tags.join('') + '</ul></div><div style="clear:both;"></div><div class="p-comment"><div class="p-comment-state"><span><span id="commentNo">' + data['commentNum'] + '</span> comments</span></div><hr/><div class="p-comment-input"><textarea name="commentIn" id="commentIn" placeholder="Start a discussion..."></textarea><button id="btnComments">Submit</button></div><div class="p-comment-article"><ul></ul></div></div></div>';

        self.append(dom);
        header.data('likes', data['likes'] !== undefined ? data['likes'] : '0');
        _content.renderCommentsList($('ul', $('.p-comment')), data['comments']);
        _content.bindPostClicks(self);
        _content.bindComments();
        _content.bindLike();
        _content.bindToBack($('.p-back'));
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
        var dom = '<div class="main-holder"><div class="view"><img src="../images/Taopo_cover.png" alt="Vocabulary"/><div class="info"><h5>Vocabulary</h5>Vocabulary List<div class="btn"><span id="btnUserAddWord" class="icon-plus" title="Add A Vocabulary"></span><span id="btnUserListWord" class="icon-list" title="User Vocabulary List"></span></div></div></div><div class="view"><img src="../images/Ciudad_cover.png" alt="Reading"/><div class="info"><h5>Reading</h5>Reading post<div class="btn"><span id="btnUserAddPost" class="icon-plus" title="Add A Article"></span><span id="btnUserListPost" class="icon-list" title="User Article List"></span></div></div></div></div>';
        self.append(dom);
        _content.showView();
        _content.bindCRUD();
    },
    renderPushPost: function (self) {
        var dom = '<div class="p-add"><div class="p-add-fun"><h2>Push Article</h2></div><div class="p-add-title"><span><div class="mb5">Title</div><input type="text" placeholder="Add A Title"/></span></div><div class="p-add-category"><span><div class="mb5">Category</div><button class="selectedCate">Life</button><button>Economics</button><button>Science</button><button>Society</button><button>Technology</button><button>Uncategorized</button></span></div><div class="p-add-media"><a href="javascript:;" class="file">Upload mp3<form id="uploadAudio" name="uploadAudio" method="post" enctype="multipart/form-data" onsubmit="javascript: return false;"><input type="file"id="fulAudio" name="fulAudio" accept="audio/*" ></form></a></div><div class="mb5">Main Content</div><textarea id="editor" name="editor" placeholder="Type your text here..."></textarea><div class="p-add-tag"><span><div class="mb5">Tag</div><input type="text" placeholder="Add A Tag Or Multiple Tags, Splitted by ,"/></span></div><div class="p-add-source"><span><div class="mb5">Source URL</div><input type="text" placeholder="Source Website"/></span></div><button class="key">PUSH</button><button>CANCEL</button></div>';
        self.append(dom);
        _content.initWysiwyg($('#editor', self));
        _content.bindCate($('.p-add-category').find('button'));
        _content.checkPushPostForm();
        // TODO validate the form format!!!
        _content.submitPushPost(self);
    },
    bindCate: function (o) {
        o.click(function () {
            var thiz = $(this), cate = thiz.text();
            if ($('.selectedCate').length === 1) {
                o.removeClass('selectedCate');
            }
            thiz.toggleClass('selectedCate');
        });
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
                _content.renderDetailPost(self, data['data'][0]);
                reqContent.addVisitor({data: {'articleID': dataId}}, '');
            });
        });
    },
    bindToUserArticle: function (o) {
        o.click(function () {
            var self = $('#content');
            self.data('backInfo', $(this));
            _content.toShowUserArticleById($(this));
        });
    },
    bindToBack: function (o) {
        o.click(function () {
            // tell the previous operation
            var self = $('#content'),
                flag = self.data('requestURL');

            self.empty();
            if (flag === 'showDyList') {
                _content.renderDyContent();
            } else if (flag === 'allPostList') {
                _content.toShowAllArticle();
            } else if (flag === 'userPostList') {
                _content.toShowUserArticle();
            } else if (flag === 'userPostListById') {
                _content.toShowUserArticleById(self.data('backInfo'));
            } else if (flag === 'allPostByCategory') {
                _content.toShowArticleByCate(self.data('backInfo'));
            } else if (flag === 'allPostByTag') {
                _content.toShowArticleByTag(self.data('backInfo'));
            }
        });
    },
    renderDyContent: function () {
        reqContent.showDyList({}, function(data){
            var self = $('#content');
            self.data('requestURL', 'showDyList');
            _content.renderContent(self, data['data']);
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
            .click(function() { _content.toShowAllArticle(); });
        btnPost.click(function (e) {
            e.stopPropagation();
            _content.toShowUserArticle();
        });
        $('#btnUserAddPost').click(function (e) {
            e.stopPropagation();
            var self = $('#content');
            self.empty();
            _content.renderPushPost(self);
        });
    },
    submitPushPost: function (self) {
        $('.key', self).click(function () {
            _content.checkArticleForm();
            var tags = [], categories = [], url = undefined;
            tags = $('.p-add-tag', self).find('input').val().split(',');
            categories[0] = $('.p-add-category', self).find('.selectedCate').text();

            var form = $('#uploadAudio');
//            self.append(form);

            form.ajaxSubmit({
                dataType: "json",
                url: "/article/addaudio",
                type: "POST",
                success: function (data) {
                    if (data['code'] === 200) {
                        url = data['data']['url'];
                    }
                    var articleContent = $('#editor').wysiwyg('shell').getHTML();

                    var articleObj = {
                        'title': $('.p-add-title', self).find('input').val(),
//                'content': $('#editor').wysiwyg('shell').getHTML().replace(/\'/g, "\\'"),
                        'content': articleContent,
                        'tags': tags,
                        'categories': categories,
                        'url':url
                    };

                    reqContent.pushPost({data: articleObj}, function (data) {
                        if (data['code'] === 200) {
                            console.log('add article success!');
                            var self = $('#content');
                            self.empty();
                            reqContent.showUserArticleList({}, function (data) {
                                _content.renderPostContent(self, data['data']);
                            });
                        }
                    });
                },error: function(){

                }
            });
        });
    },
    toShowAllArticle: function () {
        var self = $('#content');
        self.data('requestURL', 'allPostList');
        reqContent.showAllArticleList({}, function (data) {
            _content.renderPostContent(self, data['data']);
        });
    },
    toShowUserArticle: function () {
        var self = $('#content');
        self.data('requestURL', 'userPostList');
        reqContent.showUserArticleList({}, function (data) {
            _content.renderPostContent(self, data['data']);
        });
    },
    toShowUserArticleById: function (o) {
        var self = $('#content');
        self.data('requestURL', 'userPostListById');
        reqContent.showUserArticleListByCreator({data: {'creatorID': o.attr('data-userid')}}, function (data) {
            _content.renderPostContent(self, data['data']);
        });
    },
    toShowArticleByCate: function (o) {
        var category = o.text(), content = $('#content');
        content.data('requestURL', 'allPostByCategory');
        reqContent.getPostListByCate({data: {'category': category}}, function (data) {
            _content.renderPostContent(content, data['data']);
        });
    },
    toShowArticleByTag: function (o) {
        var tag = o.text(), content = $('#content');
        content.data('requestURL', 'allPostByTag');
        reqContent.getPostListByTag({data: {'tag': tag}}, function (data) {
            _content.renderPostContent(content, data['data']);
        });
    },
    bindComments: function () {
        var textarea = $('#commentIn'), hasLogin = $('.icon-user').parent().data('isLogin'), commentObj = $('.p-comment'), pLike = $('.btn-like');
        textarea.focus(function () {
            var thiz = $(this);
            thiz.css({'height': '80px'}).next().fadeIn('fast');
        }).focusout(function () {
            var thiz = $(this);
            thiz.css({'height': '20px'}).next().fadeOut('fast');
        });
        hasLogin ? commentObj.show() : commentObj.hide();
        hasLogin ? pLike.show() : pLike.hide();
        hasLogin ? pLike.next().show() : pLike.next().hide();
        $('#btnComments').click(function () {
            var commentObj = {
                'articleID': $('.p-title').attr('data-articleid'),
                'content': $('#commentIn').val()
            };
            reqContent.pushComments({data: commentObj}, function (data) {
                if (data['code'] === 200) {
                    var self = $('ul', $('.p-comment'));
                    // set the textarea is null
                    textarea.val('');
                    self.empty();
                    // update the comments
                    _content.renderCommentsList(self, data['data']);
                    $('#commentNo').text(data['data'].length);
                } else {
                    alert('add failed!');
                }
            });
        });
    },
    bindLike: function () {
        _content.checkLikeBtn();
        // click the btn-like
        $('.btn-like').click(function () {
            var thiz = $(this);
            thiz.addClass('p-like');
            // call add like interface
            reqContent.addLike({data: {articleID: $('.p-title').attr('data-articleid')}}, function (data) {
                console.log(data);
                // update the like number
                thiz.next().text('(' + 1 + ')');
            });
        });
    },
    bindPostClicks: function (self) {

        $('.author-div1', self).click(function () {
            _content.toShowUserArticleById($(this));
        });
        $('p',$('.p-category')).click(function () {
            var self = $('#content');
            self.data('backInfo', $(this));
            _content.toShowArticleByCate($(this));
        });
        $('li', $('.p-tag').find('ul')).click(function () {
            var self = $('#content');
            self.data('backInfo', $(this));
            _content.toShowArticleByTag($(this));
        });
    },
    bindBreadCrumb: function (home, article) {
        home.click(function () {
            _layout.bindToHome();
        });
        article.click(function () {
            _content.toShowAllArticle();
        });
    },
    addCheckInfo: function (self) {
        var dom = '<span style="color: #ef4036;margin-left: 10px;">Required!</span>';
        $(dom).insertAfter(self);
    },
    checkPushPostForm: function () {
        // check title
        $('.p-add-title input').focusout(function () {
            var thiz = $(this);
            if (thiz.val() === '') {
                thiz.css({'border-color': '#ef4036'});
                if (thiz.next().length === 0) _content.addCheckInfo(thiz);
            }
        }).keyup(function () {
            var thiz = $(this);
            thiz.css({'border-color': '#999'});
            thiz.next().remove();
        });
//        // check text content
//        $('#editor').focusout(function () {
//            var thiz = $(this), thizDiv = $('.wysiwyg-editor');
//            if (thiz.val() === '') {
//                thizDiv.css({'border-color': '#ef4036'});
//                _content.addCheckInfo(thizDiv);
//            }
//        }).keyup(function () {
//            var thiz = $(this), thizDiv = $('.wysiwyg-editor');
//            thizDiv.css({'border-color': '#999'});
////            thizDiv.next().remove();
//        });
        // check tag
        $('.p-add-tag input').focusout(function () {
            var thiz = $(this);
            if (thiz.val() === '') {
                thiz.css({'border-color': '#ef4036'});
                if (thiz.next().length === 0) _content.addCheckInfo(thiz);
            }
        }).keyup(function () {
            var thiz = $(this);
            thiz.css({'border-color': '#999'});
            thiz.next().remove();
        });
    },
    checkArticleForm: function () {
        var titleInput = $('.p-add-title input'), mainText = $('#editor'), tagInput = $('.p-add-tag input');
        if (titleInput.val() === '') {
            titleInput.css({'border-color': '#ef4036'});
            if (titleInput.next().length === 0) _content.addCheckInfo(titleInput);
            return;
        }
//        if (mainText.val() === '') {
//            return;
//        }
        if (tagInput.val() === '') {
            tagInput.css({'border-color': '#ef4036'});
            if (tagInput.next().length === 0) _content.addCheckInfo(tagInput);
            return;
        }
    },
    checkLikeBtn: function () {
        // tell whether author like
        var header = $('#header'), userId = header.data('userId'), btnLike = $('.btn-like'), likes = header.data('likes'), hasLiked = false;
        if (likes !== undefined && likes !== '0') {
            var i = 0, size = likes.length;
            for (; i < size; i++) {
                if (likes[i]['userID'] === userId)  hasLiked = true;
            }
        }
        hasLiked ? btnLike.addClass('p-like') : '';
    }
};

var reqContent = {
    showDyList: function (options, callback) {
        $.ajax($.extend({
            type: 'POST',
            url: '/article/showdylist',
            dataType: 'JSON'
        }, options, true)).done(function(data){
            if (data && $.isFunction(callback)) {
                callback(data);
            }
        });
    },
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
    pushPost: function (options, callback) {
        $.ajax($.extend({
            type: 'POST',
            url: '/article/add',
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
    pushComments: function (options, callback) {
        $.ajax($.extend({
            type: 'POST',
            url: '/article/addcomment',
            dataType: 'JSON'
        }, options, true)).done(function(data){
            if (data && $.isFunction(callback)) {
                callback(data);
            }
        });
    },
    addVisitor: function (options, callback) {
        $.ajax($.extend({
            type: 'POST',
            url: '/article/addvisitor',
            dataType: 'JSON'
        }, options, true)).done(function(data){
            if (data && $.isFunction(callback)) {
                callback(data);
            }
        });
    },
    getPostListByCate: function (options, callback) {
        $.ajax($.extend({
            type: 'POST',
            url: '/article/showbycategory',
            dataType: 'JSON'
        }, options, true)).done(function(data){
            if (data && $.isFunction(callback)) {
                callback(data);
            }
        });
    },
    getPostListByTag: function (options, callback) {
        $.ajax($.extend({
            type: 'POST',
            url: '/article/showbytag',
            dataType: 'JSON'
        }, options, true)).done(function(data){
            if (data && $.isFunction(callback)) {
                callback(data);
            }
        });
    },
    addLike: function (options, callback) {
        $.ajax($.extend({
            type: 'POST',
            url: '/article/addlike',
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