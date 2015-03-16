
;var sce_bom_page_plugin = function( $ ) {
    var dataTag = 'bomPageData';
    var imagesFolder = toolsFolder + "/sce/pages/sce_bom_page/images/";
    var isBMIInternalUser;
    var paramUserType;
    var isExternalCustomer;
    var hasAccessory;
    var wimsPersistData;
    var hideCols = {};
    var readOnlyConfig;
    var includeBomEditPenQty;

    function loadTest(testDiv){
        try {
            maui.widget.createChildWidget(testDiv, null,
                'com.hp.ngc.uiframework.tool.sce.widgets.TestWidget', 'test_widget',
                {suppressMessage:false, overlayCSS:{opacity: 0.05}});
            return true;
        } catch (e) {
            console.log(e);
            displayHTMLInModalDialog($.i18n.prop('Alert'), 'name=' + e.name
                + " message=" + e.message, 300, 200);
            return false;
        }
    }

    function showEmailDialog(emailData){
        if(isExternalCustomer && $("#toolbar_buy").attr('disabled')==='disabled')
            return;
        var div = $("<div/>").attr('id','divEmailDialog');
        var table = div.append($("<table/>").attr('id','emailTable'));

        if(isExternalCustomer){
            table.append($("<tr/>")
                .append($("<td/>").append($.i18n.prop('to')))
                .append($("<td/>").append($('<input/>',{id:'toAddr',value:emailData.userEmailId,type:"text","title":$.i18n.prop("emailSeparate"),disabled:"disabled"}))))
                .append($("<tr/>")
                    .append($("<td/>").append($.i18n.prop('from')))
                    .append($("<td/>").append($('<input/>',{id:'fromAddr',value:emailData.sourceApplicationUserId,type:"text","title":$.i18n.prop("emailSeparate")}))))
                .append($("<tr/>")
                    .append($("<td/>").append($.i18n.prop('subject')))
                    .append($("<td/>").append($('<input/>',
                        {id:'emailSubject',value:$.i18n.prop('emailSubjectTextForExternalCustomer',emailData.ucid),type:"text"}))))
                .append($("<tr/>")
                    .append($("<td colspan='2'/>").append($('<textarea/>',
                        {id:'emailContentForExternalCustomer',html:$.i18n.prop('emailContentTextForExternalCustomer')}))));
        }else{
            table.append($("<tr/>")
                .append($("<td/>").append($.i18n.prop('to')))
                .append($("<td/>").append($('<input/>',{id:'toAddr',value:$.cookie('userFavEmailIds')==undefined?'':$.cookie('userFavEmailIds'),type:"text","title":$.i18n.prop("emailSeparate")}))))
                .append($("<tr/>")
                    .append($("<td/>").append($.i18n.prop('cc')))
                    .append($("<td/>").append($('<input/>',{id:'ccAddr',value:emailData.userEmailId,type:"text","title":$.i18n.prop("emailSeparate")}))))
                .append($("<tr/>")
                    .append($("<td/>").append($.i18n.prop('subject')))
                    .append($("<td/>").append($('<input/>',
                        {id:'emailSubject',value:$.i18n.prop('emailSubjectTextForExternal',emailData.ucid),type:"text"}))))
                .append($("<tr/>")
                    .append($("<td colspan='2'/>").append($('<textarea/>',
                        {id:'emailContent'}))));
        }

        var sendButton = [{id:'sendEmailButton',text:$.i18n.prop('Submit'),click:function () {

            var dialog = $(this);
            var toAddr = $.trim(div.find('input[id="toAddr"]').val());
            var fromAddr = $.trim(div.find('input[id="fromAddr"]').val());
            var ccAddr = $.trim(div.find('input[id="ccAddr"]').val());
            var subject = $.trim(div.find('input[id="emailSubject"]').val());
            var content ='';
            if(isExternalCustomer){
                content=$.trim(div.find('textarea[id="emailContentForExternalCustomer"]').val());
            }else
            {
                content=$.trim(div.find('textarea[id="emailContent"]').val());
            }

            getServerData({method: "send_email",
                    toAddr:toAddr,
                    fromAddr:fromAddr,
                    ccAddr:ccAddr,
                    subject:subject,
                    content:content},
                function (sendResult){

                    if(sendResult.Success){
                        dialog.empty();
                        dialog.dialog("close");
                        if(!isExternalCustomer){
                            $.cookie('userFavEmailIds',toAddr,{expires:15});
                        }

                        displayHTMLInModalDialog($.i18n.prop("Information"),sendResult.StatusMessage,340,"auto");
                    }else{

                        showAlertDialog(sendResult.StatusMessage);
                    }
                });
        }}];

        if(isExternalCustomer){
            displayHTMLInModalDialog($.i18n.prop("emailTitleForExternalCustomer"), div, 550, 580, sendButton);
        }else{
            displayHTMLInModalDialog($.i18n.prop("sendEmailToSQUser"), div, 550, 420, sendButton);
        }
    }

    function showSCEBOMPageSub(pageData, nav, dataDiv) {
        "use strict";
        paramUserType = pageData.user.user_type;

        readOnlyConfig = pageData.readOnlyConfig;
        includeBomEditPenQty = pageData.properties.includeBomEditPenQty;

        var selfData = dataDiv.data(dataTag);
        selfData.userId = pageData.user.user_id;

        if (pageData.user.user_type == "BMIInternalUser") {
            isBMIInternalUser = true;
        } else {
            isBMIInternalUser = false;
        }

        if(isBMIInternalUser && (window.BMIUpdateMode == undefined || window.BMIUpdateMode==null))
            window.BMIUpdateMode = pageData.initialPage.indexOf('SCEBomPage') >= 0;

        if (pageData.user.user_type == "PRMExternalUser" && pageData.sourceApplication == "EXTERNAL_CUSTOMER"){
            isExternalCustomer = true;
        }else{
            isExternalCustomer = false;
        }
        if(pageData.user.user_type =="PublicUser" || isExternalCustomer || !pageData.properties.hasAccessory){
            hasAccessory = false;
        }else{
            hasAccessory = true;
        }
        getHiddenColParams(pageData);
        var pageDiv = $('<div/>').attr('id', 'sce_bom_page').addClass('sce_page').appendTo(dataDiv);

        pageData.isNullBOM = checkNullBOM();
        if($("#theData").data("isMobile")){
            pageData.hideUserSeting = true;
            pageData.hideSupportLink = true;
        }
        if (!isBMIInternalUser) {
            pageDiv.sceHeaderWidget(pageData.user, pageData, pageData.configid);
        }

        var popupSaveDialog = pageData.popupSaveDialog;
        if(isBMIInternalUser && !pageData.properties.showEZCSaveBox) {
            popupSaveDialog = false;
        }


        var validations = function (){
            if(pageData.configurationName !== undefined && pageData.configurationName.length>100)
            {
                showAlertDialog($.i18n.prop("configurationFileNameLength"));
                return true;
            }
            if(pageData.companyName !== undefined && pageData.companyName.length>30)
            {
                showAlertDialog($.i18n.prop("customerCompanyNameLength"));
                return true;
            }
            for(var i=0;i<pageData.subConfigs.length;i++)
            {if(pageData.subConfigs[i].name.length>100)
            {
                showAlertDialog($.i18n.prop("ConfigNameTooLong"));
                return true;
            }
            }

        };


        pageDiv.sceToolbarWidget({
            hasNewConfig: !pageData.isBMIAccessoriesPunchOut,
            newConfigCallBackMethod:pageData.properties.newConfigCallBackMethod,
            hasOpenConfig: (isBMIInternalUser? false: true) && pageData.properties.hasOpenConfiguration,
            hasConfigSetting: (isBMIInternalUser||isExternalCustomer)? false: pageData.properties.withSCEContent,
            hasSaveConfig: (pageData.saveAlertMessage === undefined || pageData.saveAlertMessage !== "addToTransactionSuccess") && pageData.hasSaveConfig,
            updateBanding:false,
            //hasUpdate: pageData.properties.showUpdateButton,
            hasUpdate: false, //disable the update link on this page
            hasCopy: pageData.properties.showCopyButton,
            isBMIUser:isBMIInternalUser,
            hasSaveAs: ((isBMIInternalUser||isExternalCustomer)?false:true) &&pageData.properties.withSCEContent,
            saveDisable: pageData.saveDisable,
            popupSaveDialog: popupSaveDialog,
            isComplete:pageData.isComplete,
            isCopyOperation:pageData.isCopyOperation,
            hasSearchConfig: false,
            hasViewAs1Doc: pageData.properties.hasViewAs1Doc? isBMIInternalUser?false:true : false,
            hasExport: !isBMIInternalUser && pageData.hasSaveConfig, //hasSaveConfig means it is not read only
            hasExportToEclipse: true,
            hasExportToECC: true,
            hasSupportOnToolBar: isBMIInternalUser?true:false,
            isNullBOM:pageData.isNullBOM,
            isNullConfig:pageData.isNullConfig,
            user:pageData.user,
            isBMIAccessoriesPunchOut:pageData.isBMIAccessoriesPunchOut,
            isSearchPage:false,
            showEZCExports: pageData.showEZCExports,
            showEZCSearch: pageData.properties.showEZCSearch,
            showEZCSaveBox:pageData.properties.showEZCSaveBox,
            pageData:pageData,
            Validations:validations
        }, pageData.configid,pageData.configid);

        var layoutTable = "";
        var toolbarRow = "";
        var toolbarTD = "";
        if (!($("#theData").data("isMobile"))) {
            layoutTable = $('<table/>').attr('id', 'layout_table').appendTo(pageDiv);
            toolbarRow = $('<tr/>').attr('id', 'row_toolbar').appendTo(layoutTable);
            toolbarTD = $('<td/>', {colspan:2}).appendTo(toolbarRow);

            toolbarTD.append($('#sce_header')).append($('#sce_toolbar'));
        }

        var emailBarDiv = $("#email_toolbar");

        if(pageData.properties.enableExports)
        {
            if(pageData.exportsList!==undefined){

                if(pageData.exportsList.enableExportToEclipseWLoc){
                    $('#sce_toolbar_ezc_export_localisation').show();
                }else{
                    $('#sce_toolbar_ezc_export_localisation').hide();
                }
                if(pageData.exportsList.enableExportToEclipseWOLoc){
                    $('#sce_toolbar_ezc_export_eclipse').show();
                }else{
                    $('#sce_toolbar_ezc_export_eclipse').hide();
                }
                if(pageData.exportsList.isECCExportAllowed){
                    $('#sce_toolbar_ezc_export_eCC').show();
                }else{
                    $('#sce_toolbar_ezc_export_eCC').hide();
                }
                if(pageData.exportsList.enableExportCost){
                    $('#sce_toolbar_ezc_export_cost').show();
                }else{
                    $('#sce_toolbar_ezc_export_cost').hide();
                }
                if(pageData.exportsList.enableExportPrice){
                    $('#sce_toolbar_ezc_export_price').show();
                }else{
                    $('#sce_toolbar_ezc_export_price').hide();
                }

                if(pageData.exportsList.enableExportOneStop){
                    $('#sce_toolbar_ezc_export_onestop').show();
                }else{
                    $('#sce_toolbar_ezc_export_onestop').hide();
                }
                if(pageData.exportsList.enableExportAres){
                    $('#sce_toolbar_ezc_export_ares').show();
                }else{
                    $('#sce_toolbar_ezc_export_ares').hide();
                }
                if(pageData.exportsList.isCreateUIDAllowed){
                    $('#sce_toolbar_ezc_export_createuid').show();
                }else{
                    $('#sce_toolbar_ezc_export_createuid').hide();
                }
            }else{
                $('#sce_toolbar_ezc_export_localisation').hide();
                $('#sce_toolbar_ezc_export_eclipse').hide();
                $('#sce_toolbar_ezc_export_eCC').hide();
                $('#sce_toolbar_ezc_export_cost').hide();
                $('#sce_toolbar_ezc_export_onestop').hide();
                $('#sce_toolbar_ezc_export_price').hide();
                $('#sce_toolbar_ezc_export_ares').hide();
                $('#sce_toolbar_ezc_export_createuid').hide();
            }
        }

        // add buttons for SmartQuote to the emailBarDiv
        if (pageData.user.user_type == "PRMExternalUser") {
            if(isExternalCustomer){
                var li = $('<li/>').attr('id','toolbar_buy').addClass('toolbar-buy').appendTo(emailBarDiv);
                var span = $('<span/>').attr('id','toolbar_buy_icon').addClass('tool-bar-icons toolbar-shopping-icon').appendTo(li);
                var buyText = $('<a/>', {id:'buy_link'}).text($.i18n.prop('buyButtonText')).attr('href', '#').css('cssText','color:#D7410B!important;cursor:default;font-weight:bold').appendTo(li);
                li.mouseenter(function(){
                    span.addClass('toolbar-shopping-a-hover').removeClass('toolbar-shopping-icon');
                    buyText.css('cssText','color:#C1401A!important;cursor:default;font-weight:bold');
                }).mouseleave(function(){
                    span.addClass('toolbar-shopping-icon').removeClass('toolbar-shopping-a-hover');
                    buyText.css('cssText','color:#D7410B!important;cursor:default;font-weight:bold');
                }).click(function(){
                    showEmailDialog(
                        {
                            userEmailId:pageData.userEmailId,
                            sourceApplicationUserId:pageData.sourceApplicationUserId,
                            ucid:pageData.ucid
                        }
                    );
                });

                if (!unsaveDirtyFlag()) {
                    li.removeAttr("disabled").removeAttr('title');
                } else {
                    li.attr("disabled","disabled").attr('title',$.i18n.prop('buyButtonToolDisableTip'));
                    li.click(function(){}).appendTo(li);
                }
            }
            else {

                var li = $('<li/>').addClass('toolbar-email')
                    .mouseenter(function(){
                        if($("li.toolbar-email[disabled='disabled']").length>0){
                            return;
                        }
                        $("span#toolbar_email_icon").removeClass("toolbar-email-icon").addClass("toolbar-email-icon-hover");
                    })
                    .mouseleave(function(){
                        if($("li.toolbar-email[disabled='disabled']").length>0){
                            return;
                        }
                        $("span#toolbar_email_icon").removeClass("toolbar-email-icon-hover").addClass("toolbar-email-icon");
                    })
                    .appendTo(emailBarDiv);

                var span = $('<span/>').attr('id','toolbar_email_icon').addClass('tool-bar-icons toolbar-email-icon').appendTo(li);
                var emailConfigFileId = $('<a/>', {id:'emailConfigFileId_link'}).text($.i18n.prop('sendEmailToSQUser')).appendTo(li);
                if (!unsaveDirtyFlag() && pageData.isQualifiedForSQ) {
                    li.removeAttr("disabled").click(function(){
                        showEmailDialog(
                            {
                                userEmailId:pageData.userEmailId,
                                ucid:pageData.ucid
                            }
                        );
                    }).appendTo(li);
                } else {
                    li.attr("disabled", "disabled");
                }
            }
        }

        var secondRow = "";
        var leftTD = "";
        var rightTD = "";
        var leftColumnDiv = $('<div/>').attr('id', 'center_div');
        var rightColumnDiv = $('<div/>').attr('id', 'sce_bom_right_div');

        if (!($("#theData").data("isMobile"))) {
            secondRow = $('<tr/>').attr('id', 'row_2').appendTo(layoutTable);
            leftTD = $('<td/>').attr('id', 'td_2_1').appendTo(secondRow);
            rightTD = $('<td/>').attr('id', 'td_2_2');
            if(!pageData.isBMIAccessoriesPunchOut){
                rightTD.appendTo(secondRow);
            }
            leftColumnDiv.addClass('column').appendTo(leftTD);
            rightColumnDiv.addClass('column').appendTo(rightTD);
        }else{
            leftColumnDiv.appendTo(pageDiv);
            rightColumnDiv.appendTo(pageDiv);
        }

        /////////////////////////////////////////////////////////////////////////////////////////////
        var bomConfigurationDiv = $("<div/>", {id: "bom_configuration_div"});
        var bom_header = $("<div/>", {id: "bom_header"}).addClass("clearfix");
        if(pageData.isBMIAccessoriesPunchOut){
            if(!$("#theData").data("unsave_dirty_flag") && pageData.saveAlertMessage !== undefined && pageData.saveAlertMessage.length > 0){
                var saveAlertMessageLi = $('<li/>',{'id':'bmi_accessory_punchout_save_alert'}).addClass("bmi_accessory_punchout_save_alert");
                if(pageData.saveAlertMessage === "addToTransactionSuccess"){
                    saveAlertMessageLi.removeClass("failure").addClass("success").html($.i18n.prop(pageData.saveAlertMessage));
                }else if(pageData.saveAlertMessage.indexOf('exceedMaxLineItems') ===0){
                    var bmiMax = pageData.saveAlertMessage.substring(pageData.saveAlertMessage.indexOf(',')+1);
                    saveAlertMessageLi.removeClass("success").addClass("failure").html($.i18n.prop("exceedMaxLineItems",bmiMax));
                }else if(pageData.saveAlertMessage === 'addToTransactionFailedTx' || pageData.saveAlertMessage === 'addToTransactionFailedEmptyAccessory'){
                    saveAlertMessageLi.removeClass("success").addClass("failure").html($.i18n.prop(pageData.saveAlertMessage));
                }else if(pageData.saveAlertMessage === "fileImportTypeError"){
                    saveAlertMessageLi.removeClass("success").addClass("failure").html($.i18n.prop("fileImportTypeError"));
                }else{
                    saveAlertMessageLi.removeClass("success").addClass("failure").html($.i18n.prop('addToTransactionFailed', pageData.saveAlertMessage));
                }
                var alertMessageDiv = $("<div/>", {id: "save_alert_message"}).addClass("clearfix").append(
                    $('<div/>',{'class':'bmi_accessory_punchout_save_alert'}).append(
                        $('<ul/>').append(saveAlertMessageLi)
                    )
                );
                var parentTbody = $('#row_toolbar').parent();
                $('<tr/>').append($('<td/>', {'colspan':'2'}).append(alertMessageDiv)).prependTo(parentTbody);
            }
        }else {
            bomConfigurationDiv.appendTo(leftColumnDiv);
            bom_header.appendTo(leftColumnDiv);
            if(!$("#theData").data("unsave_dirty_flag") && pageData.saveAlertMessage !== undefined && pageData.saveAlertMessage.length > 0){
                var saveAlertMessageLi = $('<li/>',{'id':'save_alert_li'}).addClass("bmi_accessory_punchout_save_alert failure");
                if(pageData.saveAlertMessage === 'saveConfigurationSuccess' || pageData.saveAlertMessage === 'saveBMISuccess' || pageData.saveAlertMessage === 'saveBMISuccessWithError'){
                    saveAlertMessageLi.removeClass("failure").addClass("success").html($.i18n.prop(pageData.saveAlertMessage,pageData.configurationName));
                }else if(pageData.saveAlertMessage.indexOf('exceedMaxLineItems') ===0){
                    var bmiMax = pageData.saveAlertMessage.substring(pageData.saveAlertMessage.indexOf(',')+1);
                    saveAlertMessageLi.removeClass("success").addClass("failure").html($.i18n.prop("exceedMaxLineItems",bmiMax));
                }else if(pageData.saveAlertMessage === "EmptyConfig"){
                    saveAlertMessageLi.removeClass("success").addClass("failure").html($.i18n.prop("EmptyConfig"));
                }else if(pageData.saveAlertMessage === "qtyMoreThanOne"){
                    saveAlertMessageLi.removeClass("success").addClass("failure").html($.i18n.prop("saveNumberError"));
                }else if(pageData.saveAlertMessage === "fileImportTypeError"){
                    saveAlertMessageLi.removeClass("success").addClass("failure").html($.i18n.prop("fileImportTypeError"));
                }else if(pageData.saveAlertMessage === "losePartCheckMessage"){
                    saveAlertMessageLi.removeClass("success").addClass("failure").html($.i18n.prop("losePartCheckMessage"));
                }else {
                    saveAlertMessageLi.removeClass("success").addClass("failure").html($.i18n.prop(pageData.saveAlertMessage,pageData.configurationName));
                }
                var alertMessageDiv = $("<div/>", {id: "save_alert_message"}).addClass("clearfix").append(
                    $('<div/>',{'class':'bmi_accessory_punchout_save_alert', 'id':'save_alert_message_subDiv'}).append(
                        $('<ul/>').append(saveAlertMessageLi)
                    )
                );
                var parentTbody = $('#row_toolbar').parent();
                if(pageData.sourceApplication=='BMI'){
                    $('<tr/>').append($('<td/>', {'colspan':'2'}).append(alertMessageDiv)).prependTo(parentTbody);
                    $('#save_alert_message_subDiv').addClass('padding_0');
                }
                else{
                    alertMessageDiv.prependTo(leftColumnDiv);
                    $('#save_alert_message_subDiv').addClass('padding_0_10');
                    $('#save_alert_message').addClass('margin_top_-10');
                    $('#bom_configuration_div').css({'margin-top':'0', 'padding-top':'0'});
                }
            }
        }
        var bom_header_left =$("<div/>", {id: "bom_header_left"}).appendTo(bom_header);
        var bom_header_right =$("<div/>", {id: "bom_header_right"}).appendTo(bom_header);

        var product_message_btns = $("<ul/>").data("fitCls", "").addClass("product-message-btns");
        var upsell_btn;
        if (pageData.properties.hasUpSell && !isExternalCustomer) {
            upsell_btn = $("<input/>", {id: "upsell_btn", value: $.i18n.prop("upsell.buttonLabel"), type: "button"}).addClass("button slim");
        } else {
            upsell_btn = $("<span/>");
        }


        if(!pageData.isBMIAccessoriesPunchOut){
            // set mobile header info collapse
            if ($("#theData").data("isMobile")) {
                //			bom_header.appendTo(leftColumnDiv);
                //			var bom_header_container = $("<div/>", {id: "bom_header_container"}).appendTo(bom_header_boss);
                bom_header_left.addClass("mobile");
                var bom_header_info = $("<div/>", {id: "bom_header_info"})
                    .append($('<div/>').addClass('mf5 header_info icon-for-accordion-pseudo-collapsed')
                        .data('expanded', false)
                        .html($.i18n.prop('widget.bom.headerInfo'))
                        .click(function(){
                            bomConfigurationDiv.toggle("blind", {}, 500);
                            if ($(this).data('expanded')){
                                $(this).removeClass('icon-for-accordion-pseudo-expanded');
                            } else{
                                $(this).addClass('icon-for-accordion-pseudo-expanded');
                            }
                            $(this).data('expanded', !$(this).data('expanded'));
                        })
                ).appendTo(bom_header_left);
                bomConfigurationDiv.appendTo(bom_header_left);
            }

            if (pageData.configurationName==='Untitled') {
                pageData.configurationName = $.i18n.prop('DefaultConfigurationName');
            }
//			$('<div/>', {'id': 'testWidget', 'class': 'button', 'html': 'Test'})
//				.css({
//					'width': '100px', 
//					'height': '50px', 
//					'background-color': 'green',
//					'color': '#fff',
//					'font-size': '30px',
//					'line-height': '50px',
//					'margin-left': '50px',
//					'padding-left': '50px',
//					'cursor': 'pointer'
//				})
//				.prependTo(bom_configuration_div);
//			$('#testWidget').click(function () {
//				loadTest(dataDiv);
//			});

            if (true===$("#theData").data("isMobile")){
                $("<div/>", {id: 'config_title'}).addClass("cfn").appendTo(bomConfigurationDiv)
                    .append(
                    $('<input id="configurationFileName2" type="text" maxlength="100"/>').addClass('edit_input')
                        .css({width: '130px', 'margin-right': '0', 'padding-right': '0'})
                        .val(pageData.configurationName)
                        .data('preVal', pageData.configurationName)
                        .focusout(function() {
                            if($.trim(this.value).length > 100){
                                showAlertDialog($.i18n.prop('ConfigNameTooLong'));
                                $("#configurationFileName2").val($("#configurationFileName1").html());
                                $("#configurationFileName1").show();
                                $("#configurationFileName2").hide();
                            }else{
                                renameConfigurationFileOrCustmerCompanyName(this,'configurationName');
                            }
                        })
                );
            }else{
                if(!readOnlyConfig) {
                    $("<div/>", {id: 'config_title'}).addClass("cfn").appendTo(bomConfigurationDiv)
                        .append($("<div/>", {id: "bom_edit_pen_configurationFileName"}).addClass('edit_pen')
                            .click(function() {
                                $("#configurationFileName1").hide();
                                $("#configurationFileName2").show().focus();
                            }))
                        .append($("<span/>", {id: "configurationFileName1"})
                            .text(pageData.configurationName)
                            .dblclick(function() {
                                $(this).hide();
                                $("#configurationFileName2").show().focus();
                            }))
                        .append($("<input/>", {id: "configurationFileName2", type: "text", maxlength:"100"})
                            .data("preVal", pageData.configurationName)
                            .val(pageData.configurationName)
                            .focusout(function() {
                                if($.trim(this.value).length > 100){
                                    showAlertDialog($.i18n.prop('ConfigNameTooLong'));
                                    //$("#configurationFileName1").val( (preConfigVal==null || preConfigVal=="") ? pageData.configurationName : preConfigVal);
                                    $("#configurationFileName2").val($("#configurationFileName1").html());
                                    $("#configurationFileName1").show();
                                    $("#configurationFileName2").hide();
                                }else{
                                    renameConfigurationFileOrCustmerCompanyName(this,'configurationName');
                                }
                            })
                            .keydown(function(event) {
                                if ( event.which == 13) {
                                    //renameConfigurationFileOrCustmerCompanyName(this,'configurationName');
                                    $(event.currentTarget).blur();
                                }
                            })
                            .hide());
                }
            }
        }
        if (!isBMIInternalUser && pageData.properties.withSCEContent) {
            if(!readOnlyConfig) {
                $("<div/>").addClass("company").appendTo(bomConfigurationDiv)
                    .append($("<div/>", {id: "bom_edit_pen_companyName"}).addClass("edit_pen")
                        .click(function() {
                            $("#companyName1").hide();
                            $("#companyName2").show().focus();
                        }))
                    .append($("<span/>").text($.i18n.prop('BOM.CustomerName')))
                    .append($("<span/>", {id: "companyName1"}).addClass("company")
                        .text(pageData.companyName)
                        .dblclick(function() {
                            $(this).hide();
                            $(this).next().show().focus();
                        }))
                    .append($("<input/>", {id: "companyName2", type: "text",maxlength:"30"})
                        .data("preVal", pageData.companyName)
                        .val(pageData.companyName)
                        .focusout(function() {
                            renameConfigurationFileOrCustmerCompanyName(this,'companyName');
                        })
                        .keydown(function(event) {
                            if ( event.which == 13) {
                                //renameConfigurationFileOrCustmerCompanyName(this,'companyName');
                                $(event.currentTarget).blur();
                            }
                        })
                        .hide());
            }
        }
        var configIdDisplay = null;
        if(pageData.properties.withAceId) {
            if(typeof(pageData.aceCfgId) != "undefined") {
                configIdDisplay = $("<div/>", {id: 'config_id'}).addClass("cfi").appendTo(bomConfigurationDiv)
                    .append($("<span/>").text($.i18n.prop('BOM.ACEConfigurationID')+': '))
                    .append( !$("#theData").data("isMobile")
                        ? $("<span/>").addClass("cfi").text(pageData.aceCfgId)
                        : $('<input type="text" disabled="true" />').val(pageData.aceCfgId).css({'border': 'none', 'border-bottom': 'solid 2px #ccc', 'width': '90px'}));
            }
        } else if(!pageData.isBMIAccessoriesPunchOut){
            configIdDisplay = $("<div/>", {id: 'config_id'}).addClass("cfi").appendTo(bomConfigurationDiv)
                .append($("<span/>").text($.i18n.prop('BOM.ConfigurationID')+': '))
                .append( !$("#theData").data("isMobile")
                    ? $("<span/>").addClass("cfi").text(pageData.ucid)
                    : $('<input type="text" disabled="true" />').val(pageData.ucid).css({'border': 'none', 'border-bottom': 'solid 2px #ccc', 'width': '90px'}));
        }

//		$("<hr/>").appendTo(leftColumnDiv);
        if($("#theData").data("isMobile")&&!pageData.isBMIAccessoriesPunchOut) {
            configIdDisplay.css({'float': 'left', 'line-height': '37px', 'height': '37px'});
        }

        if(paramUserType==='PublicUser'){
            $('.cfi').addClass('pu-cfi');
            //css({'float':'none','margin-top':'40px'});
        }

        var div_tabs = $('<div/>').attr('id', 'div_tabs').addClass('column').appendTo(leftColumnDiv);


        var div_tabs_ul = $('<ul/>').attr('id', 'div_tabs_ul').appendTo(div_tabs);

        $.each(pageData.subConfigs, function(i, subConfig) {

            var subconfigs = pageData.widgets.bom.subconfigs;
            var error=false;
            if(subconfigs!==undefined && subconfigs !==null && subconfigs.length > 0){
                for (var  i = 0; i < subconfigs.length; i++) {
                    if(subConfig.id!==subconfigs[i].subConfigId){
                        continue;
                    }else{
                        if(subconfigs[i].bom!==undefined){

                            var subnodes = subconfigs[i].bom.subnodes;
                            if(subnodes!==undefined && subnodes !==null && subnodes.length > 0){

                                error = checkSubNodesPrice_Status(subnodes);
                            }
                        }
                    }
                }
            }

            var subTabName = $('<a/>', {href:'#tab-' + subConfig.id,title:subConfig.name});
            subTabName.find('img').remove();
            if(error){
                $("<img/>", {src: imagesFolder + "error.png"}).appendTo(subTabName);
            }

            var exp = new RegExp();
            exp = /^(Untitled Configuration).*$/;
            if (exp.test(subConfig.name)) {
                subConfig.name = $.i18n.prop('untitledConfiguration') + subConfig.name.substring(22,subConfig.name.length);
            }
            subTabName.append(subConfig.name.length>24?subConfig.name.substr(0,21)+'...':subConfig.name);

            var subConfigLi = $('<li/>')
                .append(subTabName)
                .append($('<input/>', {id:subConfig.id, type: 'text', style:'display:none', maxlength:"100"}).val(subConfig.name));//
            if (!isBMIInternalUser) {
                subConfigLi.append($('<span/>').attr('role','presentation').attr('id','bom_page_delete_subconfig_id').addClass('ui-icon ui-icon-close'));
            }
            subConfigLi.appendTo(div_tabs_ul);
        });

        if (paramUserType != "PublicUser" && !isExternalCustomer  && pageData.properties.hasAccessory) {

            //remove parts and replaced by accessory
            var accessoryItems = pageData.widgets.accessory.items;
            var error=false;
            if(accessoryItems != undefined && accessoryItems != null && accessoryItems.length > 0) {
                for (var  i = 0; i < accessoryItems.length; i++) {
                    var item = accessoryItems[i].attributes;
                    if(!item.isBundleHeader&&item.price_status != undefined && item.price_status != "SUCCESS"){
                        error = true;
                        break;
                    }
                }
            }

            var accessory_div_tabs_li = $('<li/>');
            var accessoryTabName = $('<a/>',{'href':'#accessory_div_tabs'}).css( "cssText", "color:#000 !important" );//Non-configured Parts can not rename, so set the color to #000
            accessoryTabName.find('img').remove();
            if(error){
                $("<img/>", {src: imagesFolder + "error.png"}).appendTo(accessoryTabName);
            }
            accessoryTabName.append($.i18n.prop('widget.accessory.accessories'));
            accessory_div_tabs_li.append(accessoryTabName).appendTo(div_tabs_ul);
            selfData.accessory = $('<div/>').attr('id', 'accessory_div_tabs')
                .accessoryWidget({mode:'BOM',
                    accessory:pageData.widgets.accessory,
                    isBMIAccesoryPunchOutSuccess: pageData.saveAlertMessage !== undefined && pageData.saveAlertMessage === "addToTransactionSuccess",
                    settings:{
                        listPrcieColumn:!hideCols.listPriceHide,
                        discountColumn:!hideCols.percentDiscountHide,
                        netPriceColumn:!hideCols.netPriceHide,
                        extendPriceColumn:!hideCols.extendedNetPriceHide,
                        estimatedGrandTotal:!hideCols.listPriceHide,
                        accessoryTotalPrice:!hideCols.listPriceHide,
                        productNoColumn:!hideCols.productNumberHide
                    }
                }).appendTo(div_tabs);
        }

        var isBundle = false;
        if($('#accessory_div_tabs').length >0){
            isBundle = $('#accessory_div_tabs').accessoryWidget('isBundle');
        }

        if (!isBMIInternalUser || pageData.isNullConfig) {
//			var bom_header_div = $("<div/>", {id: "bom_header_div"}).addClass("clearfix").appendTo(leftColumnDiv);
//			var bom_header_div1 = $("<div/>", {id: "bom_header_div1"}).appendTo(bom_header_div);
//			var bom_header_div2 = $("<div/>", {id: "bom_header_div2"}).addClass("bom_page_ctrl_btns_box").appendTo(bom_header_div);
            if(!isBMIInternalUser){
                $("<h2/>", {id: "sce_bom_title_header", text: $.i18n.prop("BOM.HeaderText1")}).appendTo(bom_header_left);
                $("<p>", {
                    id: "sce_bom_title_description",
                    text: isExternalCustomer ? $.i18n.prop("BOM.HeaderText2ForExternalCustomer") : $.i18n.prop("BOM.HeaderText2")
                }).appendTo(bom_header_left);
            }
//			upsell_btn.appendTo(bom_header_div2);
//			product_message_btns.appendTo(bom_header_div2);

            if(pageData.properties.withOCCContent==undefined || !pageData.properties.withOCCContent){
                //add pop-up list
                var add_config_list = addZ_indexList({
                    body: [
                        {html: $.i18n.prop('bomPage.AddConfigurationFromExisting'), id: 'add_from_existing', click: function(){
                            addSubconfiguaration("load_sce_landing_page_with_open_sub_config");
                        }},
                        {html: $.i18n.prop('bomPage.AddConfigurationFromProductCatalog'), id: 'add_from_catalog', click: function(){
                            addSubconfiguaration("load_sce_landing_page_with_new_sub_config");
                        }}
                    ],
                    relative_div_css: {left: "0"},
                    troublemaker: "add_config_button"
                });
                var add_config_button = $("<input/>", {id: "add_config_button", type: "button", value: $.i18n.prop("bomPage.AddConfiguration")})
                    .addClass("button slim primary")
                    .click(function(){
                        if(isBMIInternalUser){
                            addSubconfiguaration("load_sce_landing_page_with_new_sub_config");
                        }else{
                            add_config_list.show();
                        }
                    });
                $("<li/>").append(add_config_button).append(add_config_list).addClass(isBMIInternalUser?"right pt10":"right").appendTo(product_message_btns);

            }
//			var sqConfigStatusMessage = "";
//			if ($("#theData").data("isJustSentToSQ")) {
//				$("#theData").data("isJustSentToSQ", Boolean(false));
//				sqConfigStatusMessage = $('<div>',{id:'sce_bom_config_status', text: $("#theData").data("conigurationStatus")});
//			} else if (pageData.CompletenessState == "Complete") {
//				sqConfigStatusMessage = $('<div>',{id:'sce_bom_config_status', text: $.i18n.prop("configurationStatusComplete")});
//			}
        }
        if(!pageData.isBMIAccessoriesPunchOut){
            if(isExternalCustomer && !isBundle) {
                upsell_btn.appendTo($("<li/>").addClass("right").appendTo(product_message_btns.appendTo(bom_header_right)));
            }else if(isBMIInternalUser && !isBundle) {
                product_message_btns.data("fitCls", "pt10");
                upsell_btn.appendTo($("<li/>").addClass("right").appendTo(product_message_btns.appendTo(bom_header_right)));
            }else if(!isBundle){
                upsell_btn.appendTo(bom_header_right);
                product_message_btns.appendTo(bom_header_right);
            }
        }

        if(pageData.properties.withAceId && pageData.widgets.partCd) {

            var part_div_tabs_li = $('<li/>');
            var partTabName = $('<a/>',{'href':'#part_div_tabs_cd'});
            partTabName.find('img').remove();
            if(error){
                $("<img/>", {src: imagesFolder + "error.png"}).appendTo(partTabName);
            }
            partTabName.append($.i18n.prop('configurationDetail.tab.header'));
            part_div_tabs_li.append(partTabName).appendTo(div_tabs_ul);

            $('<div/>').attr('id', 'part_div_tabs_cd').part_cd_widget({mode:'BOM', resCd:pageData.widgets.partCd.resCd,userType:pageData.user.user_type}).appendTo(div_tabs);

            var part_div_tabs_li = $('<li/>');
            var partTabName = $('<a/>',{'href':'#part_div_tabs_ls'});
            partTabName.find('img').remove();
            if(error){
                $("<img/>", {src: imagesFolder + "error.png"}).appendTo(partTabName);
            }
            partTabName.append($.i18n.prop('localizationDetail.tab.header'));
            part_div_tabs_li.append(partTabName).appendTo(div_tabs_ul);

            $('<div/>').attr('id', 'part_div_tabs_ls').part_cd_widget({mode:'BOM', resLoc:pageData.widgets.partCd.resLoc,userType:pageData.user.user_type}).appendTo(div_tabs);
        }
        selfData.avail = $('<div/>').attr('id', 'avail').addClass('wims_div').availWidget({mode:'BOM', avail:pageData.widgets.avail, isBMIInternalUser: isBMIInternalUser, userType:paramUserType ,isExternalCustomer:isExternalCustomer,hasAccessory:hasAccessory});
        if(!pageData.isBMIAccessoriesPunchOut){
            selfData.avail.appendTo(rightColumnDiv);
        }

        $.each(pageData.widgets.bom.subconfigs, function(i, subConfig) {
            $('<div/>').attr('id', 'tab-' + subConfig.subConfigId).bomWidget({mode:'BOM',  hidColsParams: hideCols,bom:pageData.widgets.bom, subConfig:subConfig, isBMIInternalUser:isBMIInternalUser,
                userType:paramUserType,userId:pageData.user.user_id ,isExternalCustomer:isExternalCustomer,isReadOnlyConfig:readOnlyConfig,includeBomEditPenQty:includeBomEditPenQty }).appendTo(div_tabs);
            if(pageData.widgets.bom.properties.hierarchyBom){
                checkShowBOMHierarchy(pageData.user.user_id,subConfig.subConfigId,subConfig.bom);
            }
        });

        // add product recommendations under bom grid
        if(pageData.widgets.prodRecommendation) {
            $('<div/>').attr('id', 'prod_recommendation_div').prodRecommendation({mode:'BOM', recommendations:pageData.widgets.prodRecommendation}).appendTo(leftColumnDiv);
        }

        pageDiv.sceFooterWidget(pageData.user);

        var active=pageData.subConfigs.length-1;
        for(var i=0; i< pageData.subConfigs.length; i++){
            if(pageData.subConfigs[i].id==pageData.activeSubConfigId){
                active = i;
                break;
            }
        }

        if(""==pageData.activeSubConfigId){
            active = pageData.subConfigs.length;
        }

        var subId ;
        var tabs = $("#div_tabs").tabs({'active':active})
            .on("tabsactivate",
            function(event, ui) {
                $(".view_as").remove();
                $("#view_tab").remove();
                $("#bom_grid_header").remove();
                subId = ui.newTab.children('input').attr('id');
                var isAccessoryTab = (subId === undefined);

                toggleSCEButtonStatus(upsell_btn, "critical", subId);
                var add_product_btn = $("#add_product_button_div_id");
                toggleSCEButtonStatus(add_product_btn, "primary", subId);

                $('#sce_bom_right_div').data('subConfigId', isAccessoryTab? "": subId);
                product_message_btns.data('subConfigId', isAccessoryTab? "": subId);

                //setNavPanelStatusCookie();
                serverTransaction(
                    {
                        method:'sync_active_subconfig_id',
                        'subConfig_id': isAccessoryTab? "": subId
                    }
                );
                upsellStateCheck(upsell_btn,subId);
                if(!isAccessoryTab && pageData.widgets.bom.properties.hierarchyBom){
                    $.each(pageData.widgets.bom.subconfigs, function(i, subConfig) {
                        if(subConfig.subConfigId == subId){
                            checkShowBOMHierarchy(pageData.user.user_id,subConfig.subConfigId,subConfig.bom);
                            return;
                        }
                    });
                }

                // retrieve the WIMS
                $('div').remove('.inner_wims_div');
                if(isAccessoryTab==false){
                    selfData.wims = $('<div/>').attr('id', 'wims').addClass('inner_wims_div').appendTo(wims_Div)
                        .wims({mode:'SCE', wims:wimsPersistData,
                            configid:pageData.configid, subconfigid:ui.newTab.children('input').attr('id'),
                            hasAccessory: hasAccessory, showDropDownImage: pageData.properties.includeWIMSDropdownImage});
                }
            }
        );

        var ul = $("#div_tabs_ul");

//		if (!($("#theData").data("isMobile"))) {
        subId = ul.find('li:eq('+ active +') input').attr('id');
//		}else if(pageData.subConfigs[0] !== undefined){
//			subId = pageData.subConfigs[0].id;
//		}else{
//			subId = "";			
//		}

        rightColumnDiv.data("subConfigId", subId);
        if (subId) {
            upsellStateCheck(upsell_btn, subId);
        } else {
            upsell_btn.prop("disabled", true);
            upsell_btn.addClass("cancel");
        }
        upsell_btn.click(function() {
            //setNavPanelStatusCookie();
            serverTransaction({method: "load_upsell_page", subId: subId});
            $(this).upsell_widget({upsellData: pageData.widgets.upsell})
        });
        product_message_btns.data("subConfigId", subId);
//		if (($("#theData").data("isMobile"))) {
//	    	$("<div/>").addClass("bom_page_ctrl_btns_box").append(upsell_btn).append(product_message_btns).appendTo(bom_header_right);
//	    }
        if(!pageData.isBMIAccessoriesPunchOut){
            createAddProductAndMessageButtons(pageData, product_message_btns, isExternalCustomer);
        }
        var wims_Div=$('<div/>').attr({'id': 'wims_wrapper'});
        if(!pageData.isBMIAccessoriesPunchOut){
            wims_Div.appendTo(rightColumnDiv);
        }
        wimsPersistData = pageData.widgets.wims;
        if(subId != undefined && subId != '' ){
            selfData.wims = $('<div/>').attr('id', 'wims').addClass('inner_wims_div').appendTo(wims_Div).wims({mode:'SCE', wims:wimsPersistData, configid:pageData.configid, subconfigid:subId,
                hasAccessory: hasAccessory, showDropDownImage:pageData.properties.includeWIMSDropdownImage});
        }

        //Pricing Details
        selfData.pricingDetail = pricingDetails($('<div/>',{id:'pricingDetailsDiv'}),pageData.priceDetail);
        if(!pageData.isBMIAccessoriesPunchOut){
            selfData.pricingDetail.appendTo(rightColumnDiv);;
        }
        ul.delegate( "span.ui-icon-close", "click", function() {
            "use strict";
            var span = $(this);
            var input = span.prev();

//			serverTransaction({method:'load_delete_sce_subconfig','subConfig_id':input.attr('id')});
            $("<div/>",  {title: $.i18n.prop('Confirm')}).append($("<p/>").text($.i18n.prop('BOM.DeleteSubConfigurationConfirmation')))
                .dialog({
                    autoOpen: true,
                    modal: true,
                    width: 500,
                    height: 260,
                    buttons: [{
                        id:'bom_page_delete_config_yes',text: $.i18n.prop('Yes'), click: function() {
                            $(this).dialog("close");
                            //setNavPanelStatusCookie();
                            serverTransaction({method: "delete_sce_subconfig", subConfig_id: input.attr("id"), operType: 'delete'});
                        }
                    },{
                        id:'bom_page_delete_config_no',text: $.i18n.prop('No'), click: function() {
                            $(this).dialog("close");
                        }
                    }],
                    close: function() { $(this).dialog("destroy").remove(); }
                });
        });

        ul.delegate("a[href|='#tab']","dblclick",function(){
            if(!readOnlyConfig) {
                var a = $(this);
                var input = a.next();
                var span = input.next();
                var li = a.parent();
                var width = li.width() -3.5 ;
                var height = li.height() - 6;
                input.data('preVal',input.val());

                a.css('display','none');
                span.css('display','none');
                input.css('display','block').focus().val(input.val()).width(width).height(height);
            }
        });

        ul.delegate("input","focusout",function(){
            renameSubconfig(this);
        });

        ul.delegate("input","keydown",function(event){

            if ( event.which == 13 || event.which == 9)
            {
//				renameSubconfig(this);
                $(event.currentTarget).blur();
            }
            if ( event.which == 37 || event.which == 38 || event.which == 39 || event.which == 40){
                event.stopPropagation();
            }

            if(event.which == 32){
                insertAtCursor(event.currentTarget,' ');
            }
        });

//		self.sce_bom_page('resize');
//	
//		$(window).resize(function(){
//			self.sce_bom_page('resize');
//		});
        //remove sq by venture
//		function confirmCreateOrUpdateSQ(isCreate) {
//			var partItems = pageData.widgets.part.items;
//			if(partItems != undefined && partItems != null && partItems.length > 0) {
//				$("<div/>",  {title: $.i18n.prop('Confirm')}).text($.i18n.prop("partsWontSend"))
//				.dialog({
//					autoOpen: true,
//					modal: true,
//					width: 500,
//					height: 260,
//					buttons: [{
//						text: $.i18n.prop('Yes'), click: function() {
//							$(this).dialog("close");
//							createOrUpdateSQ(isCreate);
//						}
//					},{
//						text: $.i18n.prop('No'), click: function() {
//							$(this).dialog("close");
//						}
//					}],
//					close: function() { $(this).dialog("destroy").remove(); }
//				});
//			} else {
//				createOrUpdateSQ(isCreate);			}
//		}
//
//		function createOrUpdateSQ(isCreate) {
//			var timezoneOffset = new Date().getTimezoneOffset().toString();
//			var result;
//			var sqMessageTitle = "";
//			var sqErrorMessage = "";
//			var sqErrorMessageKey = "";
//			if(isCreate) {
//				result = getServerData({
//							method:"submit_smart_quote", 
//							timezoneOffset: timezoneOffset, 
//							lastSaveNStr:$.cookie(pageData.user.user_id+'lastSaveNs')
//						});
//				
//				sqMessageTitle = $.i18n.prop("specialPricingStatus");
//				sqErrorMessageKey = "specialPricingOccurIssue";
//			} else {		
//				
//				result = getServerData({
//							method:"update_smart_quote", 
//							timezoneOffset: timezoneOffset,
//							lastSaveNStr:$.cookie(pageData.user.user_id+'lastSaveNs'),
//							OpportunityId: pageData.opportunityId,
//							ucid: pageData.ucid
//						});
//				sqErrorMessageKey = "updateSQOccurIssue";
//			}
//			
//			if (result == undefined ) {
//				sqErrorMessage = $.i18n.prop(sqErrorMessageKey);			
//			} else if (result.quoteStatusCode == "Complete") {
//				if($.cookie) {
//					$.cookie(pageData.user.user_id+'lastSaveNs', result.lastSaveNs);
//				}
//			} else {
//				if (result.quoteStatusCode == "EligibilityCheckFailed") {
//					sqErrorMessage = $.i18n.prop("configurationHasEligibleIssue");
//				} else if (result.quoteStatusMessage != undefined && result.quoteStatusMessage != "") {
//					sqErrorMessage = result.quoteStatusMessage;
//				} else {
//					sqErrorMessage = $.i18n.prop(sqErrorMessageKey);
//				}
//			}
//			
//			
//			if (result == undefined || result.quoteStatusCode != "Complete") {
//				displayHTMLInModalDialog(sqMessageTitle,sqErrorMessage,340,220,
//					[{text: $.i18n.prop('OK'), click : function () { 
//						$(this).dialog("close");
//						$(this).remove(); 
//						}}]);
//			} 
//					
//			if (result != undefined && result.smartQuoteID != undefined) {
//				
//				var configStatus;
//				if(isCreate) {
//					configStatus = "configurationSentToSQ";
//					showEmailDialog(result);
//				}else{
//					configStatus = "configurationUpdateToSQ";
//					displayHTMLInModalDialog("",$.i18n.prop('updateSQSuccess',result.smartQuoteID,pageData.ucid),340,220,
//							[{text: $.i18n.prop('OK'), click : function () { 
//								$(this).dialog("close");
//								$(this).remove(); 
//								}}]);
//				}
//				
//				$("#theData").data("isJustSentToSQ", true);
//				$("#theData").data("conigurationStatus", $.i18n.prop(configStatus, result.smartQuoteID) + "    " + result.quoteStatusMessage);
//				serverTransaction({method:"show_sce_bom_page",subConfigId: pageData.activeSubConfigId == undefined? pageData.subConfigs[0].id : pageData.activeSubConfigId });
//			}
//
//			if (result != undefined && result.hasIneligibleProducts == true) {
//				serverTransaction({method:"show_sce_bom_page",subConfigId: pageData.activeSubConfigId == undefined? pageData.subConfigs[0].id : pageData.activeSubConfigId });
//			}
//		}

        if(pageData.subConfigurations!= undefined)
        {
            var subConfigDiv =  $("<div/>");
            var dialog = $("<div/>")
                .append(
                $("<table/>").attr('id','listSubconfs')
                    .append($("<tr/>")
                        .append($("<td/>").append(subConfigDiv))
                ));
            var subConfArray = pageData.subConfigurations.subConfigs;
            var canAddSubConfig = pageData.subConfigurations.canAddSubConfig;
            if(canAddSubConfig == false)
            {
                showAlertDialog("You cannot add a subconfig belonging to a different Country/Region.Please select a different one.");
                return;
            }
            $.each(subConfArray , function(i, node)
            {
                $('<input/>').attr({'type':'radio' ,'name':'group1'}).appendTo(subConfigDiv);
                $('<label/>').attr('id','lbl-'+ i).text(node).appendTo(subConfigDiv);
                $("<br/>").appendTo(subConfigDiv);

            });
            $("<td/></tr></table>").appendTo(subConfigDiv);

            displayHTMLInModalDialog($.i18n.prop('subConfigurationList'), dialog.html(), 500, 200,
                [ {id:'Submit', text:$.i18n.prop('Submit'), click: function () {

                    //setNavPanelStatusCookie();
                    serverTransaction({method:'add_sub_config_to_existing_config',srcConfigId:pageData.subConfigurations.srcConfigId,content: pageData.subConfigurations.content,currentSubConfigId:$("input:checked" , listSubconfs).next().attr('id').split('-')[1]});
                    //serverTransaction({method:'open_quote_by_config',currentSubConfigId:$("input:checked" , listSubconfs).next().attr('id').split('-')[1]});
                    $(this).dialog("close");
                }},
                    {id:'Cancel', text:$.i18n.prop('Cancel'), click: function () { $(this).dialog("close"); }}
                ]);
        }

        //set mobile layout
        if ($("#theData").data("isMobile")) {
            var ul = $('<ul/>').appendTo(bomConfigurationDiv);
            $('<li/>').append($('#config_title').removeClass('cfn').css('color', '#0096D6')).appendTo(ul);
            $('<li/>').append($('#subconfig_summary_1')).appendTo(ul);
            $('#subconfig_summary_1').find('span:first').removeClass('cfn').css('color', '#0096D6');
            $('<li/>').append($('#config_id').removeClass('cfi').css('color', '#B9B8BB')).appendTo(ul);

            panelLayout(dataDiv, 'bom_panel_layout', {
                mobileFlag: $("#theData").data("isMobile"),
                header: [$('#sce_header'), $('#sce_toolbar')],
                content: [$('#center_div')],
                footer: [$('#sce_footer')],
                panel: [$('#sce_bom_right_div')],
                position: 'right',
                navText: 'navigationTitleId'

            },'bom');
        }

        //due to jquery ui tabs block the key space input, here is to implement space input
        function insertAtCursor(myField, myValue) {
            // IE support
            if (document.selection) {
                myField.focus();
                var sel = document.selection.createRange();
                sel.text = myValue;
                sel.select();
            }
            // MOZILLA/NETSCAPE/Chrome support
            else if (myField.selectionStart || myField.selectionStart == '0') {
                var startPos = myField.selectionStart;
                var endPos = myField.selectionEnd;
                // save scrollTop before insert
                var restoreTop = myField.scrollTop;
                myField.value = myField.value.substring(0, startPos) + myValue
                    + myField.value.substring(endPos, myField.value.length);
                if (restoreTop > 0) {
                    // restore previous scrollTop
                    myField.scrollTop = restoreTop;
                }
                myField.focus();
                myField.selectionStart = startPos + myValue.length;
                myField.selectionEnd = startPos + myValue.length;
            } else {
                myField.value += myValue;
                myField.focus();
            }
        }

        function checkShowBOMHierarchy(userId,subConfigId,bom){
            var changedFlag = true;
            var showBOMHierarchy =  false;
            if($.cookie(userId+'showHierarchy') != undefined && $.cookie(userId+'showHierarchy') != ''){

                if($.cookie(userId+'showHierarchy') == "show" && $("#showHierarchy"+subConfigId).prop('checked')){
                    changedFlag = false;
                }
                if (changedFlag) {
                    expandAllBOMNode(subConfigId, bom);
                    if ($.cookie(userId + 'showHierarchy') == "show") {
                        showBOMHierarchy = true;
                    } else {
                        showBOMHierarchy = false;
                    }

                    if (showBOMHierarchy) {
                        $("#bom_grid" + subConfigId + " th:first-child").show();
                        $("#bom_grid" + subConfigId + " td:first-child").show();
                        $("#showHierarchy" + subConfigId).prop('checked', true);

                        $('#span'+subConfigId).removeClass('nochecked');
                        $('#span'+subConfigId).addClass('bluechecked');
                    } else {
                        $("#bom_grid" + subConfigId + " th:first-child").hide();
                        $("#bom_grid" + subConfigId + " td:first-child").hide();
                        $("#showHierarchy" + subConfigId).prop('checked', false);

                        $('#span'+subConfigId).removeClass('bluechecked');
                        $('#span'+subConfigId).addClass('nochecked');
                    }

                }
            }
        }

        function expandAllBOMNode(subConfigId,node) {
            var isTrHidden = false;
            var lineItemId = "";
            if(node.attributes.sequence != undefined){
                lineItemId = node.attributes.sequence;
            }
            var nodeNum = lineItemId + subConfigId + node.attributes.product_number.replace(/\s+/g, "");
            if (node.type !== "RootNode" && node.type !== "BOM_RootNode") {
                isTrHidden = $("#"+nodeNum).is(":hidden");
                if(($("#img"+nodeNum).attr('src') == imagesFolder + "branch_closed.png")){
                    $("#img"+nodeNum).attr('src',imagesFolder + "branch_open.png");
                    $("#unit_price"+nodeNum).text(node.attributes.unit_price);
                    $("#discount_rate"+nodeNum).text(node.attributes.discount_rate);
                    $("#net_price"+nodeNum).text(node.attributes.net_price);
                    $("#ext_price"+nodeNum).text(node.attributes.ext_price);
                }
                if(isTrHidden){
                    $("#"+nodeNum).toggle(400);
                }
            }
            $.each(node.subnodes, function(i, v) { expandAllBOMNode(subConfigId,v); });
        }

        function checkNullBOM(){
            var isNullBOM = false;
//			if(!isNullBOM){
            if(pageData.widgets.accessory == undefined || pageData.widgets.accessory.length == 0 || pageData.widgets.accessory.items == undefined || pageData.widgets.accessory.items.length == 0){
                if(pageData.widgets.bom.subconfigs==undefined||pageData.widgets.bom.subconfigs.length==0){
                    isNullBOM = true;
                }else{
                    $.each(pageData.widgets.bom.subconfigs, function(i, subConfig) {
                        if(subConfig.bom == undefined || subConfig.bom.length == 0 || subConfig.bom.subnodes == undefined || subConfig.bom.subnodes.length ==0){
                            isNullBOM = true;
                        }
                    });
                }
            }
//			}
            return isNullBOM;
        }

        function renameSubconfig(textbox){

            /*
             * Making use of trim() like so '$(textbox).val().trim()'
             * This works in FF/Chorme but when try it on IE8
             * it will give you this error:Object doesn't support this property or method
             * Instead:$.trim($(ele).val)
             * More Info:http://api.jquery.com/jQuery.trim/
             **/

            var input = $(textbox);
            var a = input.prev();
            var span = input.next();

            if($.trim(input.val()).length==0){
                displayHTMLInModalDialog(
                    '',$.i18n.prop('BOM.InvalidSubConfigurationName'),350, 220,
                    [ {id:'OK', text:$.i18n.prop('OK'), click: function () {
                        $(this).empty(); $(this).dialog("close");

                        $(textbox).focus();
                    }}]
                ).parent().find('.ui-dialog-titlebar').hide();

                return;
            }

            var ul=$("#div_tabs_ul");
            var inputs = ul.find('input');
            for(var i=0;i< inputs.length;i++){
                var _input = $(inputs[i]);
                if($.trim(_input.val())===input.val()&&input.attr('id')!=_input.attr('id')){

                    displayHTMLInModalDialog(
                        '',$.i18n.prop('BOM.DuplicatedSubConfigurationName'),350, 220,
                        [ {id:'OK', text:$.i18n.prop('OK'), click: function () {
                            $(this).empty(); $(this).dialog("close");

                            $(textbox).focus();
                        }}]
                    ).parent().find('.ui-dialog-titlebar').hide();

                    return;
                }
            }

            if(input.val()==input.data('preVal')){

                $(textbox).hide();
                $(textbox).prev().show();
                span.css('display','block');
                return;
            }

            displayHTMLInModalDialog(
                '',$.i18n.prop('BOM.ChangeSubConfigurationNameConfirmation'),350, 220,
                [  {id:'OK', text:$.i18n.prop('OK'), click: function () {
                    $(this).dialog("close");

                    $(textbox).data('preVal',$(textbox).val());

                    $(textbox).hide();
                    $(textbox).prev().text($(textbox).val()).show();

                    //setNavPanelStatusCookie();
                    serverTransaction({method:'rename_subconfig_bom_page','new_subConfig_name':input.val(),'subConfig_id':input.attr('id')});
//						// retrieve the WIMS
//						$('div').remove('.inner_wims_div');
//						$('<div/>').attr('id', 'wims').addClass('inner_wims_div').appendTo(wims_Div).wims({mode:'SCE', wims:pageData.widgets.wims, configid:pageData.configid, subconfigid:input.attr('id'),showDropDownImage: pageData.properties.withSCEContent});

                    input.css('display','none');
                    a.css('display','block').text(input.val().length>20?input.val().substr(0,20)+'...':input.val());
                    span.css('display','block');

                    input.data('preVal',input.val());
                }},
                    {id:'Cancel', text:$.i18n.prop('Cancel'), click: function () {

                        $(this).empty(); $(this).dialog("close");
                        $(textbox).val($(textbox).data('preVal'));

                        $(textbox).hide();
                        $(textbox).prev().show();
                    }}
                ]).parent().find('.ui-dialog-titlebar').hide();
        }

        function addSubconfiguaration(methodName){

            var actionLink = function(){

                //setNavPanelStatusCookie();
                serverTransaction({
                    method:methodName,
                    configurationName: $('#configurationFileName2').val(),
                    addfromexisting:true
                });
            };
            var isNeedUpdateAccessory = false;

            if($('#accessory_div_tabs').length>0){
                isNeedUpdateAccessory = $('#accessory_div_tabs').accessoryWidget('isNeedUpdateAccessories',actionLink);
            }

            //check status
            if(isNeedUpdateAccessory){
                return;
            }

            actionLink();
        }

        function checkSubNodesPrice_Status(nodes){

            for (var  i = 0; i < nodes.length; i++) {

                if(nodes[i].attributes.price_status != undefined && nodes[i].attributes.price_status != "SUCCESS"){
                    return true;
                }

                var subnodes = nodes[i].subnodes;
                if(subnodes!==undefined && subnodes !==null && subnodes.length > 0){

                    if(checkSubNodesPrice_Status(subnodes)){
                        return true;
                    }
                }
            }

            return false;
        }

        function renameConfigurationFileOrCustmerCompanyName(textbox,type){

            /*
             * Making use of trim() like so '$(textbox).val().trim()'
             * This works in FF/Chorme but when try it on IE8
             * it will give you this error:Object doesn't support this property or method
             * Instead:$.trim($(ele).val)
             * More Info:http://api.jquery.com/jQuery.trim/
             **/

            if($.trim($(textbox).val()).length==0 && $(textbox).data('preVal')!==''){

                if(type==='companyName'){

                    displayHTMLInModalDialog(
                        '',$.i18n.prop('BOM.InvalidCustomerName'),350, 220,
                        [ {id:'OK', text:$.i18n.prop('OK'), click: function () {
                            $(this).empty(); $(this).dialog("close");

                            $(textbox).focus();
                        }}]
                    ).parent().find('.ui-dialog-titlebar').hide();
                }
                if(type==='configurationName'){

                    displayHTMLInModalDialog(
                        '',$.i18n.prop('BOM.InvalidConfigurationName'),350, 220,
                        [ {id:'OK', text:$.i18n.prop('OK'), click: function () {
                            $(this).empty(); $(this).dialog("close");

                            $(textbox).focus();
                        }}]).parent().find('.ui-dialog-titlebar').hide();;
                }

                return;
            }

            if($(textbox).data('preVal')== $.trim($(textbox).val())){
                if (false===$("#theData").data("isMobile")){
                    $(textbox).hide();
                    $(textbox).prev().show();
                }
                return;
            }

            var comfirmStr = type==='configurationName'? $.i18n.prop('BOM.ChangeConfigurationName'):$.i18n.prop('BOM.ChangeCustomerNameConfirmation');

            if (true===$("#theData").data("isMobile")){
                $(textbox).data('preVal',$(textbox).val());
                //setNavPanelStatusCookie();
                serverTransaction({method:'modify_config_or_compnay_name',type:type,value:$.trim($(textbox).val())});
            }else{
                displayHTMLInModalDialog(
                    '',comfirmStr,350, 220,
                    [ {id:'OK', text:$.i18n.prop('OK'), click: function () {
                        $(this).dialog("close");
                        //setNavPanelStatusCookie();
                        if(pageData.properties.withOCCContent && !pageData.properties.withSCEContent){
                            serverTransaction({method:'modify_config_or_compnay_name',subConfigId: pageData.subConfigs[0].id,type:type,value:$.trim($(textbox).val())});
                        }else{
                            serverTransaction({method:'modify_config_or_compnay_name',type:type,value:$.trim($(textbox).val())});
                        }
                        $(textbox).data('preVal',$(textbox).val());

                        $(textbox).hide();
                        $(textbox).prev().text($(textbox).val()).show();

                        if (pageData.user.user_type == "PRMExternalUser") {
                            $("#updateSQ_link").attr("disabled", "disabled");
                            $("#submitSQ_link").attr("disabled", "disabled");
                            $("#emailConfigFileId_link").attr("disabled", "disabled");
                        }
                    }} ,
                        {id:'Cancel', text:$.i18n.prop('Cancel'), click: function () {
                            $(this).empty(); $(this).dialog("close");
                            $(textbox).val($(textbox).data('preVal'));

                            $(textbox).hide();
                            $(textbox).prev().show();
                        }}
                    ]).parent().find('.ui-dialog-titlebar').hide();
            }
        }

        $('html,body').scrollTop(0);
        if($("#theData").data("isMobile")){
            $('.product-message-btns input[type="button"]').css('-webkit-appearance','none');
            $('.ui-widget-content,ui-body-d').css('color','black');

            var anchors=$("span").find(".dynatree-title");
            anchors.each(function(index,element){
                if(navigator.userAgent.indexOf("Firefox") !== -1){
                    $(element).parent().css({'display':'inline-block','width':'100%'});
                }
            });

            var expanderSpan=$("#wims span .dynatree-expander");
            expanderSpan.each(function(index, expander){
                $(expander).css("float","left");
            });
        }
    }

    function pricingDetails(pricingDetailsDiv,pricingDetailsInfo){

        pricingDetailsDiv.empty();
        var create_date;
        var price_date;
        var pa_expire_date;
        if(pricingDetailsInfo.create_date!==undefined&&pricingDetailsInfo.create_date!==""){
            create_date = $.datepicker.formatDate($.i18n.prop('dateFormat') ,new Date(Number(pricingDetailsInfo.create_date)));
        }

        if(pricingDetailsInfo.price_date!==undefined&&pricingDetailsInfo.price_date!==""){
            price_date = $.datepicker.formatDate($.i18n.prop('dateFormat') ,new Date(Number(pricingDetailsInfo.price_date)));
        }

        if(pricingDetailsInfo.pa_expire_date!==undefined&&pricingDetailsInfo.pa_expire_date!==""){
            pa_expire_date = $.datepicker.formatDate($.i18n.prop('dateFormat') ,new Date(Number(pricingDetailsInfo.pa_expire_date)));
        }

        var pricingDetailsHeader = $('<div/>').attr({'id': 'pricingDetailsHeader'}).appendTo(pricingDetailsDiv);
        $('<h3/>').append($('<div/>',{'id':"pricing_details_panel"}).addClass('sce-bom-collapsed').data('expanded', true))
            .append($.i18n.prop('bom.PricingDetails')).appendTo(pricingDetailsHeader);
        pricingDetailsHeader.click(function() {
            $("#pricingDetailsTable").toggle("blind", {}, 500);
            var icon = $(this).find('#pricing_details_panel');
            if (icon.data('expanded')) {
                icon.removeClass('sce-bom-collapsed')
                    .addClass('sce-bom-expanded');
            } else {
                icon.removeClass('sce-bom-expanded')
                    .addClass('sce-bom-collapsed');
            }
            icon.data('expanded', !icon.data('expanded'));
        });

        var pricingDetailsTable = $('<div/>').attr('id', 'pricingDetailsTable').appendTo(pricingDetailsDiv);

        var pricingDetailsTable1 = $('<table/>').append($('<TBODY/>')).appendTo(pricingDetailsTable);
        pricingDetailsTable1
            .append($('<TR/>')
                .append($('<TD/>', {html: $.i18n.prop('bom.CreationDate')}).addClass('col_1'))
                .append($('<TD/>', {html:create_date}).addClass('col_2')))
            .append($('<TR/>')
                .append($('<TD/>', {html: $.i18n.prop('bom.PricingDate')}).addClass('col_1'))
                .append($('<TD/>', {html:price_date}).addClass('col_2')));
        if (!isBMIInternalUser && paramUserType != "PublicUser" && !isExternalCustomer) {
            if(pricingDetailsInfo.pa_number!=undefined && ""!=pricingDetailsInfo.pa_number){
                pricingDetailsTable1
                    .append($('<TR/>')
                        .append($('<TD/>', {html: 'PA#'}).addClass('col_1'))
                        .append($('<TD/>', {html:pricingDetailsInfo.pa_number}).addClass('col_2')));
            }
            if(pa_expire_date!=undefined && ""!=pa_expire_date){
                pricingDetailsTable1.append($('<TR/>')
                    .append($('<TD/>', {html: $.i18n.prop('bom.PAExpiringDate')}).addClass('col_1'))
                    .append($('<TD/>', {html:pa_expire_date}).addClass('col_2')));
            }
            if(pricingDetailsInfo.paCAC!=undefined && ""!=pricingDetailsInfo.paCAC){
                pricingDetailsTable1.append($('<TR/>')
                    .append($('<TD/>', {html:'CAC'}).addClass('col_1'))
                    .append($('<TD/>', {html:pricingDetailsInfo.paCAC}).addClass('col_2')));
            }

        }
        pricingDetailsTable1
            .append($('<TR/>')
                .append($('<TD/>', {html: $.i18n.prop('bom.Country')}).addClass('col_1'))
                .append($('<TD/>', {html:pricingDetailsInfo.price_geo}).addClass('col_2')))
            .append($('<TR/>')
                .append($('<TD/>', {html: $.i18n.prop('bom.Currency')}).addClass('col_1'))
                .append($('<TD/>', {html:pricingDetailsInfo.currency_code}).addClass('col_2')));

        return pricingDetailsDiv;
    }

    function getHiddenColParams(pageData){

        if (!pageData.widgets.bom.properties.showPrices || pageData.user.user_type==='PublicUser'){
            hideCols.listPriceHide = true;
            hideCols.percentDiscountHide = true;
            hideCols.netPriceHide = true;
            hideCols.extendedNetPriceHide = true;
        }
        if (pageData.user.user_type==='BMIInternalUser') {
            hideCols.percentDiscountHide = true;
            hideCols.netPriceHide = true;
            hideCols.extendedNetPriceHide = true;
        }

        if ($("#theData").data("isMobile")) {
            hideCols.percentDiscountHide = true;
            hideCols.netPriceHide = true;
            hideCols.extendedNetPriceHide = true;
        }

        if (isExternalCustomer!==undefined && isExternalCustomer) {
            hideCols.listPriceHide = true;
            hideCols.hierarchyBomHide = true;
            hideCols.percentDiscountHide = true;
            hideCols.netPriceHide = true;
            hideCols.productNumberHide = true;
        }

        if (!pageData.widgets.bom.properties.hierarchyBom) {
            hideCols.hierarchyBomHide = true;
        }

        if (!pageData.widgets.bom.properties.showAvailability) {
            hideCols.availabilityHide = true;
        }

        return hideCols;
    }

    function activeAccessories(){

        var len = $("#div_tabs_ul").find('li').length-1;
        $("#div_tabs").tabs("option","active",len);
    }

    function upsellStateCheck(upsell_btn, subId){
        getServerData({method: "upsellStateCheck",
                activeSubconfigId:subId},
            function (sendResult){
                if(sendResult.upsellState){
                    upsell_btn.prop("disabled", false);
                    upsell_btn.addClass("critical");
                }else{
                    upsell_btn.prop("disabled", true);
                    upsell_btn.addClass("cancel");
                }
            });
    }

    var methods = {
        init: function (pageData, nav) {
            this.data(dataTag, {});
            showSCEBOMPageSub(pageData, nav, this);
            return this;
        },
        active_accessories:function (){activeAccessories();}
    };

    $.fn.sce_bom_page = function( method ) {
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.instance_detail' );
        }
    };

};
sce_bom_page_plugin.prototype = {};
sce_bom_page_plugin(jQuery);

