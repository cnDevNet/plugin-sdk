(function(PLUGIN_ID) {
    "use strict";

    var CONF = kintone.plugin.app.getConfig(PLUGIN_ID);
		//读取设置值
    if (!CONF) {
        return false;
    }
    var evselect1 = CONF.select1;
    var evselect2 = CONF.select2;
    var evselect3 = CONF.select3;
    var evselect4 = CONF.select4;
    var evselect5 = CONF.select5;
    var lineNumber = CONF.line_number;

	//列表/编辑/添加页面
    var events1 = ["app.record.edit.show",
                   "app.record.create.show",
                   "app.record.index.edit.show"
                  ];

    function checkTexValue(tex) {
        var tex_changes = "";
        //选择用户、选择组织、选择组仅获取name
        switch (tex['type']) {
            case "USER_SELECT":
            case "ORGANIZATION_SELECT":
            case "GROUP_SELECT":
                if (tex.value.length !== 0) {
                    tex_changes = tex['value'][0]['name'];
                }
                break;

            //日期与时间仅使用日期部分
            case "DATETIME":
                if (tex.value !== undefined) {
                    tex_changes = (tex['value']).substr(0, 10);
                }
                break;

            //有多个值时仅使用数组0
            case "CHECK_BOX":
            case "MULTI_SELECT":
                tex_changes = tex['value'][0];
                break;

            //其他的所有字段
            default :
                tex_changes = tex['value'];
                break;
        }
        return tex_changes;
    }

    //查找空字段
    function fieldValues(record) {
        var fieldarray = [];
        for (var j = 1; j <= lineNumber; j++) {
            var tex = record[String(CONF["select" + j])];
            if (tex !== undefined) {
                fieldarray.push(checkTexValue(tex));
            } else {
                fieldarray.push("");
            }
        }
        return fieldarray;
    }

    //结合后的字段设为不可输入
    kintone.events.on(events1, function(event) {
        var record1 = event['record'];
        record1[String(CONF.copyfield)]['disabled'] = true;
        return event;
    });



	//值有变更时，在保持前反映到结合字段中
    var valevents = ['app.record.edit.change.' + evselect1,
                     'app.record.edit.change.' + evselect2,
                     'app.record.edit.change.' + evselect3,
                     'app.record.edit.change.' + evselect4,
                     'app.record.edit.change.' + evselect5,
                     'app.record.edit.submit',

                     'app.record.create.change.' + evselect1,
                     'app.record.create.change.' + evselect2,
                     'app.record.create.change.' + evselect3,
                     'app.record.create.change.' + evselect4,
                     'app.record.create.change.' + evselect5,
                     'app.record.create.submit',

                     'app.record.index.edit.change.' + evselect1,
                     'app.record.index.edit.change.' + evselect2,
                     'app.record.index.edit.change.' + evselect3,
                     'app.record.index.edit.change.' + evselect4,
                     'app.record.index.edit.change.' + evselect5,
                     'app.record.index.edit.submit'
                    ];

    //保持前事件
    var submitEvent = ["app.record.edit.submit",
                       "app.record.create.submit",
                       "app.record.index.edit.submit"];

    kintone.events.on(valevents, function connect_texts(event) {

        var record = event.record;
        // 将config中设置的值带入cdselect
        var cdcopyfield = CONF.copyfield;
        var cdbetween = CONF.between;
        if (cdbetween === "&nbsp;") {
            cdbetween = "\u0020";
        } else if (cdbetween === "&emsp;") {
            cdbetween = "\u3000";
        }
        var jointext = fieldValues(record);
        record[String(cdcopyfield)]['value'] = String(jointext.join(cdbetween));
        return event;
    });


    //按下保持按钮时，确认是否为空字段
    kintone.events.on(submitEvent, function(event) {
      if (!CONF) {
          return false;
      }
        var record = event.record;
        var jointext = fieldValues(record);
        for (var i = 0; i < jointext.length; i++) {
            if (!jointext[i]) {
                var res = confirm("要结合的字段中有字段为空。是否要保存？");
                if (res === false) {
                    event.error = "已取消";
                    return event;
                }
                break;
            }
        }
        return event;
    });
})(kintone.$PLUGIN_ID);
