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
//                    insertimage: {
//                        title: 'Insert image',
//                        image: '\uf030', // <img src="path/to/image.png" width="16" height="16" alt="" />
//                        //showstatic: true,    // wanted on the toolbar
//                        showselection: true    // wanted on selection
//                    },
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
//                onImageUpload: function( insert_image ) {
//                    $(this).parents('form')
//                        .attr('action','/path/to/file')
//                        .attr('method','POST')
//                        .attr('enctype','multipart/form-data')
//                        .ajaxSubmit({
//                           success: function(xhrdata,textStatus,jqXHR){
//                             var image_url = xhrdata;
//                             console.log( 'URL: ' + image_url );
//                             insert_image( image_url );
//                           }
//                        });
//                },
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

        var dom = '<div class="p-list">' + list.join('') + '</div>';
        self.append(dom);
        _content.bindToPost($('.toPost'), data['article']);
    },
    renderPostContent: function (self, data) {
        self.empty();
        var list = [], flagInfo = data['username'] === undefined ? 'All Articles' : data['username'];
        list.push('<ul>');
        _content.renderPostList(self, data, list);
        list.push('</ul>');

        var dom = '<div class="p-list"><div>' + flagInfo + '</div>' + list.join('') + '</div>';
        self.append(dom);
        _content.bindToPost($('.toPost'), data);
    },
    renderPostList: function (self, data, list) {
        var size = data.length, i = 0;
        for (; i < size; i++) {
            var item = data[i];
            list.push('<li><div class="p-list-li"><div class="p-list-li-style width25p">' + item['editorName'] + '</div><div class="p-list-li-style width60p"><a href="#">' + item['title'] + '</a></div><div data-articleid="' + item['_id'] + '" class="p-list-li-style width15p toPost"><span class="icon-uniE616"></span></div></div></li>');
        }
    },
    renderWordList: function (self, data, list) {
        var size = data.length, i = 0;
        for (; i < size; i++) {
            var item = data[i];
            list.push('<li><div class="p-list-li"><div class="p-list-li-style width25p">' + item['editor'] + '</div><div class="p-list-li-style width60p"><a href="#">' + item['title'] + '</a></div><div id="toPost" class="p-list-li-style width15p"><span class="icon-uniE616"></span></div></div></li>');
        }
    },
    renderDetailPost: function(self, data) {
        var categoriesList = [], tags = [], i = 0, j = 0, cSize = data['categories'].length, tSize = data['tags'].length;
        for (; i < cSize; i++) {
            var cItem = data['categories'][i];
            categoriesList.push('<a href="#">' + cItem + '</a>');
        }
        for (; j < tSize; j++) {
            var tItem = data['tags'][j];
            tags.push('<li><a href="#"><span>' + tItem + '</span></a></li>');
        }
        var dom = '<div class="p-back"><span class="icon-arrow-left"></span></div><div class="p-detail"><div class="p-category"><p>' + categoriesList.join('') + '</p></div><div class="p-title"><h1>' + data['title'] + '</h1></div><div class="p-meta"><div class="dateblock"><span class="date">' + data['createDate'] + '</span></div><div class="author"><div class="author-div1"><a href="javascript:;"><span class="author-name">' + data['creatorName'] + '</span></a></div><div class="author-div2"><audio src="../audio/' + data['url'] + '" controls="" autoplay></audio></div><div style="clear: both;"></div></div></div><div class="p-text">' + data['content'] + '</div><div class="p-tag"><ul>' + tags.join('') + '</ul></div><div class="p-comment"></div></div>';

        self.append(dom);
        _content.bindToBack($('.p-back'));
    },
    renderNavi: function (self) {
        var dom = '<div class="main-holder"><div class="view"><img src="../images/Taopo_cover.png" alt="Vocabulary"/><div class="info"><h5>Vocabulary</h5>Vocabulary List<div class="btn"><span id="btnUserAddWord"class="icon-plus" title="Add A Vocabulary"></span><span id="btnUserListWord" class="icon-list" title="User Vocabulary List"></span></div></div></div><div class="view"><img src="../images/Ciudad_cover.png" alt="Reading"/><div class="info"><h5>Reading</h5>Reading post<div class="btn"><span id="btnUserAddPost" class="icon-plus" title="Add A Article"></span><span id="btnUserListPost" class="icon-list" title="User Article List"></span></div></div></div></div>';
        self.append(dom);
        _content.showView();
        _content.bindCRUD();
    },
    renderPushPost: function (self) {
        var dom = '<div class="p-add"><div class="p-add-fun"><h2>Push Article</h2></div><div class="p-add-title"><span><input type="text" placeholder="Add A Title"/></span></div><div class="p-add-category"><span><input type="text" placeholder="Add A Category Or Multiple Categories, Splitted by ,"/></span></div><div class="p-add-media"><a href="javascript:;" class="file">Upload mp3<input type="file" name="" accept="audio/mpeg"></a></div><textarea id="editor" name="editor" placeholder="Type your text here..."></textarea><div class="p-add-tag"><span><input type="text" placeholder="Add A Tag Or Multiple Tags, Splitted by ,"/></span></div><div class="p-add-source"><span><input type="text" placeholder="Source Website"/></span></div><button class="key">PUSH</button><button>CANCEL</button></div>';
        self.append(dom);
        _content.initWysiwyg($('#editor', self));
        // TODO validate the form format!!!
        _content.submitPushPost(self);
    },
    bindToPost: function (o, data) {
        o.click(function () {
            var dataId = $(this).attr('data-articleid'), self = $('#content'), i = 0, size = data.length, articleData = {};
            // empty content
            self.empty();
            // get the article data from data param
            for (; i < size; i++) {
                var item = data[i];
                if (item['_id'] === dataId) {
                    articleData = item;
                }
            }
            // render the post page
            _content.renderDetailPost(self, articleData);
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
    },
    bindCRUD: function () {
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
            var tags = [], categories = [];
            tags = $('.p-add-tag', self).find('input').val().split(',');
            categories = $('.p-add-category', self).find('input').val().split(',');
            var articleObj = {
                'title': $('.p-add-title', self).find('input').val(),
//                'content': $('#editor').wysiwyg('shell').getHTML().replace(/\'/g, "\\'"),
                'content': $('#editor').wysiwyg('shell').getHTML(),
                'tags': tags,
                'categories': categories
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