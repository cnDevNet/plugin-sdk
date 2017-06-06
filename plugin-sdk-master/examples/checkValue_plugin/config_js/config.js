jQuery.noConflict();
(function($, PLUGIN_ID) {
    "use strict";

    // 设置插件ID


    var conf = kintone.plugin.app.getConfig(PLUGIN_ID);

    //已经有设定值的情况下，就显示字段的值


    if (conf) {
        $('#post_code').val(conf['zip']);
        $('#phone_code').val(conf['tel']);
        $('#fax_code').val(conf['fax']);
        $('#mail_code').val(conf['mail']);
    }

    //点击 “保存” 按钮的时候，设置输入信息


    $('#submit').click(function() {
        var config = [];
        var post = $('#post_code').val();
        var phone = $('#phone_code').val();
        var fax = $('#fax_code').val();
        var mail = $('#mail_code').val();

        if (post == "" || phone == "" || fax == "" || mail == "") {
            alert("必填项没有填");
            return;
        }
        config['zip'] = post;
        config['tel'] = phone;
        config['fax'] = fax;
        config['mail'] = mail;

        kintone.plugin.app.setConfig(config);
    });

    //点击 “取消” 按钮的时候的处理


    $('#cancel').click(function() {
        history.back();
    });
})(jQuery, kintone.$PLUGIN_ID);

