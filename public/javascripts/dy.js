/**
 * Created by luolinj on 3/24/2015.
 */
$(function () {
    _dy.renderDyContent();
});

var _dy = {
    renderContent: function(self, data){
        self.empty();
//        var list = [];
//        list.push('<ul>');
//        _content.renderPostList(self, data['article'], list);
//        _content.renderWordList(self, data['vocabulary'], list);
//        list.push('</ul>');

        var dom = '<div class="d-pic"><div class="d-pic-title">' + l10n.dy.dp + '</div><div class="d-pic-img"><a class="left"><span class="icon-arrow-left"></span></a><img src="' + data['saying']['url'] + '"><a class="right"><span class="icon-uniE616"></span></a></div></div><div class="d-saying"><div class="d-saying-title">' + l10n.dy.ds + '</div><div class="d-saying-detail"><p>' + data['saying']['english'] + '</p><p>' + data['saying']['chinese'] + '</p><p class="d-saying-detail-author">--' + data['saying']['author'] + '</p></div></div><div class="d-latest"><div class="d-word"><div class="d-word-title">' + l10n.dy.lw + '</div><div class="d-word-spelling">Vocabulary</div></div><div class="d-post"><div class="d-post-title">' + l10n.dy.lp + '</div><div class="d-post-content">' + data['article'][0]['title'] + '</div></div></div>';
        self.append(dom);
        _dy.bindSwitch();
//        _content.bindToPost($('.toPost'));
//        _article.bindToUserArticle($('.author'));
    },
    renderDyContent: function () {
        reqDy.showDyList({}, function(data){
            var self = $('#content');
            self.data('requestURL', 'showDyList');
            _dy.renderContent(self, data['data']);
        });
    },
    bindSwitch: function() {
        // bind d-pic mouseover
        $('.d-pic').mouseover(function () {
            var thiz = $(this);
            thiz.find('.left').fadeIn('fast');
            thiz.find('.right').fadeIn('fast');
        }).mouseleave(function () {
            var thiz = $(this);
            thiz.find('.left').fadeOut('fast');
            thiz.find('.right').fadeOut('fast');
        });
        var picImg = $('.d-pic-img');
        // bind left click and right click
        $('.left', picImg).click(function(e) {
            e.stopPropagation();
            console.log('left');
            // call interface of _dy
        });
        $('.right', picImg).click(function(e) {
            e.stopPropagation();
            console.log('right');
            // call interface of _dy
        });
    }
};

var reqDy = {
    showDyList: function (options, callback) {
        $.ajax($.extend({
            type: 'POST',
            url: '/dy/showdylist',
            dataType: 'JSON'
        }, options, true)).done(function (data) {
            if (data && $.isFunction(callback)) {
                callback(data);
            }
        });
    }
};