jQuery.noConflict();
(function(PLUGIN_ID) {

    "use strict";

    // 在记录保存前，对电话、传真、邮编、电子邮件的输入值进行检查
    function checkValue(event) {
        //设定值的变量
        var config = kintone.plugin.app.getConfig(PLUGIN_ID);

        //取出设定值并赋值
        if (!config) {
            return false;
        }
        var record = event.record;
        var zip_value = record[config["zip"]]["value"];
        var tel_value = record[config["tel"]]["value"];
        var fax_value = record[config["fax"]]["value"];
        var mail_value = record[config["mail"]]["value"];

        // 邮编的定义(6位的半角数字)
        var zip_pattern = /^\d{6}$/;
        // 电话, 传真的定义(8位的半角数字)
        var telfax_pattern = /^\d{8}$/;
        // 电子邮件的定义 (简单的定义。想要更详细的定义的话，请改变下面的值)
        var mail_pattern = /^([a-zA-Z0-9])+([a-zA-Z0-9\._-])*@([a-zA-Z0-9_-])+([a-zA-Z0-9\._-]+)+$/;

        // 如果有邮编输入的话，检查输入值。
        if (zip_value !== undefined) {
            if (zip_value.length > 0) {
                // 确认是否符合定义的模式
                if (!(zip_value.match(zip_pattern))) {
                    // 不符合的话，在邮编字段里显示错误内容。
                    record['Zipcode']['error'] = '请输入6位的半角数字';
                }
            }
        }

        // 如果有电话号码输入的话，检查输入值。
        if (tel_value !== undefined) {
            if (tel_value.length > 0) {
                // 确认是否符合定义的模式
                if (!(tel_value.match(telfax_pattern))) {
                    // 不符合的话，在电话号码字段里显示错误
                    record['TEL']['error'] = '请输入8位的半角数字';
                }
            }
        }

        // 如果有传真号码输入的话，检查输入值。
        if (fax_value !== undefined) {
            if (fax_value.length > 0) {
                // 确认是否符合定义的模式
                if (!(fax_value.match(telfax_pattern))) {
                    // 不符合的话，在传真号码字段里显示错误
                    record['FAX']['error'] = '请输入8位的半角数字';
                }
            }
        }

        // 如果有电子邮件输入的话，检查输入值
        if (mail_value !== undefined) {
            if (mail_value.length > 0) {
                // 确认是否符合定义的模式
                if (!(mail_value.match(mail_pattern))) {
                    // 不符合的话，在电子邮件字段里显示错误
                    record['Mail']['error'] = '无法识别该电子邮件。请确认一下输入的值。';
                }
            }
        }

        // return event。
        // 当有错误的时候，取消保存，在详细页面里显示错误信息。
        // 当没有错误的时候，执行保存动作。
        return event;
    }

    // 添加・更新事件(添加记录、编辑记录、列表上编辑记录)
    kintone.events.on(['app.record.create.submit',
                       'app.record.edit.submit',
                       'app.record.index.edit.submit'], checkValue);

})(kintone.$PLUGIN_ID, kintone.$PLUGIN_ID);
