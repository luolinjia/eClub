;var upsell_widget_plugin = function( $ ) {

    $.fn.upsell_widget = function( method ) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        }
        throw new Error('Method ' + method + ' does not exist on jQuery.upsell_widget');
    };

    var methods = {
        init: function (widgetData, nav) {
            _.renderUpsell($(this), widgetData);
            return this;
        },
        get_dialog_title: function (widgetData){
            return $.i18n.prop("upsell.title");
        }
    };

    var _ = {
        renderUpsell: function (self, widgetData) {
            var list = [], size = widgetData['upsellData'].list.length;
            for (var i = 0; i < size; i++) {
                var item = widgetData['upsellData'].list[i];
                list.push('<li class="clear"><div class="service"><h6>' + item.title + '</h6><p>' + item.description + '<a href="' + item['hyperlink'] + '" target="_blank">...more</a></p></div><input id="upsell_quantity_' + item.productNumber + '" type="text" value="0" class="qty"><input value="' + item.price + '" class="price" readonly><input value="' + item.productNumber + '" class="number" readonly></li><hr>');
            }

            var dom = '<div id="upsell_widget"><ul class="header clear"><li class="service">' + $.i18n.prop("upsell.serviceType") + '</li><li class="qty">' + $.i18n.prop("widget.bom.quantity") + '</li><li class="price">' + $.i18n.prop("widget.bom.listPrice") + '</li><li class="number">' + $.i18n.prop("widget.choice_point.PartNumber") + '</li></ul><hr><div class="upsell-items"><ul class="detail">' + list.join('') + '</ul></div></div>';

            var buttons = [
                {id: 'upsell_no_thanks', text: $.i18n.prop("upsell.noThanks"), click: function () {
                    $(this).dialog('close');
                }},
                {id: 'upsell_add_to_config', text: $.i18n.prop("upsell.addToConfig"), click: function () {
//                    _.addToConfig(self, pageData.namespace);
                    $(this).dialog('close');
                }}
            ];

            displayHTMLInModalDialog("May we recommend", dom, 850, 'auto', buttons);
        }
    };
};
upsell_widget_plugin.prototype = {};
upsell_widget_plugin(jQuery);