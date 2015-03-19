/**
 * Created by luolinj on 3/18/2015.
 */
$(function () {

});

var _vb = {
    renderVbCloud: function (self, data) {

        var tempData = [{
            'spelling': 'vocabulary',
            'symbol':'[və\'kæbjəlɛri]',
            'descriptions': [{
                'creatorID': '5506c75d007108bb75cd03c7',
                'creatorName': 'llj',
                'pos': 'n',
                'chinese': '词汇，词汇量',
                'english': 'word',
                'phrases': [{
                    'createDate': '03-18-2015 12:30',
                    'english': 'xx',
                    'chinese': '叉叉',
                    'interpret': 'xxxxx'
                }, {
                    'createDate': '03-18-2015 12:30',
                    'english': 'take off',
                    'chinese': '起飞',
                    'interpret': 'xxxxx'
                }],
                'sentences': [{
                    'createDate': '03-18-2015 12:30',
                    'english': 'waoo, that\'s good',
                    'chinese': '那很好啊！'
                }, {
                    'createDate': '03-18-2015 12:30',
                    'english': 'good luck',
                    'chinese': '好运！'
                }]
            }],
            'freq': 17,
            'creatorID': '5506c75d007108bb75cd03c7',
            'creatorName': 'llj',
            'editorID': '5506c75d007108bb75cd03c7',
            'editorName': 'llj',
            'createDate': '03-18-2015 12:30',
            'updateDate': '03-18-2015 12:30'
        },{
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
        }, {
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
        }, {
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

        var list = [], i = 0, size = tempData.length;

        for (; i < size; i++) {
            var item = tempData[i];
            list.push('<a href="javascript:;" title="' + item['spelling'] + '" rel="' + item['freq'] + '">' + item['spelling'] + '</a>');
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
            var thiz = $(this), id = thiz.text();
            _vb.renderWordDetail(self, tempData[0]);
        });
    },
    renderWordDetail: function (self, data) {

        self.empty();

        var descList = [], desc_size = data['descriptions'].length, desc_i = 0;

        for (; desc_i < desc_size; desc_i++) {
            var item = data['descriptions'][desc_i],
                pList = [], pSize = item['phrases'].length, p_i = 0,
                sList = [], sSize = item['sentences'].length, s_i = 0;

            for (; p_i < pSize; p_i++) {
                var p_item = item['phrases'][p_i];
                pList.push('<li><div><span>' + p_item['english'] + '</span><span>' + p_item['chinese'] + '</span></div></li>');
            }

            for (; s_i < sSize; s_i++) {
                var s_item = item['sentences'][s_i];
                sList.push('<li><div><div class="english">' + s_item['english'] + '</div><div class="chinese">' + s_item['chinese'] + '</div></div></li>');
            }
            descList.push('<div class="w-detail-desc"><div class="w-detail-desc-pos"><div class="pos"><i>' + item['pos'] + '</i></div><div class="explanation"><div class="w-detail-desc-english">' + item['english'] + '</div><div class="w-detail-desc-chinese">' + item['chinese'] + '</div></div></div><div style="clear:both;"></div><div class="w-detail-desc-phrase"><h4>Phrases<span class="icon-plus" style="margin-left: 10px; font-size: 18px; display: none;"></span></h4><div class="phrase"><ul>' + pList.join('') + '</ul></div></div><div class="w-detail-desc-sentence"><h4>Sentences<span class="icon-plus" style=""></span></h4><div class="sentence"><ul>' + sList.join('') + '</ul></div></div></div>');
        }
        var dom = '<div class="w-detail"><div class="w-detail-spelling">' + data['spelling'] + '</div><div class="w-detail-symbol">' + data['symbol'] + '<span class="icon-volume-medium"></span></div>' + descList.join('') + '</div>';

        self.append(dom);
        _vb.bindAddToWord();
    },
    bindAddToWord: function () {
        $('h4', $('.w-detail-desc')).mouseover(function () {
            $(this).find('span').fadeIn('fast');
        }).mouseleave(function () {
            $(this).find('span').fadeOut('fast');
        });
        $('h4', $('.w-detail-desc-phrase')).find('span').click(function () {
            var inputForm = '<li><div class="vb-temp-add"><span><input type="text" placeholder="Input Phrase"/></span><span><input type="text" placeholder="Chinese"/></span><span class="icon-checkmark"></span><span class="icon-close"></span></div></li>';
            $('.phrase', $('.w-detail-desc-phrase')).find('ul').append(inputForm);
        });
        $('h4', $('.w-detail-desc-sentence')).find('span').click(function () {
            var inputForm = '<li><div class="vb-temp-add"><div><input type="text" placeholder="English"/></div><div><input type="text" placeholder="Chinese"/><span class="icon-checkmark"></span><span class="icon-close"></span></div></div></li>';
            $('.sentence', $('.w-detail-desc-sentence')).find('ul').append(inputForm);
        });
    }
};

var reqVocabulary = {
    getAll: function (options, callback) {
        $.ajax($.extend({
            type: 'POST',
            url: '/vocabulary/all',
            dataType: 'JSON'
        }, options, true)).done(function(data){
            if (data && $.isFunction(callback)) {
                callback(data);
            }
        });
    }
};