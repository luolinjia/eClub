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

        var dom = '<div class="d-pic"><div class="d-pic-title">' + l10n.dy.dp + '</div><div class="d-pic-img"><a class="left"><span class="icon-arrow-left"></span></a><img src="' + data['saying']['url'] + '"><a class="right"><span class="icon-uniE616"></span></a></div></div><div class="d-saying"><div class="d-saying-title">' + l10n.dy.ds + '</div><div class="d-saying-detail"><p>' + data['saying']['english'] + '</p><p>' + data['saying']['chinese'] + '</p><p class="d-saying-detail-author">--' + data['saying']['author'] + '</p></div></div><div class="d-latest"><div class="d-word"><div class="d-word-title">' + l10n.dy.lw + '</div><div class="d-word-spelling">Vocabulary</div></div><div class="d-post"><div class="d-post-title">' + l10n.dy.lp + '</div><div data-articleid="' + data['article'][0]['id'] + '" class="d-post-content toPost">' + data['article'][0]['title'] + '</div></div></div>';
        self.append(dom);
        _dy.bindSwitch();
		_dy.bindWord();
        _content.bindToPost($('.toPost'));
//        _article.bindToUserArticle($('.author'));
    },
    renderDyContent: function () {
        reqDy.showDyList({}, function(data){
            if (data['code'] === 200) {
                var self = $('#content');
                self.data('requestURL', 'showDyList');
                _dy.renderContent(self, data['data']);
            } else {
                _layout.messenger(data['code'], data['msg']);
            }
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
		// set now date
		var now = new Date(),
			year = now.getFullYear(),
			month = now.getMonth() + 1,
			day = now.getDate();
		$('#content').data('dateY', year)
					.data('dateM', month)
			.data('dateD', day);
        // bind left click and right click
        $('.left', picImg).click(function(e) {
            e.stopPropagation();
//            console.log('left');
			var content = $('#content'),
				yearL = content.data('dateY'),
				monthL = content.data('dateM'),
				dayL = content.data('dateD') - 1;
			var nowMonth = monthL < 10 ? '0' + monthL : monthL,
				nowDay = dayL < 10 ? '0' + dayL : dayL;
			var preDate = nowMonth + '-' + nowDay + '-' + yearL;

            // call interface of _dy
			reqDy.imgLeft({data: {dayDate: preDate}}, function (data) {
				console.log(preDate);
				if (data['code'] === 200) {
					picImg.find('img').attr('src', data['data']['saying']['url']);
					content.data('dateD', dayL);
				} else {
					_layout.messenger(data['code'], data['msg']);
				}
			});
        });
        $('.right', picImg).click(function(e) {
            e.stopPropagation();
            console.log('right');
			var content = $('#content'),
				yearL = content.data('dateY'),
				monthL = content.data('dateM'),
				dayL = content.data('dateD') + 1;
			var nowMonth = monthL < 10 ? '0' + monthL : monthL,
				nowDay = dayL < 10 ? '0' + dayL : dayL;
			var nextDate = nowMonth + '-' + nowDay + '-' + yearL;

			// call interface of _dy
			reqDy.imgLeft({data: {dayDate: nextDate}}, function (data) {
				console.log(nextDate);
				if (data['code'] === 200) {
					picImg.find('img').attr('src', data['data']['saying']['url']);
					content.data('dateD', dayL);
				} else {
					_layout.messenger(data['code'], data['msg']);
				}
			});
        });
    },
	bindWord: function() {
		$('.d-word-spelling').click(function () {
			$.sticky('Vocabulary is Not available!!!');
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
    },
	imgLeft: function (options, callback) {
		$.ajax($.extend({
			type: 'POST',
			url: '/dy/lastpicture',
			dataType: 'JSON'
		}, options, true)).done(function (data) {
			if (data && $.isFunction(callback)) {
				callback(data);
			}
		});
	},
	imgRight: function (options, callback) {
		$.ajax($.extend({
			type: 'POST',
			url: '/dy/nextpicture',
			dataType: 'JSON'
		}, options, true)).done(function (data) {
			if (data && $.isFunction(callback)) {
				callback(data);
			}
		});
	}
};