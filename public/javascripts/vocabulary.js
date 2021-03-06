/**
 * Created by luolinj on 3/18/2015.
 */
$(function () {

});

var _vb = {
    renderVbCloud: function (self, data) {

        var tempData = [{
            '_id': '343241413123dsfe3243243',
            'spelling': 'vocabulary',
            'symbol':'[və\'kæbjəlɛri]',
            'creators': [{
                'creatorID': '5506c75d007108bb75cd03c7',
                'creatorName': 'llj'
            }],
            'descriptions': [{
                'rank': '1',
                'pos': 'n',
                'words': [{
                    'chinese': '词汇，词汇量',
                    'english': 'word',
                    'createDate': '03-18-2015 12:30',
                    'tag': 'llj'
                }, {
                    'chinese': '语言量',
                    'english': 'come on',
                    'createDate': '03-18-2015 12:30',
                    'tag': 'llj'
                }],
                'phrases': [{
                    'createDate': '03-18-2015 12:30',
                    'english': 'xx',
                    'chinese': '叉叉',
                    'tag': 'xxxxx'
                }, {
                    'createDate': '03-18-2015 12:30',
                    'english': 'take off',
                    'chinese': '起飞',
                    'tag': 'xxxxx'
                }],
                'sentences': [{
                    'createDate': '03-18-2015 12:30',
                    'english': 'waoo, that\'s good',
                    'chinese': '那很好啊！',
                    'tag': 'llj'
                }, {
                    'createDate': '03-18-2015 12:30',
                    'english': 'good luck',
                    'chinese': '好运！',
                    'tag': 'llj'
                }]
            }, {
                'rank': '2',
                'pos': 'adj',
                'words': [{
                    'chinese': '啥',
                    'english': 'oh yes',
                    'createDate': '03-18-2015 12:30',
                    'tag': 'llj'
                }],
                'phrases': [{
                    'createDate': '03-18-2015 12:30',
                    'english': 'wwww',
                    'chinese': '呜呜呜',
                    'tag': 'xxxxx'
                }, {
                    'createDate': '03-18-2015 12:30',
                    'english': 'go home',
                    'chinese': '回家',
                    'tag': 'xxxxx'
                }],
                'sentences': [{
                    'createDate': '03-18-2015 12:30',
                    'english': 'waoo, that\'s goodsssssssssssssss',
                    'chinese': '那很好啊！',
                    'tag': 'llj'
                }, {
                    'createDate': '03-18-2015 12:30',
                    'english': 'good luck',
                    'chinese': '好运！',
                    'tag': 'llj'
                }]
            }],
            'freq': 17,
            'pv': 2,
            'url': ''
        },
			{
            'spelling': 'interpret',
            'symbol':'ɪn\'tɝprɪt',
            'descriptions': [{
                'creatorID': '5506c75d007108bb75cd03c7',
                'creatorName': 'llj',
                'pos': 'vt',
                'chinese': '说明；口译',
                'english': 'If you interpret something in a particular way, you decide that this is its meaning or significance.',
                'phrases': []
            },{
                'creatorID': '5506c75d007108bb75cd03c7',
                'creatorName': 'llj',
                'pos': 'vi',
                'chinese': '解释；翻译',
                'english': 'word',
                'phrases': []
            }],
            'freq': 2,
            'creatorID': '5506c75d007108bb75cd03c7',
            'creatorName': 'llj',
            'editorID': '5506c75d007108bb75cd03c7',
            'editorName': 'llj',
            'createDate': '03-18-2015 12:30',
            'updateDate': '03-18-2015 12:30'
        },
			{
            'spelling': 'something',
            'symbol':'\'sʌmθɪŋ',
            'descriptions': [{
                'creatorID': '5506c75d007108bb75cd03c7',
                'creatorName': 'llj',
                'pos': 'pron',
                'chinese': '某事；某物',
                'english': '',
                'phrases': []
            },{
                'creatorID': '5506c75d007108bb75cd03c7',
                'creatorName': 'llj',
                'pos': 'n',
                'chinese': '重要的人；值得重视的事',
                'english': 'word',
                'phrases': []
            }],
            'freq': 4,
            'creatorID': '5506c75d007108bb75cd03c7',
            'creatorName': 'llj',
            'editorID': '5506c75d007108bb75cd03c7',
            'editorName': 'llj',
            'createDate': '03-18-2015 12:30',
            'updateDate': '03-18-2015 12:30'
        },
			{
            'spelling': 'matter',
            'symbol':'\'mætɚ',
            'descriptions': [{
                'creatorID': '5506c75d007108bb75cd03c7',
                'creatorName': 'llj',
                'pos': 'n',
                'chinese': '物质；原因；事件',
                'english': '',
                'phrases': []
            },{
                'creatorID': '5506c75d007108bb75cd03c7',
                'creatorName': 'llj',
                'pos': 'vi',
                'chinese': '有关系；要紧',
                'english': 'word',
                'phrases': []
            }],
            'freq': 4,
            'creatorID': '5506c75d007108bb75cd03c7',
            'creatorName': 'llj',
            'editorID': '5506c75d007108bb75cd03c7',
            'editorName': 'llj',
            'createDate': '03-18-2015 12:30',
            'updateDate': '03-18-2015 12:30'
        }];


        var list = [], i = 0, size = data.length;

        for (; i < size; i++) {
            var item = data[i];
            list.push('<a href="javascript:;" data-vbid="' + item['id'] + '" title="' + item['spelling'] + '" rel="' + item['freq'] + '">' + item['spelling'] + '</a>');
        }

        var dom = '<div id="tag_cloud">' + list.join('') + '</div>';
        self.append(dom);

        $.fn.tagcloud.defaults = {
            size: {start: 14, end: 42, unit: 'px'},
            color: {start: '#ACE6E6', end: '#226666'}
        };
        var recentColor, recentSize;
        $('#tag_cloud').find('a')
            .tagcloud()
            .mouseover(function(){
                var thiz = $(this);
                recentColor = thiz.css('color');
                recentSize = thiz.css('font-size');
                thiz.css({'color': '#ef4036', 'font-size': '42px', 'transition': 'color .2s ease-in, font-size .2s ease-in'});
            })
            .mouseout(function(){
                $(this).css({'color': recentColor, 'font-size': recentSize});
            });
        $('a', self).click(function () {
            var thiz = $(this), id = thiz.attr('data-vbid');
			reqVocabulary.getVb({data: {'vocabularyID': id}}, function(data) {
				_vb.renderWordDetail(self, data['data']);
			});
        });
    },
    renderWordDetail: function (self, data) {

        self.empty();

        var descList = [], desc_size = data['descriptions'].length, desc_i = 0, mList = [];

        for (; desc_i < desc_size; desc_i++) {
            var item = data['descriptions'][desc_i],
                pList = [], pSize = item['phrases'].length, p_i = 0,
                sList = [], sSize = item['sentences'].length, s_i = 0,
                wList = [], wSize = item['words'].length, w_i = 0;

            for (; p_i < pSize; p_i++) {
                var p_item = item['phrases'][p_i];
                pList.push('<li><div><span>' + p_item['english'] + '</span><span>' + p_item['chinese'] + '</span></div></li>');
            }

            for (; s_i < sSize; s_i++) {
                var s_item = item['sentences'][s_i];
                sList.push('<li><div><div class="english">' + s_item['english'] + '</div><div class="chinese">' + s_item['chinese'] + '</div></div></li>');
            }

            for (; w_i < wSize; w_i++) {
                var w_item = item['words'][w_i];
                wList.push('<div class="w-detail-desc-english">' + w_item['english'] + '</div><div class="w-detail-desc-chinese">' + w_item['chinese'] + '</div>')
            }

            mList.push('<li class="' + (desc_i === 0 ? 'menu-default': '') + '"><i>' + item['pos'] + '</i></li>');

            descList.push('<div class="w-detail-desc ' + (desc_i === 0 ? '' : 'dn') + '" data-pos="' + item['pos'] + '"><div class="w-detail-desc-pos"><div class="explanation">' + wList.join('') + '</div></div><div class="cb"></div><div class="w-detail-desc-phrase"><h4>Phrases<span class="icon-plus" style="margin-left: 10px; font-size: 18px; display: none;"></span></h4><div class="phrase"><ul>' + pList.join('') + '</ul></div></div><div class="w-detail-desc-sentence"><h4>Sentences<span class="icon-plus" style=""></span></h4><div class="sentence"><ul>' + sList.join('') + '</ul></div></div></div>');
        }
        var dom = '<div class="w-detail" data-vbid="' + data['_id'] + '"><div class="w-detail-spelling">' + data['spelling'] + '</div><div class="w-detail-symbol">' + data['symbol'] + '<span class="icon-volume-medium"></span></div><div class="w-detail-menu"><ul>' + mList.join('') + '</ul></div><div class="cb"></div>' + descList.join('') + '</div>';

        self.append(dom);
        _vb.selectPos();
        _vb.bindIconHover();
        _vb.bindShowAddIcon(data['descriptions']);
    },
	renderAddWord: function (self) {
		var dom = '<div class="v-add"><div class="v-add-title"><h2>' + l10n.vb.pv + '</h2></div><div class="v-add-spelling"><div class="mb10">' + l10n.vb.spelling + '</div><input type="text" placeholder="Vocabulary Spelling"/></div><div class="v-add-symbol"><div class="mb10">' + l10n.vb.ps + '</div><input type="text" placeholder="Phonetic Symbol"/></div><div class="v-add-desc"><div class="v-add-pos"><div class="mb10">' + l10n.vb.pos + '</div><div class="v-add-pos-list"><ul><li class="selectedPos">' + l10n.vb.n + '</li><li>' + l10n.vb.a + '</li><li>' + l10n.vb.ad + '</li><li>' + l10n.vb.v + '</li><li>' + l10n.vb.pron + '</li><li>' + l10n.vb.conj + '</li><li>' + l10n.vb.prep + '</li><li>' + l10n.vb.art + '</li><li>' + l10n.vb.num + '</li><li>' + l10n.vb.interj + '</li></ul></div></div><div class="cb"></div><div class="v-add-word"><div class="mb10">' + l10n.vb.meaning + '</div><div><input type="text" class="mr10" placeholder="English"/><input type="text" placeholder="Chinese"/></div></div><div class="v-add-phrase"><div class="mb10">' + l10n.vb.phrase + '</div><div><input type="text" class="mr10" placeholder="English"/><input type="text" placeholder="Chinese"/></div></div><div class="v-add-sentence"><div class="mb10">' + l10n.vb.sentence + '</div><div><input type="text" class="v-add-sentence-e" placeholder="English"/><input type="text" class="v-add-sentence-c" placeholder="Chinese"/></div></div></div><div class="v-add-post"><button class="key">' + l10n.article.push + '</button><button id="cancelWord">' + l10n.article.cancel + '</button></div></div>';
		self.append(dom);
		_vb.bindSelectedPos($('li', $('.v-add-pos-list')));
		_vb.submitPushWord(self);
	},
    selectPos: function () {
        $('li', $('.w-detail-menu')).click(function () {
            var thiz = $(this), desc = $('.w-detail-desc'), pos = thiz.text(), i = 0, size = desc.length;
            desc.addClass('dn');
            for (; i < size; i++) {
                if (pos === $(desc[i]).attr('data-pos')) {
                    $(desc[i]).removeClass('dn');
                    thiz.siblings('.menu-default').removeClass('menu-default');
                    thiz.addClass('menu-default');
                    _vb.removeTempAdd();
                }
            }
        });
    },
    bindIconHover: function () {
        $('h4', $('.w-detail-desc')).mouseover(function () {
            $(this).find('span').fadeIn('fast');
        }).mouseleave(function () {
            $(this).find('span').fadeOut('fast');
        });
    },
    bindShowAddIcon: function (data) {

        var i = 0, size = data.length,
            inputPhrase = '<li><div class="vb-temp-add"><span><input id="eVbPhrase" type="text" placeholder="Input Phrase"/></span><span><input id="cVbPhrase" type="text" placeholder="Chinese"/></span><span class="icon-checkmark"></span><span class="icon-close"></span></div></li>',
            inputSentence = '<li><div class="vb-temp-add"><div><input id="eVbSentence" type="text" placeholder="English"/></div><div><input id="cVbSentence" type="text" placeholder="Chinese"/><span class="icon-checkmark"></span><span class="icon-close"></span></div></div></li>';

        for (; i < size; i++) {
            var item = data[i], desc = $('div[data-pos="' + item['pos'] + '"]');

            $('h4', $('.w-detail-desc-phrase', desc)).find('span').click(function () {
                var phraseDiv = $('.phrase', $('.w-detail-desc-phrase', $('div[data-pos="' + ($('.menu-default').text()) + '"]')));
                _vb.removeTempAdd();
                phraseDiv.find('ul').append(inputPhrase);
                // bind the close icon
                $('.icon-close').addClass('cp').attr('title', 'Cancel').click(function () {
                    _vb.removeTempAdd();
                });
                // bind the add icon
                $('.icon-checkmark', phraseDiv).addClass('cp').attr('title', 'Add').click(function () {
                    var phraseObj = {
                        'vocabularyID': $('.w-detail').attr('data-vbid'),
                        'english': $('#eVbPhrase').val(),
                        'chinese': $('#cVbPhrase').val()
                    };
//                    reqVocabulary.addPhrase({data: phraseObj}, function (data) {
//                        _vb.removeTempAdd();
//                         console.log('success!' + data);
//                    });
                    _vb.removeTempAdd();
                    phraseDiv.find('ul').append('<li><div><span>' + phraseObj['english'] + '</span><span>' + phraseObj['chinese'] + '</span></div></li>');
                });
            });
            $('h4', $('.w-detail-desc-sentence', desc)).find('span').click(function () {
                var sentenceDiv = $('.sentence', $('.w-detail-desc-sentence', $('div[data-pos="' + ($('.menu-default').text()) + '"]')))
                _vb.removeTempAdd();
                sentenceDiv.find('ul').append(inputSentence);
                $('.icon-close').addClass('cp').attr('title', 'Cancel').click(function () {
                    _vb.removeTempAdd();
                });
                $('.icon-checkmark', sentenceDiv).addClass('cp').attr('title', 'Add').click(function () {
                    var sentenceObj = {
                        'vocabularyID': $('.w-detail').attr('data-vbid'),
                        'english': $('#eVbSentence').val(),
                        'chinese': $('#cVbSentence').val()
                    };
//                    reqVocabulary.addSentence({data: sentenceObj}, function (data) {
//                        _vb.removeTempAdd();
//                        console.log('success!' + data);
//                    });
                    _vb.removeTempAdd();
                    sentenceDiv.find('ul').append('<li><div><div class="english">' + sentenceObj['english'] + '</div><div class="chinese">' + sentenceObj['chinese'] + '</div></div></li>');
                });
            });
        }
    },
    removeTempAdd: function () {
        $('.vb-temp-add').parent().remove();
    },
	bindSelectedPos: function (o) {
		o.click(function () {
			var thiz = $(this);
			if ($('.selectedPos').length === 1) {
				o.removeClass('selectedPos');
			}
			thiz.toggleClass('selectedPos');
		});
	},
	submitPushWord: function(self) {
		$('.key', self).click(function () {
			var flag = true;
			if (flag) {
				var vAddWord = $('.v-add-word'), vAddPhrase = $('.v-add-phrase'), vAddSentence = $('.v-add-sentence');
				var wordArr = [{
					'chinese': $($('input', vAddWord)[1]).val(),
					'english': $($('input', vAddWord)[0]).val()
				}];
				var phrasesArr = [{
					'chinese': $($('input', vAddPhrase)[1]).val(),
					'english': $($('input', vAddPhrase)[0]).val()
				}];
				var sentencesArr = [{
					'chinese': $($('input', vAddSentence)[1]).val(),
					'english': $($('input', vAddSentence)[0]).val()
				}];
				var vbObj = {
					'spelling': $('input', $('.v-add-spelling')).val(),
					'symbol': $('input', $('.v-add-symbol')).val(),
					'descriptions': [{
						'pos': $('.v-add-pos-list', self).find('.selectedPos').text(),
						'words': wordArr,
						'phrases': phrasesArr,
						'sentences': sentencesArr
					}]
				};

                if (wordArr[0]['chinese'] === '' && wordArr[0]['english'] === '') delete vbObj.descriptions[0]['words'];
                if (phrasesArr[0]['chinese'] === '' && phrasesArr[0]['english'] === '') delete vbObj.descriptions[0]['phrases'];
                if (sentencesArr[0]['chinese'] === '' && sentencesArr[0]['english'] === '') delete vbObj.descriptions[0]['sentences'];

				reqVocabulary.addVb({data: vbObj}, function (data) {
					if (data['code'] === 200) {
						console.log('add word successfully!');
						var self = $('#content');
						self.empty();
						reqVocabulary.getAll({}, function (data) {
							_vb.renderVbCloud(self, data['data']['list']);
						});
					}
                    _layout.messenger(data['code'], data['msg']);
				});
			}
		});
		$('#cancelWord').click(function () {
			_layout.bindToHome();
		});
	}
};

var reqVocabulary = {
    getAll: function (options, callback) {
        $.ajax($.extend({
            type: 'POST',
            url: '/vocabulary/showall',
            dataType: 'JSON'
        }, options, true)).done(function(data){
            if (data && $.isFunction(callback)) {
                callback(data);
            }
        });
    },
	getVb: function (options, callback) {
		$.ajax($.extend({
			type: 'POST',
			url: '/vocabulary/showdetail',
			dataType: 'JSON'
		}, options, true)).done(function(data){
			if (data && $.isFunction(callback)) {
				callback(data);
			}
		});
	},
	addVb: function (options, callback) {
		$.ajax($.extend({
			type: 'POST',
			url: '/vocabulary/add',
			dataType: 'JSON'
		}, options, true)).done(function(data){
			if (data && $.isFunction(callback)) {
				callback(data);
			}
		});
	},
    addPhrase: function (options, callback) {
        $.ajax($.extend({
            type: 'POST',
            url: '/vocabulary/addphrase',
            dataType: 'JSON'
        }, options, true)).done(function(data){
            if (data && $.isFunction(callback)) {
                callback(data);
            }
        });
    },
    addSentence: function (options, callback) {
        $.ajax($.extend({
            type: 'POST',
            url: '/vocabulary/addsentence',
            dataType: 'JSON'
        }, options, true)).done(function(data){
            if (data && $.isFunction(callback)) {
                callback(data);
            }
        });
    }
};