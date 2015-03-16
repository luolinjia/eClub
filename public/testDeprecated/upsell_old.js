;var upsell_widget_plugin = function( $ ) {

    var namespace = '';

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
            namespace = widgetData['namespace'];
            _.renderUpsell($(this), widgetData);
            return this;
        },
        get_dialog_title: function (widgetData){
            return $.i18n.prop('upsell.title');
        }
    };

    var _ = {
        renderUpsell: function (self, widgetData) {
            var list = [], size = widgetData['upsellData'].list.length;
            for (var i = 0; i < size; i++) {
                var item = widgetData['upsellData'].list[i];
                list.push('<hr><li class="clear"><div class="service"><h6>' + item['title'] + '</h6><p>' + item['description'] + '</p><a href="' + item['hyperlink'] + '" class="button slim primary showmemore" target="_blank">' + $.i18n.prop("upsell.showMeMore") + '</a></div><input value="' + item['price'] + '" class="price" readonly><input type="text" value="0" id="upsell_quantity_' + (maui.fn.removeJQueryControlCharacters(item['productNumber'])) + '" class="qty" data-preval="0" data-product="' + item['productNumber'] + '" ' + (!Boolean(item['price']) ? "disabled" : "") + '><input value="' + item['productNumber'] + '" class="number" readonly></li>');
            }

            var dom = '<div id="upsell_widget"><div class="header clear"><h3 class="left">' + $.i18n.prop('upsell.services') + '</h3><input type="button" id="upsell_add_to_config" value="' + $.i18n.prop('upsell.addToConfig') + '" class="button slim primary right"><input type="button" id="upsell_no_thanks" value="' + $.i18n.prop('upsell.noThanks') + '" class="button slim primary right"></div><hr><ul class="header clear"><li class="service">' + $.i18n.prop('upsell.serviceType') + '</li><li class="price">' + $.i18n.prop('widget.bom.listPrice') + '</li><li class="qty">' + $.i18n.prop('widget.bom.quantity') + '</li><li class="number">' + $.i18n.prop('widget.choice_point.PartNumber') + '</li></ul><ul class="detail">' + list.join('') + '</ul></div>';

            displayHTMLInModalDialog($.i18n.prop('upsell.buttonLabel'), dom, 900, 600, null);
            _.bindButtons();
        },
        bindButtons: function() {
            var detailObj = $('.detail', $('#upsell_widget')), qtyArr = detailObj.find('input.qty'), dialog = $('.dialog_div').dialog(), saved = false;
            $('#upsell_add_to_config').on('click', function() {
                _.pushListToConfig(qtyArr);
                saved = true;
                dialog.dialog('close');
            });
            $('#upsell_no_thanks').on('click', function() {
                saved = true;
                dialog.dialog('close');
            });
            dialog.on('dialogbeforeclose', function(e, ui){
                !saved && _.validateQuantity($(qtyArr)) && _.upsellBeforeClose(e, ui); // && -> single IF determine
            });
            $(qtyArr).change(function() {
                _.validateFormat($(this));
            });
        },
        pushListToConfig: function(o) {
            var list = [], addSize = o.length;
            for(var i = 0; i < addSize; i++) {
                list.push({productNumber: $(o[i]).attr('data-product'), qty: $(o[i]).val()});
            }
            req.addToConfig({list: list});
        },
        validateFormat: function(o) {
            var numRegExp = /^(0|[1-9][0-9]{0,2})$/, selfVal = $.trim(o.val()); // 0~999
            if (!numRegExp.test(selfVal)) {
                showAlertDialog($.i18n.prop('configWorksheet.textMessage'));
                o.val(o.attr('data-preVal'));
            } else {
                o.attr('data-preVal', o.val());
            }
        },
        validateQuantity: function(o) {
            var flag = false;
            o.each(function(){
                if ($(this).val() > 0) {
                    flag = true;
                    return;
                }
            });
            return flag;
        },
        upsellBeforeClose: function(e, ui) {
            e.preventDefault();
            $('<div/>').append($('<p/>', {text: $.i18n.prop('upsell.quitWithoutSaving')}))
                .dialog({ title: $.i18n.prop('Confirm'), modal: true, buttons: [{
                            text: $.i18n.prop('Yes'),
                            click: function() {
                                $(this).dialog('destroy');
                                $('.dialog_div').dialog().dialog('destroy');
                        }}, {
                            text: $.i18n.prop('No'),
                            click: function() {
                                $(this).dialog('destroy');
                        }}, {
                            text: $.i18n.prop('upsell.addToConfig'),
                            click: function() {
                                $(this).dialog('destroy');
                                var detailObj = $('.detail', $('#upsell_widget')), qtyArr = detailObj.find('input.qty');
                                _.pushListToConfig(qtyArr);
                                $('.dialog_div').dialog().dialog('destroy');
                        }}]
                });
        }
    };

    var req = {
        addToConfig: function (options) {
            serverTransaction($.extend({
                method: 'add_upsell_to_config',
                widget_id: namespace
            }, options));
        }
    };
};
upsell_widget_plugin.prototype = {};
upsell_widget_plugin(jQuery);