/**
 * Created by wangsen on 3/29/2015.
 */

/** Message about user **/
//error
var msg_user_miss='please login in if you can';
var msg_adminuser_miss='please login in under admin role if you can';
var msg_user_nofind='please input correct account if you can';


/** Message about dy **/
var msg_dy_date_miss='please choose show date';
var msg_dy_show_success=function msg_dy_show_success(direct,content){
    return 'now show the '+ direct +' '+content;
}


/** Message about article **/
var msg_article_finsh_task='gooD,Good,gOod';
var msg_article_addcomment='add comment successfully';
//var msg_article_addaudio_success='upload audio successfully';
var msg_article_warn_addaudio='please upload audio format mp3/wav';
//error
var msg_article_showdetail_nofind='no find match article in db';
var msg_article_storepic_failed ='store picture failed';
var msg_article_task_timeout='sorry,too late!!!. Fighting';
var msg_article_task_miss='task article is missing, please call 110';

/** Message about vocabulary **/
// successful
//var msg_word_showall_success="display all vocabulary";
var msg_wrod_add_success='add vocabulary successfully';
var msg_word_addphrase_success= function msg_word_addphrase_success(item,type){
    if(type == 'new') {
        return 'add new '+ item +' successfully';
    } else if(type == 'exist') {
        return 'add exist ' + item + ' successfully';
    }
};
// error
var msg_word_addphrase_nomatch_vocabulary='no find match vocabulary in db';
var msg_word_err_input =  function msg_word_err_input(item) {
    return 'please input enough content about '+item;
}




/*****
 *
 * Export Module
 */

/** Message about user **/
//error
exports.msg_user_warn_login = msg_user_miss;
exports.msg_adminuser_miss = msg_adminuser_miss;
exports.msg_user_nofind = msg_user_nofind;


/** Message about dy **/
exports.msg_dy_show_success = msg_dy_show_success;
//error
exports.msg_dy_date_miss = msg_dy_date_miss;

/** Message about article **/
exports.msg_article_finsh_task = msg_article_finsh_task;
exports.msg_article_addcomment = msg_article_addcomment;
//exports.msg_article_addaudio_success = msg_article_addaudio_success;
exports.msg_article_warn_addaudio = msg_article_warn_addaudio;
//error
exports.msg_article_showdetail_nofind = msg_article_showdetail_nofind;
exports.msg_article_storepic_failed = msg_article_storepic_failed;
exports.msg_article_task_timeout = msg_article_task_timeout;
exports.msg_article_task_miss = msg_article_task_miss;

/** Message about vocabulary **/
// successful
exports.msg_wrod_add_success = msg_wrod_add_success;
exports.msg_word_addphrase_success = msg_word_addphrase_success;
// error
exports.msg_word_err_data = msg_word_addphrase_nomatch_vocabulary;
exports.msg_word_err_input = msg_word_err_input;
