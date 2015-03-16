(function() {
    // define the MAUI global variable
    var _maui = {
        dev_mode: false
    };

    // define variable for tool level
    _maui.tool = {
        name: "",
        mode: "",
        folder: ""
    };

    _maui.template = function() {
        var source, compiled, _sourceTemplates = {}, _compiledTemplates = {};
        return {
            list: function(type) {
                var key = undefined, keys = new Array(), map;
                if("source" === type) {
                    map = _sourceTemplates;
                } else {
                    map = _compiledTemplates;
                }
                for(key in map) {
                    keys.push(key);
                }
                return keys;
            },
            set: function(name, template) {
                _sourceTemplates[name] = template;
            },
            get: function(name) {
                if(name !== undefined) {
                    compiled = _compiledTemplates[name];
                    if (! compiled || _maui.dev_mode) {
                        source = _sourceTemplates[name];
                        compiled = _.template(source);
                        _compiledTemplates[name] = compiled;
                    }
                    return compiled;
                }

                return _.template('');
            },
            apply: function(name, data) {
                return this.get(name)(data);
            }
        };
    } ();

    /**
     * extend util function
     */
    _maui.fn = {
        removeJQueryControlCharacters: function(id) {
            return id.replace(/[.:#|]|\s+/g, "_");
        },
        menuLink: function(label, onClick) {
            return $("<a/>", {href: "#", text: label}).click(onClick);
        },

        /**
         * Standard error handler
         */
        handleError: function(e) {
            console.log(e);
            displayHTMLInModalDialog($.i18n.prop('Alert'), 'name=' + e.name
                + " message=" + e.message, 300, 200);
        },

        /**
         * Wraps a function with a call to blockUI and also an error handler.
         */
        wrapFnWithBlock: function(fn) {
            var fn1 = function() {
                var _this = this,
                    _args = arguments;

                _maui.blockUI.show({suppressMessage:true, overlayCSS:{opacity: 0}});
                setTimeout(
                    function() {
                        try {
                            fn.apply(_this, _args);
                        } catch (e) {
                            _maui.fn.handleError(e);
                        } finally {
                            _maui.blockUI.hide();
                        }
                    });
            };

            return fn1;
        },

        /**
         * Calls a function wrapped with a call to blockUI and also an error handler.
         */
        callFnWithBlock: function(fn) {
            _maui.fn.wrapFnWithBlock(fn)();
        },

        /**
         * Calls the function with the a given data key on the jQuery object with given id.
         * Records a custom step if QUnit recording is turned on.  Any additional arguments
         * after the first two are recorded and passed to the function.
         *
         * @param id: the id of the element.
         * @param fn: the data key; the value on the jQuery object should be a function.
         */
        callRecordable: function(sel, fn) {
            var el = $(sel);
            if (typeof maui.qunit === 'object') {
                var extra = '';
                for (var i = 2; i < arguments.length; i++) {
                    extra += ', ' + JSON.stringify(arguments[i]);
                }
                maui.qunit.runtime.recordCustomStep({
                    event: 'custom',
                    action: 'maui.fn.callRecordable("' + sel + '", "' + fn + '"' + extra + ');',
                    selector: sel
                });
                maui.qunit.runtime.isPlayingBack() && el.show();
            }
            if (el.data(fn) && el.length) {
                return el.data(fn).apply(null, [el[0]].concat(Array.prototype.slice.call(arguments, 2)));
            }
        }
    };

    /**
     * the object for loading resource
     */
    _maui.resource = function(){

        var _htmls = new Array();

        function _isLoadedHtml(html) {
            var i = 0;
            for(i=0; i<_htmls.length; i++) {
                if(_htmls[i] === html) {
                    return true;
                }
            }
            return false;
        }

        function _loadRequiredHtml(htmls, index, continuation) {

            if(index >= htmls.length) {
                continuation();
                return;
            }

            if(_isLoadedHtml(htmls[index])) {
                _loadRequiredHtml(htmls, index + 1, continuation);
                return;
            }

            _htmls.push(htmls[index]);

            $.get(htmls[index])
                .fail(function() {
                    console.log('Failed to load template - ' + htmls[index]);
                }).done(function(response) {
                    var template, templates,
                        i,
                        matches, regMauiTemplateEndTag, regMauiTemplateExtract;

                    // check if current template is compressed
                    // if the template start with <maui-compressed-templates>, it is compressed; else, it is uncompressed
                    if(response.indexOf('<maui-compressed-templates>') === 0) {
                        // extract the content between "<maui-template>" tag
                        regMauiTemplateEndTag = new RegExp('<\/maui-template>', 'm');
                        regMauiTemplateExtract = new RegExp('<maui-template maui-template-id="([\\\s\\\S]*?)">([\\\s\\\S]*)', 'm');

                        // split to get each template
                        templates = response.split(regMauiTemplateEndTag);

                        // traverse the template array
                        for(i=0; i<templates.length - 1; i++) {
                            template = templates[i];
                            matches = template.match(regMauiTemplateExtract);
                            if(matches.length >= 3) {
                                _maui.template.set(matches[1], matches[2]);
                            }
                        }
                    } else {
                        var paths = htmls[index].split("/");
                        templateName = paths[paths.length - 1].split(".")[0];
                        _maui.template.set(templateName, response);
                    }

                    _loadRequiredHtml(htmls, index + 1, continuation);
                });
        }

        return {
            loadHtml: _loadRequiredHtml
        };
    }();

    // blockUI
    _maui.blockUI = function() {
        // the default option for the blockUI plug-in but can be override by other tools
        var _waiting = 0,	// a count of #show calls - #hide calls
            _default_options = {
                dontBlock: false,			// if true, blockUI will be skipped
                suppressMessage: false,		// if true, the message DIV will not be displayed
                message: '<div style="position: absolute;margin-left: auto;margin-right: auto;height: 65px;width: 280px;padding-top: 35px;"><img src="resources/framework/images/loading30.gif" /> <label style="position: relative;top: -8px;left: 10px;"> Loading...</label></div>',
                css :{
                    border:	'0',
                    width: '280px',
                    height: '100px',
                    'border-bottom': '2px solid #0096d6',
                    'left':'40%',
                    padding:0,
                    margin:0
                },
                overlayCSS:{
                    opacity : 0.1
                }
            };

        return {
            show: function(options) {
                "use strict";

                var foptions = $.extend({}, _default_options, options);
                if (foptions.dontBlock) return;

                if(_waiting === 0) {

                    if(foptions.suppressMessage === true) {
                        foptions.message = null;
                    } else{
                        foptions.message = '<div style="position: absolute;margin-left: auto;margin-right: auto;height: 65px;width: 280px;padding-top: 35px;"><img src="resources/framework/images/loading30.gif" /> <label style="position: relative;top: -8px;left: 10px; display: inline-block;">'+ $.i18n.prop('waitAnimation.loadText') + '</label></div>';
                    }
                    $.blockUI(foptions);
                }
                _waiting++;
            },
            hide: function(options) {
                "use strict";

                var foptions = $.extend({}, _default_options, options);
                if (foptions.dontBlock) return;

                if(_waiting > 0) {
                    _waiting--;

                    if (_waiting === 0) {
                        $.unblockUI();
                    }
                }
            },
            forceHide: function() {
                _waiting = 0;
                $.unblockUI();
            },
            isWaiting: function() {
                return _waiting > 0;
            }
        };
    }();


    _maui.widget = {
        /**
         Creates a child widget and loads it into the given container element (targetDiv).
         widgetClass is the FQCN of the java class for the widget.
         widgetId is the id of the parent widget (already exists).
         childWidgetId is the id for the new child widget.
         params is a map of name/value parameters to set in the new child widget.
         */
        createChildWidget: function (targetDiv, widgetId, widgetClass, childWidgetId, params, blockUIParams) {
            var blockUIParams1 = $.extend({},
                {suppressMessage:true, overlayCSS:{opacity: 0.05}}, // defaults
                blockUIParams); // overrides from caller

            getServerData(
                {	method:'create_child_widget',
                    widget_id: widgetId,
                    widget_class: widgetClass,
                    child_widget_id: childWidgetId,
                    inherit_parameters: true,
                    extra_parameters: params
                },
                function(returnData) {
                    loadRequiredModules(returnData, function(){
                        targetDiv[returnData.data.pluginName]({}, returnData.data);
                    });
                },
                blockUIParams1
            );
        },

        removeChildWidget: function(widgetId, childWidgetId) {
            getServerData(
                {	method:'remove_child_widget',
                    widget_id: widgetId,
                    child_widget_id: childWidgetId
                },
                undefined,
                {suppressMessage:true, overlayCSS:{opacity: 0.05}}
            );
        },

        reloadWidget: function(targetDiv, widgetId, whenDone) {
            getServerData(
                {	method:'get_widget_data',
                    widget_id: widgetId
                },
                function(returnData) {
                    targetDiv.empty();
                    targetDiv[returnData.data.pluginName]({}, returnData.data);
                    whenDone && whenDone();
                },
                {suppressMessage:true, overlayCSS:{opacity: 0.05}}
            );
        }
    };

    // for cache notify server
    var _count = 0, _cachedRquests = new Array();
    _maui.server = {
        popCachedRequests: function(parms) {
            if(_cachedRquests.length === 0) {
                return parms;
            } else {
                var t = _cachedRquests.splice(0, _cachedRquests.length);
                if(t.length > 0) {
                    parms += "&parm=" + "attachment";
                    for(var i = 0; i < t.length; i++) {
                        parms += (parms.length > 0 ? "&" : "") + "parm=" + encodeURIComponent(t[i]);
                    }
                }
                return parms;
            }
        },
//		pushCachedRequests: function(cachedRequest) {
//			_cachedRquests.concat(cachedRequest);
//		},
        /**
         * This method can be used to make a Maui call where we are not interested in the result.
         * E.g. we just want to sync some state to the server, but don't need a response.
         *
         * @param param
         */
        notifyServer: function(param) {
            param._count = _count ++;
            _cachedRquests.push(JSON.stringify(param));
        }
    };

    window.maui = _maui;
})();

var standalone = false;
var toolsFolder;
var toolMode;

var SESSIONID = "";
var WINDOWID = "";

var engineSupportsPerfView = true;
var engineSupportsConstraintView = true;

var dialogStack = [];
//var divInFocus = undefined;

var waiting = false;

if ( ! window.console ) console = { log: function(){} };

function getDialogDivById(id) {
    for ( var i = 0; i < dialogStack.length; i++) {
        if (dialogStack[i].data('child_window') === id) {
            return dialogStack[i];
        }
    }
    return undefined;
}

//$(document).ready(function () {
//	"use strict";
//	$('#theData').focus(function(){divInFocus = $(this);console.log('theData focus divInFocus');});
//	$('#theData').mouseover(function(){divInFocus = $(this);console.log('theData mouseover divInFocus');});
//});

function getInternetExplorerVersion()
// Returns the version of Internet Explorer or a -1
// (indicating the use of another browser).
{
    var rv = -1; // Return value assumes failure.
    if (navigator.appName == 'Microsoft Internet Explorer') {
        var ua = navigator.userAgent;
        var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) != null)
            rv = parseFloat(RegExp.$1);
    }
    return rv;
}

$.fx.speeds._default = 250;

Object.size = function(obj) {
    var size = 0;
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

String.prototype.repeat = function ( num )
{
    "use strict";
    return new Array( num + 1 ).join( this );
};

function showSpinner($nextTo) {
    "use strict";
    var position = $nextTo.offset();
    $('#spinner').css({ top: position.top + 3, left: position.left + $nextTo.width() + 10 }).fadeIn(100);
}

function hideSpinner() {
    "use strict";
    $('#spinner').fadeOut(200);
}

function callPageFunction(functionName, functionParam, pages1) {
    window[functionName](functionParam, pages1);
}

function loadResourceModules(continuation, toolLanguage) {
    if(toolLanguage === undefined || toolLanguage === null ){
        toolLanguage = "en_US";
    }
    try {
        $.i18n.properties({
            name: ['message'],
            path: 'resources/framework/locale/',
            mode: 'map',
            language: toolLanguage,
            callback: continuation
        });
    } catch (e) {
        console.log(e);
        displayHTMLInModalDialog($.i18n.prop('Alert'), 'name=' + e.name
            + " message=" + e.message, 300, 200);
    }
}

function loadRequiredScriptsAndCss(scripts, css, continuation) {
    scripts || (scripts = []);
    css || (css = []);
    if (scripts.length === 0 && css.length === 0) {
        continuation();
        return;
    }
    $.xLazyLoader({
        js: scripts,
        css: css,
        success: function(){
            try {
                continuation();
            } catch (e) {
                if (typeof e === 'string') {
                    console.log(e);
                    displayHTMLInModalDialog('Exception', "message=" + e, 300, 200);
                } else {
                    console.log(e.message + "\n" + e.stack);
                    displayHTMLInModalDialog('Exception', 'name=' + e.name + " message=" + e.message, 300, 200);
                }
            }
        },
        error: function(errors) {
            alert('There were errors loading the following required resources: ' + errors);
        }
    });
}

function loadRequiredModules(modules, continuation) {
    if(modules.htmls && modules.htmls.length > 0) {
        maui.resource.loadHtml(modules.htmls, 0, function(){
            loadRequiredScriptsAndCss(modules.scripts, modules.css, continuation);
        });
    } else {
        loadRequiredScriptsAndCss(modules.scripts, modules.css, continuation);
    }
}

function checkSuccess($json) {
    var actions = $json.actions;
    var code = actions.length > 0 ? actions[actions.length-1].code: $json.code;
    if (code === "FAILURE") {
        maui.blockUI.forceHide();
        commonErrorHandling($json.failureObject.type, $json.failureObject.message,$json.failureObject.serverName,$json.failureObject.serverTimeStamp);
    }
    return code !== "FAILURE";
}

function loadScriptsAndCss(action, continuation) {
    if ((action.htmls === undefined || action.htmls.length === 0)
        && (action.css === undefined || action.css.length === 0)
        && (action.scripts === undefined || action.scripts.length === 0)) {
        continuation();
    } else {
        loadRequiredModules(
            {
                htmls: action.htmls,
                css: action.css,
                scripts: action.scripts
            },
            continuation
        );
    }
}

function callBeforeFunction(result, continuation) {
    if (result.beforeFunction && $.isFunction(window[result.beforeFunction])) {
        window[result.beforeFunction](result.beforeFunctionParameter, continuation);
    } else {
        continuation();
    }
}

function processServerResponse(result, topLevelResult) {
    var dataDiv = undefined;

    try {
        switch (result.code) {
            case "LOAD_PAGE":
                if (result.childWindowId !== undefined) {
                    dataDiv = getDialogDivById(result.childWindowId).empty();

                    if (result.dialogData.buttonData !== undefined) {
                        updateDialogButtons(dataDiv, result);
                        dataDiv.parent().find('#' + result.dialogData.default_button).focus();
                    }
                } else {
                    dataDiv = $('#theData').empty();
                }

                dataDiv[result.pluginName](result.pageData.members, result.navigation);

                if (result.childWindowId !== undefined) {
                    setDialogTitle(dataDiv, result);
                }

                break;

            case "NEW_DIALOG":
                dataDiv = showNewDialog(result, topLevelResult);
                break;

            case "CLOSE_DIALOG":
                var currentDialog = dialogStack.pop();
                // prevent dialog close event from activating
                currentDialog.data('closed', true);

                var sourceElement = currentDialog.data('source_element');
                if (sourceElement && sourceElement.is(':visible')) {
                    animateToElement(
                        sourceElement,
                        currentDialog.parent(),
                        function() {
                            currentDialog.dialog('close');
                            currentDialog.dialog('destroy').remove();
                        }
                    );
                } else {
                    currentDialog.dialog('close');
                    currentDialog.dialog('destroy').remove();
                }
                if (result.pageData === undefined) {
                    maui.blockUI.hide();
                    return;
                }
            // NOTE: drop down to update_page case

            case "UPDATE_PAGE":
                if (result.childWindowId !== undefined) {
                    dataDiv = getDialogDivById(result.childWindowId);
                } else {
                    dataDiv = $('#theData');
                }
                dataDiv[result.pluginName](result.pluginMethod === undefined ? 'update' : result.pluginMethod,
                    result.pageData.members);

                if (result.childWindowId !== undefined && result.dialogData.buttonData !== undefined) {
                    updateDialogButtons(dataDiv, result);
                    setDialogTitle(dataDiv, result);
                }
                break;

            case "NEW_WINDOW":
                window.open("MauiServlet?op=new_window&sessionId=" + SESSIONID + "&newWindowId=" + result.newWindowId);

            case "NO_ACTION":
                break;

            case "WRITE_COOKIE":
                if($.cookie) {
                    $.each(result.pageData.members.cookies, function(index, item){
                        var options = {};
                        if(item.age) {
                            options.expires = item.age;
                        }
                        if(item.domain) {
                            options.domain = item.domain;
                        }
                        if(item.path) {
                            options.path = item.path;
                        }
                        if(!item.value) {
                            item.value = '';
                            options.expires = 0;
                        }
                        $.cookie(item.name, item.value, options);
                    });
                }
                break;

            default:
                break;
        };
    } catch (e) {
        console.log('Exception - ', e.stack);
        maui.blockUI.forceHide();
        commonErrorHandling('name=' + e.name + " message=" + e.message, e.stack);
    }
}

function showNewDialog(result, topLevelResult) {
    var width = result.dialogData.window_width;
    var height = result.dialogData.window_height;
    var displayWidth = "auto";
    var displayHeight = "auto";
    var maxWidth = $(window).width();
    var maxHeight = $(window).height();

    // restrict dialog size to window's width and height
    if (width !== undefined && width > 0) {
        if( maxWidth < width ) {
            displayWidth = maxWidth;
        }
        else {
            displayWidth = width;
        }
    }
    if (height !== undefined && height > 0) {
        if( maxHeight < height ) {
            displayHeight = maxHeight;
        }
        else {
            displayHeight = height;
        }
    }

    // old code
    if (width === undefined || width <= 0) width = 1000;
    if (height === undefined || height <= 0) height = 700;

    var dialogDiv = $('<div/>').addClass('dialog_div').css("display", "none");

    if ( displayWidth === "auto" && displayHeight === "auto" ) {
        // fill dialog content before dialog is displayed in "auto" mode
        // so that the size can be calculated
        // TODO: some init() method requires dialog to be shown first -
        //	need to determine how to break this conflicting dependency
        dialogDiv[result.pluginName](result.pageData.members, result.navigation);
    }

    var options = {width: displayWidth, height: displayHeight,
        autoOpen: false,
        modal: true,
        show: {effect:'fade', duration:500},
        hide: {effect:'fade', duration:500},
        beforeClose: function() {
            if ($(this).data('closed')) return;
            serverTransaction({method:'dialog_cancel'});
            // block the closing of the dialog until the serverTransaction has been able
            // to figure out if the close should proceed or not (note: this relies on serverTransaction
            // being asynchronous)
            return false;
        },
        open: function() {$(this).parent().find('#' + result.dialogData.default_button).focus();},
        close: function () { $(this).dialog('destroy').remove(); },
        buttons: getDialogButtons(result.dialogData.buttonData, result.pluginName, dialogDiv)};

    dialogDiv
//		.mouseover(function(){divInFocus = $(this);console.log('dialogDiv mouseover divInFocus');})
//		.focus(function(){divInFocus = $(this);console.log('dialogDiv focus divInFocus');})
        .data("child_window", result.childWindowId)
        .dialog(options);

    // process min width/height
    var minWidth = result.dialogData.min_window_width;
    var minHeight = result.dialogData.min_window_height;

    if (minWidth !== undefined && minWidth > 0) {
        dialogDiv.dialog("option", "minWidth", minWidth);
    }
    if (minHeight !== undefined && minHeight > 0) {
        dialogDiv.dialog("option", "minHeight", minHeight);
    }

    setDialogTitle(dialogDiv, result);

    if (topLevelResult.sourceElement) {
        var sourceEl = $(topLevelResult.sourceElement);
        if (sourceEl.length > 0) {
            dialogDiv.data('source_element', sourceEl);
            animateFromElement(sourceEl, width, height, function() {dialogDiv.dialog('open');});
        } else {
            dialogDiv.dialog('open');
        }
    } else {
        dialogDiv.dialog('open');
    }

    if ( displayWidth !== "auto" && displayHeight !== "auto" ) {
        // fill dialog content after dialog is shown if width/height are given
        dialogDiv[result.pluginName](result.pageData.members, result.navigation);
    }
    else {
        try {
            // invoke callback after dialog is opened, ignore error for now
            dialogDiv[result.pluginName]('dialog_open', result.pageData.members);
        }
        catch(e) {}
    }

//	divInFocus = dialogDiv;

    dialogStack.push(dialogDiv);
    return dialogDiv;
}

function callServer(options) {
    "use strict";

    var optionsParam = {
        success: function(data){
            var result = data;
            if (result === undefined) return;
            if (result.sessionId !== undefined) SESSIONID = result.sessionId;
            if (result.windowId !== undefined) WINDOWID = result.windowId;
            if (result.dev_mode !== undefined) maui.dev_mode = result.dev_mode;

            try {
                processActions(result, 0, maui.blockUI.hide);
            } catch (e) {
                maui.blockUI.forceHide();
            }

            // reset the session timeout reminder
            resetSessionTimeoutReminder();

            if ((options) && (options.success)){
                options.success();
            }
        },
        complete: function(){
            if ((options) && (options.complete)){
                options.complete();
            }
        },
        sync: options && options.sync
    };

    var inputParams = Array.prototype.slice.call(arguments);
    inputParams.shift();

    var blockUIOptions = (options && options.blockUIOptions) ? options.blockUIOptions : undefined;

    maui.blockUI.show(blockUIOptions);
    var params = (inputParams.length > 0) ? [optionsParam].concat(inputParams) : [optionsParam];
    asyncCallGetJsonFn.apply(null, params);
}

function processActions(result, i, whenDone) {
    if (i >= result.actions.length) {
        whenDone && whenDone();
        return;
    }
    processAction(result.actions[i], result, function() {
        processActions(result, i + 1, whenDone);
    });
}

function processAction(action, result, continuation) {
    loadScriptsAndCss(action,
        function() { callBeforeFunction(action,
            function() { processServerResponse(action, result);
                if (continuation) continuation(); } ); });
}

function getDialogButtons(buttons, pageName, dialogDiv) {
    var dialogButtons = [];
    if (buttons !== undefined) {
        for ( var i = 0; i < buttons.length; i++) {
            var button = buttons[i];
            dialogButtons.push({ id:button.id,
                text: getButtonLabel(dialogDiv, pageName, button),
                disabled:!button.enabled,

                click:function(event) {
                    if (button.clickHandler) {
                        dialogDiv[pageName](button.clickHandler, dialogDiv);
                    } else {
                        serverTransaction({method: 'dialog_button_click', id: $(event.target).closest('button').attr('id')});
                    }
                }
            });
        }
    }
    return dialogButtons;
}

function getButtonLabel(dialogDiv, pageName, button) {
    try {
        return dialogDiv[pageName]('get_button_label', button);
    } catch (e) {
        return button.label;
    }
}

function updateDialogButtons(dialogDiv, result) {
    var buttons = getDialogButtons(result.dialogData.buttonData, result.pluginName, dialogDiv);
    dialogDiv.dialog("option", "buttons", buttons);
}

function setDialogTitle(dialogDiv, result) {
    var title = result.dialogData.title;
    try {
        title = dialogDiv[result.pluginName]('get_dialog_title', result.dialogData);
    } catch (e) {}

    dialogDiv.dialog('option', 'title', title);
}

function getServerData(param, continuation, blockUIOptions) {
    if (continuation === undefined) {
        return extractDataFromResponse(callGetJsonFn("json_method", JSON.stringify(param)));
    } else {
        var optionsParam = {
            success: function(data){
                var result = data;
                if (result === undefined) return;
                if (result.sessionId !== undefined) SESSIONID = result.sessionId;
                if (result.windowId !== undefined) WINDOWID = result.windowId;
                if (result.dev_mode !== undefined) maui.dev_mode = result.dev_mode;

                var resValue = extractDataFromResponse(result);

                if(undefined !== resValue){
                    continuation(resValue);
                }

                // reset the session timeout reminder
                resetSessionTimeoutReminder();
            },
            complete: function(){
                maui.blockUI.hide(blockUIOptions);
            }
        };
        var inputParams = JSON.stringify(param);
        maui.blockUI.show(blockUIOptions);
        var params = (inputParams.length > 0) ? [optionsParam].concat('json_method').concat(inputParams) : [optionsParam].concat('json_method');
        asyncCallGetJsonFn.apply(null, params);
    }
}

function extractDataFromResponse(resp) {
    if (! resp.actions || resp.actions.length === 0 || ! resp.actions[0].pageData || ! resp.actions[0].pageData.members) {
        maui.blockUI.forceHide();
        displayHTMLInModalDialog($.i18n.prop('Alert'),
            'Unabled to extract data from getServerData call, even though the code returned was not FAILURE', 350, 300);
        return undefined;
    } else {
        return resp.actions[0].pageData.members;
    }
}

function closeSession(param) {
    callServer({sync:true},"close_session", JSON.stringify(param));
}

function resumeSession(param) {
    callServer(null, "resume_session", JSON.stringify(param));
}

function serverTransaction(param, options) {
    callServer(options, "json_method", JSON.stringify(param));
}

function callGetJsonFn() {
    "use strict";
    var parms = "", ret;

    parms += "op=json_method";
    parms += "&sessionId=" + SESSIONID;
    parms += "&windowId=" + WINDOWID;
    for (var i = 0; i < arguments.length; i += 1) {
        parms += (parms.length > 0 ? "&" : "") + "parm=" + encodeURIComponent(arguments[i]);
    }

    parms = maui.server.popCachedRequests(parms);

    $.ajax({
        type: "POST",
        url: "MauiServlet",
        async: false,
        data: parms,
        success: function(data){
            if (checkSuccess(data)) {
                ret = data;
            } else {
                ret = undefined;
            }

            // reset the session timeout reminder
            resetSessionTimeoutReminder();
        },
        error: function(jqXHR, textStatus, errorThrown){
            var generalMessage = 'Error: HTTP error (response code is ' + jqXHR.status + ', and error type is ' + textStatus + ')';

            var responseText = $(jqXHR.responseText);
            var detailMessage = !!responseText[11] ? $(responseText[11]).html() : jqXHR.responseText;		//just for Jetty (or current Jetty setting?)

            commonErrorHandling(generalMessage, detailMessage);
        },
        dataType: "json"
    });
    return ret;
}

function asyncCallGetJsonFn(options) {
    "use strict";
    var parms = "";

    parms += "op=json_method";
    parms += "&sessionId=" + SESSIONID;
    parms += "&windowId=" + WINDOWID;
    for (var i = 1; i < arguments.length; i += 1) {
        parms += (parms.length > 0 ? "&" : "") + "parm=" + encodeURIComponent(arguments[i]);
    }

    // get cached request
    parms = maui.server.popCachedRequests(parms);

    $.ajax({
        type: "POST",
        url: "MauiServlet",
        async: !(options && options.sync),
        data: parms,
        success: function(data){
            var ret = checkSuccess(data) ? data : undefined;
            if ((options) && (options.success)){
                options.success(ret);
            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            var generalMessage = 'Error: HTTP error (response code is ' + jqXHR.status + ', and error type is ' + textStatus + ')';

            var responseText = $(jqXHR.responseText);
            var detailMessage = !!responseText[11] ? $(responseText[11]).html() : jqXHR.responseText;		//just for Jetty (or current Jetty setting?)

            commonErrorHandling(generalMessage, detailMessage);
        },
        complete: function(){
            if ((options) && (options.complete)){
                options.complete();
            }
        },
        dataType: "json"
    });
}

/**
 * Method to download a file from the server, using the jquery.fileDownload plugin.
 * See http://johnculviner.com/category/jQuery-File-Download.aspx
 */
function downloadFileFromServer(params) {
    loadScriptsAndCss({scripts:['resources/framework/lib/jquery.fileDownload/jquery.fileDownload.min.js'], css:[]},
        function() {
            var parms = "sessionId=" + SESSIONID + "&windowId=" + WINDOWID
                + "&op=json_method&parm=json_method&parm="
                + JSON.stringify(params);
            parms = maui.server.popCachedRequests(parms);

            $.fileDownload('MauiServlet', {
                httpMethod: "GET", // use GET since Android does not support file downloads with POST
                data: parms,
                successCallback: function(url) {
                    // reset the session timeout reminder
                    resetSessionTimeoutReminder();
                },
                failCallback: function (responseHtml, url) {
                    // remove all the HTML tags
                    var $json = responseHtml.replace(/<\/?[^>]*>/gi, '');
                    // check response
                    checkSuccess(JSON.parse($json));
                }
            });
        }
    );
}

/**
 * Method to upload a file to the server, using the jquery.form plugin.
 */
function uploadFileToServer(that, params) {
    loadScriptsAndCss({scripts:['resources/framework/lib/jquery.form/jquery.form.min.js'], css:[]},
        function() {
            var parent = that.parent();
            var form;
            if(parent.attr('enctype') !== 'multipart/form-data') {
                var time = new Date().getTime();
                form = $('<form id="' + time + '" name="' + time + '" method="post" enctype="multipart/form-data" onsubmit="javascript: return false;" />').appendTo(parent);
                that.appendTo(form);
            } else {
                form = parent;
            }

            //
            var url = 'MauiServlet?op=json_method&sessionId=' + SESSIONID + '&windowId=' + WINDOWID + '&parm=json_method&parm=' + JSON.stringify(params) + '&parm=upload';
            url = maui.server.popCachedRequests(url)

            form.ajaxSubmit({
                dataType: 'json',
                url: url,
                type:'POST',
                clearForm:false, // clear all form fields after successful submit
                resetForm:false, // reset the form after successful submit
                beforeSubmit: function() {
                    maui.blockUI.show();
                },
                success: function(data) {
                    if (checkSuccess(data))	{
                        that.val("");
                        processActions(data, 0, maui.blockUI.hide);
                    }
                    // reset the session timeout reminder
                    resetSessionTimeoutReminder();
                },
                error: function(request, errordata, errorObject) {
                    maui.blockUI.forceHide();
                    that.val("");
                    displayHTMLInModalDialog($.i18n.prop('Alert'), 'Error: ' + request.status + ' ' + $.i18n.prop(request.statusText), 300, 200);
                }
            });
        }
    );
}

function statusDisplayString(status) {
    var code;
    if (status === undefined) {
        return status;
    } else if (status.indexOf("CONFIGURATION_STATUS_") == 0) {
        code = status.substring("CONFIGURATION_STATUS_".length);
    } else {
        code = status;
    }
    return "<SPAN class='" + code + "'>" + code + "</SPAN>";
}

function insertBreaks(str) {
    if (str.length < 50) return str;
    var chunks = str.match(/.{1,50}/g);
    return chunks.join('<BR/>');
}

function buildLink(text, p1, p2, p3, p4, p5, p6) {
    return "<A href='#' " + buildEventCallWithReturnFalse("onclick", p1, p2, p3, p4, p5, p6) + ">" + text + "</A>";
}

function buildLinkWithClass(theClass, text, p1, p2, p3, p4, p5, p6) {
    return "<A class='" + theClass + "' href='#' " + buildEventCallWithReturnFalse("onclick", p1, p2, p3, p4, p5, p6) + ">" + text + "</A>";
}

function buildLinkWithIdAndClass(theId, theClass, text, p1, p2, p3, p4, p5, p6) {
    return "<A id='" + theId + "' class='" + theClass + "' href='#' " + buildEventCallWithReturnFalse("onclick", p1, p2, p3, p4, p5, p6) + ">" + text + "</A>";
}

/*
 * Returns an new XMLHttpRequest object, or false if the browser doesn't support
 * it
 */
function newXMLHttpRequest() {
    "use strict";

    var xmlreq = false;

    // Create XMLHttpRequest object in non-Microsoft browsers
    if (window.XMLHttpRequest) {
        xmlreq = new XMLHttpRequest();

    } else if (window.ActiveXObject) {

        try {
            // Try to create XMLHttpRequest in later versions
            // of Internet Explorer

            xmlreq = new ActiveXObject("Msxml2.XMLHTTP");

        } catch (e1) {

            // Failed to create required ActiveXObject

            try {
                // Try version supported by older versions
                // of Internet Explorer

                xmlreq = new ActiveXObject("Microsoft.XMLHTTP");

            } catch (e2) {

                // Unable to create an XMLHttpRequest by any means
                xmlreq = false;
            }
        }
    }

    return xmlreq;
}

// the onLoad method in the main page used to initialize tool  
function initializeTool(initJson) {
    "use strict";
    standalone = initJson.standalone;
    toolsFolder = initJson.toolsFolder;
    toolMode=initJson.toolMode;

    maui.tool.name = initJson.toolName;

    if (initJson.initial_css === undefined || initJson.initial_css === null) {
        initJson.initial_css = [];
    }
    if (initJson.initial_js === undefined || initJson.initial_js === null) {
        initJson.initial_js = [];
    }

    // define the call back function
    var continuation = function() {
        // load localization resource
        loadResourceModules(function(){
            try {
                // execute the initializationMethod
                if (initJson.initializationMethod !== undefined
                    && initJson.initializationMethod !== null) {
                    window[initJson.initializationMethod](initJson);
                }

                // trigger the doPost request
                if (initJson.op === 'new_session') {
                    callServer(null, initJson.op, initJson.toolName, JSON.stringify(initJson.parameters));
                } else if (initJson.op === 'new_window') {
                    SESSIONID = initJson.sessionId;
                    WINDOWID = initJson.newWindowId;
                    callServer(null, initJson.op, initJson.sessionId, initJson.newWindowId);
                }
            } catch (e) {
                console.log(e);
                displayHTMLInModalDialog($.i18n.prop('Alert'), 'name=' + e.name
                    + " message=" + e.message, 300, 200);
            }
        }, initJson.toolLanguage);
    };

    if (initJson.initial_css.length > 0 || initJson.initial_js.length > 0) {
        loadRequiredModules(
            {
                htmls: initJson.initial_html,
                css: initJson.initial_css,
                scripts: initJson.initial_js
            },
            continuation
        );
    } else {
        continuation();
    }

    if(initJson.debugtool !== undefined && initJson.debugtool === true){
        waitUntilReady(
            function() {
                serverTransaction({method:'load_debug_utility'});
            }
        );
    }

}
function waitUntilReady(continuation) {
    if (maui.blockUI.isWaiting()) {
        setTimeout(function() {waitUntilReady(continuation);}, 200);
    } else {
        continuation();
    }
}

function goToPage(index) {
    "use strict";
    serverTransaction({method:"go_to_page", pageIndex:index});
}

function back() {
    "use strict";
    serverTransaction({method:"navigate_back"});
}


function buildEventCall() {
    "use strict";
    var res = arguments[0] + "=\"" + arguments[1] + "(";
    for (var j=2; j < arguments.length; j += 1) {
        if (j > 2) {
            res += ",";
        }
        if (arguments[j] === undefined) {
            res += "undefined";
        } else {
            res += "'" + arguments[j] + "'";
        }
    }
    res += ");\"";
    return res;
}

function buildEventCallWithReturnFalse() {
    "use strict";
    if (arguments.length < 2) return "\"return false;\"";
    var res = arguments[0] + "=\"" + arguments[1] + "(";
    for (var j=2; j < arguments.length; j += 1) {
        if (j > 2) {
            res += ",";
        }
        if (arguments[j] === undefined) {
            res += "undefined";
        } else {
            res += "'" + arguments[j] + "'";
        }
    }
    res += "); return false; \"";
    return res;
}

function resetSessionTimeoutReminder() {
    var data = $('#theData');
    if(data.session_management) {
        data.session_management('reset');
    }
}


