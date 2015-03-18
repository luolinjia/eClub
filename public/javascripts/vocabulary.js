/**
 * Created by luolinj on 3/18/2015.
 */
$(function () {

});

var _vb = {
    renderVbCloud: function (self, data) {

        var tempData = [{
            'spelling': 'vocabulary',
            'symbol':'və\'kæbjəlɛri',
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