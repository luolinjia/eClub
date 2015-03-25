/**
 * Created by luolinj on 3/20/2015.
 */
var _article = {
    initWysiwyg: function (o) {
        o.wysiwyg({
            classes: 'some-more-classes',
            toolbar: 'selection',
            buttons: {
                removeformat: {
                    title: 'Remove format',
                    image: '\uf12d' // <img src="path/to/image.png" width="16" height="16" alt="" />
                },
                insertimage: {
                    title: 'Insert image',
                    image: '\uf030', // <img src="path/to/image.png" width="16" height="16" alt="" />
                    //showstatic: true,    // wanted on the toolbar
                    showselection: true    // wanted on selection
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
            onKeyPress: function( code, character, shiftKey, altKey, ctrlKey, metaKey ) {
                // E.g.: submit form on enter-key:
                //if( (code == 10 || code == 13) && !shiftKey && !altKey && !ctrlKey && !metaKey ) {
                //    submit_form();
                //    return false; // swallow enter
                //}
            }
        });
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
        var dom = '<div class="p-back"><span class="icon-arrow-left"></span></div><div class="p-detail"><div class="p-category">' + categoriesList.join('') + '</div><div style="clear:both;margin-bottom:-50px;"></div><div class="p-title" data-articleid="' + data['_id'] + '" data-articletask="' + data['taskDate'] + '"><h1>' + data['title'] + '</h1></div><div class="p-meta"><div class="dateblock"><span class="date">' + data['createDate'] + '</span><span>Views(' + data['pv'] + ')</span><span class="icon-heart btn-like"></span><span>(' + (data['likes'] !== undefined ? data['likes'].length : 0) + ')</span></div><div class="author"><div data-userid="' + data['creatorID'] + '" class="author-div1"><a href="javascript:;"><span class="author-name">' + data['creatorName'] + '</span></a></div><div class="author-div2"><audio src="' + url + '" controls="" autoplay></audio></div><div class="cb"></div></div></div><div class="p-text">' + data['content'] + '</div><div class="p-tag"><ul>' + tags.join('') + '</ul></<div></div><div class="cb"></div><div class="p-comment"><div class="p-comment-state"><span><span id="commentNo">' + data['commentNum'] + '</span>' + l10n.article.comment + '</span></div><hr/><div class="p-comment-input"><textarea name="commentIn" id="commentIn" placeholder="Start a discussion..."></textarea><button id="btnComments">' + l10n.article.submit + '</button></div><div class="p-comment-article"><ul></ul></div></div></div>';

        var sourceDom = '<div class="p-sourceUrl"><span>' + l10n.article.sw2 + '</span><span><a href="' + data['sourceUrl'] + '" target="_blank">' + data['sourceUrl'] + '</a></span></div>';

        self.append(dom);
        header.data('likes', data['likes'] !== undefined ? data['likes'] : '0');
        if (data['sourceUrl'] !== undefined) {_article.isShowSourceUrl(self, sourceDom);}
        _article.renderCommentsList($('ul', $('.p-comment')), data['comments']);
        _article.bindPostClicks(self);
        _article.bindComments();
        _article.bindLike();
        _article.bindToBack($('.p-back'));
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
    renderPushPost: function (self) {
        var dom = '<div class="p-add"><div class="p-add-fun"><h2>' + l10n.article.pa + '</h2></div><div class="p-add-title"><span><div class="mb5">' + l10n.article.title + '</div><input type="text" placeholder="Add A Title"/></span></div><div class="p-add-category"><span><div class="mb5">' + l10n.article.cate + '</div><button class="selectedCate">' + l10n.article.life + '</button><button>' + l10n.article.economic + '</button><button>' + l10n.article.science + '</button><button>' + l10n.article.society + '</button><button>' + l10n.article.technology + '</button><button>' + l10n.article.uncate + '</button></span></div><div class="p-add-media"><a href="javascript:;" class="file">' + l10n.article.um + '<form id="uploadAudio" name="uploadAudio" method="post" enctype="multipart/form-data" onsubmit="javascript: return false;"><input type="file" id="fulAudio" name="fulAudio" accept="audio/*" ></form></a></div><div class="mb5">' + l10n.article.mc + '</div><textarea id="editor" name="editor" placeholder="Type your text here..."></textarea><div class="p-add-tag"><span><div class="mb5">' + l10n.article.tag + '</div><input type="text" placeholder="Add A Tag Or Multiple Tags, Splitted by ,"/></span></div><div class="p-add-source"><span><div class="mb5">' + l10n.article.sw + '</div><input id="sourceURL" type="text" placeholder="Source Website"/></span></div><button class="key">' + l10n.article.push + '</button><button id="cancelPost">' + l10n.article.cancel + '</button></div>';
        self.append(dom);
        _article.initWysiwyg($('#editor', self));
        _article.bindCate($('.p-add-category').find('button'));
        _article.checkPushPostForm();
        _article.submitPushPost(self);
    },
    isShowSourceUrl: function (self, dom) {
        self.append(dom);
        $('.p-sourceUrl').insertAfter('.p-tag');
    },
    bindPostClicks: function (self) {

        $('.author-div1', self).click(function () {
            _article.toShowUserArticleById($(this));
        });
        $('p',$('.p-category')).click(function () {
            var self = $('#content');
            self.data('backInfo', $(this));
            _article.toShowArticleByCate($(this));
        });
        $('li', $('.p-tag').find('ul')).click(function () {
            var self = $('#content');
            self.data('backInfo', $(this));
            _article.toShowArticleByTag($(this));
        });
    },
    bindComments: function () {
        var textarea = $('#commentIn'), hasLogin = $('.icon-user').parent().data('isLogin'), commentObj = $('.p-comment'), pLike = $('.btn-like'), pTitle = $('.p-title'),articleId = pTitle.attr('data-articleid'), isTask = pTitle.attr('data-articletask');
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
                'articleID': articleId,
                'content': $('#commentIn').val()
            };
            reqArticle.pushComments({data: commentObj}, function (data) {
                if (data['code'] === 200) {
                    var self = $('ul', $('.p-comment'));
                    // set the textarea is null
                    textarea.val('');
                    self.empty();
                    // update the comments
                    _article.renderCommentsList(self, data['data']);
                    $('#commentNo').text(data['data'].length);
                    // record the visitor if it's task post
                    if (isTask !== undefined) {
                        reqArticle.addVisitor({data: {'articleID': articleId}}, function(data) {console.log(data);});
                    }
                } else {
                    alert('add failed!');
                }
            });
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
                _article.toShowAllArticle();
            } else if (flag === 'userPostList') {
                _article.toShowUserArticle();
            } else if (flag === 'userPostListById') {
                _article.toShowUserArticleById(self.data('backInfo'));
            } else if (flag === 'allPostByCategory') {
                _article.toShowArticleByCate(self.data('backInfo'));
            } else if (flag === 'allPostByTag') {
                _article.toShowArticleByTag(self.data('backInfo'));
            } else if (flag === 'taskPostList') {
                _article.toShowTaskArticle(self.data('backInfo'));
            }
        });
    },
    bindCate: function (o) {
        o.click(function () {
            var thiz = $(this);
            if ($('.selectedCate').length === 1) {
                o.removeClass('selectedCate');
            }
            thiz.toggleClass('selectedCate');
        });
    },
    bindToUserArticle: function (o) {
        o.click(function () {
            var self = $('#content');
            self.data('backInfo', $(this));
            _article.toShowUserArticleById($(this));
        });
    },
    checkPushPostForm: function () {
        // check title
        $('.p-add-title input').focusout(function () {
            var thiz = $(this);
            if (thiz.val().trim() === '') {
                thiz.css({'border-color': '#ef4036'});
                if (thiz.next().length === 0) _article.addCheckInfo(thiz);
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
            if (thiz.val().trim() === '') {
                thiz.css({'border-color': '#ef4036'});
                if (thiz.next().length === 0) _article.addCheckInfo(thiz);
            }
        }).keyup(function () {
            var thiz = $(this);
            thiz.css({'border-color': '#999'});
            thiz.next().remove();
        });
    },
    submitPushPost: function (self) {
        $('.key', self).click(function () {
            var flag = _article.checkArticleForm();
            if (flag) {
                var tags = [], categories = [], url = undefined;

                tags = $('.p-add-tag', self).find('input').val().split(',');
                categories[0] = $('.p-add-category', self).find('.selectedCate').text();

                $('#uploadAudio').ajaxSubmit({
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
                            'content': articleContent,
                            'tags': tags,
                            'categories': categories,
                            'url':url,
                            'sourceUrl': $('#sourceURL').val()
                        };

                        reqArticle.pushPost({data: articleObj}, function (data) {
                            if (data['code'] === 200) {
                                console.log('add article success!');
                                var self = $('#content');
                                self.empty();
                                self.data('requestURL', 'userPostList');
                                reqContent.showUserArticleList({}, function (data) {
                                    _content.renderPostContent(self, data['data']);
                                });
                            }
                        });
                    },error: function(){

                    }
                });
            }
        });
        $('#cancelPost').click(function () {
            _layout.bindToHome();
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
        reqArticle.getPostListByCate({data: {'category': category}}, function (data) {
            _content.renderPostContent(content, data['data']);
        });
    },
    toShowArticleByTag: function (o) {
        var tag = o.text(), content = $('#content');
        content.data('requestURL', 'allPostByTag');
        reqArticle.getPostListByTag({data: {'tag': tag}}, function (data) {
            _content.renderPostContent(content, data['data']);
        });
    },
    toShowTaskArticle: function (o) {
        var contentObj = $('#content');
        contentObj.data('requestURL', 'taskPostList');
        reqContent.showTaskArticleList({}, function (data) {
            _content.renderPostContent(contentObj, data['data']);
        });
    },
    bindLike: function () {
        _article.checkLikeBtn();
        // click the btn-like
        $('.btn-like').click(function () {
            var thiz = $(this);
            thiz.addClass('p-like');
            // call add like interface
            reqArticle.addLike({data: {articleID: $('.p-title').attr('data-articleid')}}, function (data) {
                console.log(data);
                // update the like number
                thiz.next().text('(' + data['data'].length + ')');
            });
        });
    },
    addCheckInfo: function (self) {
        var dom = '<span style="color: #ef4036;margin-left: 10px;">' + l10n.article.required + '</span>';
        $(dom).insertAfter(self);
    },
    checkArticleForm: function () {
        var titleInput = $('.p-add-title input'), mainText = $('#editor'), tagInput = $('.p-add-tag input');
        if (titleInput.val().trim() === '') {
            titleInput.css({'border-color': '#ef4036'});
            if (titleInput.next().length === 0) _article.addCheckInfo(titleInput);
            return false;
        }
//        if (mainText.val() === '') {
//            return;
//        }
        if (tagInput.val().trim() === '') {
            tagInput.css({'border-color': '#ef4036'});
            if (tagInput.next().length === 0) _article.addCheckInfo(tagInput);
            return false;
        }
        return true;
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

var reqArticle = {
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
    }
};