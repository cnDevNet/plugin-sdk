jQuery.noConflict();
(function($, PLUGIN_ID) {
    "use strict";

	// 插件ID的设置
    var conf = kintone.plugin.app.getConfig(PLUGIN_ID);

	//如果已经有设定好的值，就把值设置给字段
    if (typeof (conf['name']) !== 'undefined') {
        $('#status1').val(conf['status1']);
        $('#color1').val(conf['color1']);
        $('#status2').val(conf['status2']);
        $('#color2').val(conf['color2']);
        $('#status3').val(conf['status3']);
        $('#color3').val(conf['color3']);
        $('#status4').val(conf['status4']);
        $('#color4').val(conf['color4']);
        $('#status5').val(conf['status5']);
        $('#color5').val(conf['color5']);
    }
	// 获取应用的表单信息
    kintone.api('/k/v1/preview/form', 'GET', {
        app: kintone.app.getId()
    }, function(resp) {
        var singleLineText = [];
        var sDatetime = [];
        var eDatetime = [];

        for (var i = 0; i < resp.properties.length; i++) {
            var confFlg = false;
            if (resp.properties[i].type === 'SINGLE_LINE_TEXT') {
                singleLineText[i] = {
                    'label': resp.properties[i].label,
                    'key': resp.properties[i].code,
                    'index': String(i)
                };
                if (typeof (conf['name']) !== 'undefined' && resp.properties[i].code === conf['name']) {
                    confFlg = true;
                }
                if (confFlg) {
                    $('#name_code').prepend('<option name=' + i + ' selected>' + singleLineText[i].label + '</option>');
                } else {
                    $('#name_code').append('<option name=' + i + '>' + singleLineText[i].label + '</option>');
                }
            } else if (resp.properties[i].type === 'DATETIME') {
                sDatetime[i] = {
                    'label': resp.properties[i].label,
                    'key': resp.properties[i].code,
                    'index': String(i)
                };
                eDatetime[i] = {
                    'label': resp.properties[i].label,
                    'key': resp.properties[i].code,
                    'index': String(i)
                };
                if (typeof (conf['name']) !== 'undefined' && resp.properties[i].code === conf['start_datetime']) {
                    $('#start_datetime_code').prepend('<option name=' + i + ' selected>' +
                        sDatetime[i].label + '</option>');
                    $('#end_datetime_code').append('<option name=' + i + '>' + eDatetime[i].label + '</option>');
                } else if (typeof (conf['name']) !== 'undefined' && resp.properties[i].code === conf['end_datetime']) {
                    $('#start_datetime_code').append('<option name=' + i + '>' + sDatetime[i].label + '</option>');
                    $('#end_datetime_code').prepend('<option name=' + i + ' selected>' +
                        eDatetime[i].label + '</option>');
                } else {
                    $('#start_datetime_code').append('<option name=' + i + '>' + sDatetime[i].label + '</option>');
                    $('#end_datetime_code').append('<option name=' + i + '>' + eDatetime[i].label + '</option>');
                }

            }
        }


		//按下“保存”按钮时设置输入信息
        $('#submit').click(function() {
            var config = [];
            var name;
            var start_datetime;
            var end_datetime;
            singleLineText.filter(function(item) {
                if (item.label === $('#name_code :selected').text() &&
                    item.index === $('#name_code :selected').attr("name")) {
                    name = item.key;
                    return true;
                }
            });
            sDatetime.filter(function(item) {
                if (item.label === $('#start_datetime_code :selected').text() &&
                    item.index === $('#start_datetime_code :selected').attr("name")) {
                    start_datetime = item.key;
                    return true;
                }
            });
            eDatetime.filter(function(item) {
                if (item.label === $('#end_datetime_code :selected').text() &&
                    item.index === $('#end_datetime_code :selected').attr("name")) {
                    end_datetime = item.key;
                    return true;
                }
            });
            var status1 = $('#status1').val();
            var color1 = $('#color1').val();
            var status2 = $('#status2').val();
            var color2 = $('#color2').val();
            var status3 = $('#status3').val();
            var color3 = $('#color3').val();
            var status4 = $('#status4').val();
            var color4 = $('#color4').val();
            var status5 = $('#status5').val();
            var color5 = $('#color5').val();

            if (name === "" || start_datetime === "" || end_datetime === "") {
                alert("有必填项目没有输入。");
                return;
            }
            config['name'] = name;
            config['start_datetime'] = start_datetime;
            config['end_datetime'] = end_datetime;
            config['status1'] = status1;
            config['color1'] = color1;
            config['status2'] = status2;
            config['color2'] = color2;
            config['status3'] = status3;
            config['color3'] = color3;
            config['status4'] = status4;
            config['color4'] = color4;
            config['status5'] = status5;
            config['color5'] = color5;

			// 添加自定义列表
            var VIEW_NAME = '日程安排';
            kintone.api(kintone.api.url('/k/v1/preview/app/views', true), 'GET', {
                'app': kintone.app.getId()
            }).then(function(scheResp) {
                var req = $.extend(true, {}, scheResp);
                req.app = kintone.app.getId();

                // 做成的自定义列表是否存在
                var existFlg = false;
                for (var k in req.views) {
                    if (req.views[k].id === conf['viewId']) {
                        existFlg = true;
                        break;
                    }
                }

				// 如果自定义列表不存在，就追加
                if (!existFlg) {

					// 在最上面的列表（默认列表）中做成“日程安排”
                    for (var key in req.views) {
                        if (req.views.hasOwnProperty(key)) {
                            req.views[key].index = Number(req.views[key].index) + 1;
                        }
                    }

                    req.views[VIEW_NAME] = {
                        "type": "CUSTOM",
                        "name": VIEW_NAME,
                        "html": "<div id='calendar'></div>",
                        "filterCond": "",
                        "pager": true,
                        "index": 0
                    };

                    kintone.api(kintone.api.url('/k/v1/preview/app/views', true), 'PUT', req).then(function(putResp) {
                        // 保存做成的列表ID
                        var viewId = putResp.views[VIEW_NAME].id;
                        config['viewId'] = viewId;
                        kintone.plugin.app.setConfig(config);
                    });

                } else {
                    config['viewId'] = conf['viewId'];
                    kintone.plugin.app.setConfig(config);
                }

            });
        });

		//按下“取消”按钮时的处理
        $('#cancel').click(function() {
            history.back();
        });


    });

})(jQuery, kintone.$PLUGIN_ID);
