jQuery.noConflict();

(function($, PLUGIN_ID) {
    "use strict";

    // 设置密钥
    var KEY = PLUGIN_ID;

    //读入设置值的变量
    var config = kintone.plugin.app.getConfig(KEY);

    //data
    var conditionField_text = [];
    var conditionType_text = [];
    var conditionValue_text = [];
    var targetField_text = [];
    var targetColor_text = [];
    var targetSize_text = [];
    var targetBColor_text = [];

    var conditionField_date = [];
    var conditionType_date = [];
    var conditionValue_date = [];
    var targetField_date = [];
    var targetColor_date = [];
    var targetSize_date = [];
    var targetBColor_date = [];

    var body_text = JSON.parse(config['body_text']);
    var body_date = JSON.parse(config['body_date']);

    function comparison_data(field, value, type) {
        switch (type) {
            case '==':
                if (field === value) {
                    return true;
                }
                break;
            case '!=':
                if (field !== value) {
                    return true;
                }
                break;
            case '<=':
                if (isNaN(field) === false && isNaN(value) === false) {
                    if (parseInt(field, 10) <= parseInt(value, 10)) {
                        return true;
                    }
                }
                break;
            case '>=':
                if (isNaN(field) === false && isNaN(value) === false) {
                    if (parseInt(field, 10) >= parseInt(value, 10)) {
                        return true;
                    }
                }
                break;
            default:
                return false;
        }
        return false;
    }

    function comparison_date(field, value, type) {
        var date = new Date(field);
        var now = new Date();
        var today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
        switch (type) {
            //○天后
            case '+':
                date.setDate(date.getDate() + Number(value));
                if (date <= today) {
                    return true;
                }
                break;
            //○天前
            case '-':
                date.setDate(date.getDate() - Number(value));
                if (date <= today) {
                    return true;
                }
                break;
            default:
                return true;
        }
        return false;
    }

    function changeStyle(el, color, size) {
        if (el) {
            if (color) {
                el.style.color = color;
            }
            if (size) {
                el.style.fontSize = size;
            }
        }
    }

    function changeBackgroundStyle(el, color) {
        if (el) {
            if (color) {
                el.style.backgroundColor = color;
            }
        }
    }

    //读入设置值
    if (!config) {
        return false;
    }
    for (var i = 1; i < 6; i++) {
        if (body_text['conditionformat-plugin-cfield_text_' + i]['value'] !== "") {
            conditionField_text.push(body_text['conditionformat-plugin-cfield_text_' + i]['value']);
            conditionType_text.push(body_text['conditionformat-plugin-ctype_text_' + i]['value']);
            conditionValue_text.push(body_text['conditionformat-plugin-cvalue_text_' + i]['value']);
            targetField_text.push(body_text['conditionformat-plugin-tfield_text_' + i]['value']);
            targetColor_text.push(body_text['conditionformat-plugin-tcolor_text_' + i]['value']);
            targetSize_text.push(body_text['conditionformat-plugin-tsize_text_' + i]['value']);
            targetBColor_text.push(body_text['conditionformat-plugin-bcolor_text_' + i]['value']);
        }
        if (body_date['conditionformat-plugin-cfield_date_' + i]['value'] !== "") {
            conditionField_date.push(body_date['conditionformat-plugin-cfield_date_' + i]['value']);
            conditionType_date.push(body_date['conditionformat-plugin-ctype_date_' + i]['value']);
            conditionValue_date.push(body_date['conditionformat-plugin-cvalue_date_' + i]['value']);
            targetField_date.push(body_date['conditionformat-plugin-tfield_date_' + i]['value']);
            targetColor_date.push(body_date['conditionformat-plugin-tcolor_date_' + i]['value']);
            targetSize_date.push(body_date['conditionformat-plugin-tsize_date_' + i]['value']);
            targetBColor_date.push(body_date['conditionformat-plugin-bcolor_date_' + i]['value']);
        }
    }

    //detail event
    var detailEvents = [
        'app.record.detail.show'
    ];
    kintone.events.on(detailEvents, function(event) {
        var record = event.record;
        for (var i = 0; i < conditionField_text.length; i++) {
            if (comparison_data(record[conditionField_text[i]]['value'], conditionValue_text[i], conditionType_text[i])) {
                var el = kintone.app.record.getFieldElement(targetField_text[i]);
                changeStyle(el, targetColor_text[i], targetSize_text[i]);
            }
        }

        for (var i = 0; i < conditionField_date.length; i++) {
            if (comparison_date(record[conditionField_date[i]]['value'], conditionValue_date[i], conditionType_date[i])) {
                var el = kintone.app.record.getFieldElement(targetField_date[i]);
                changeStyle(el, targetColor_date[i], targetSize_date[i]);
            }
        }

        return event;
    }, false);

    //index event
    var indexEvents = [
        'app.record.index.show'
    ];
    kintone.events.on(indexEvents, function(event) {
        for (var i = 0; i < conditionField_text.length; i++) {
            var el = kintone.app.getFieldElements(targetField_text[i]);
            if (el) {
                for (var n = 0; n < el.length; n++) {
                    var record = event.records[n];
                    if (comparison_data(record[conditionField_text[i]]['value'], conditionValue_text[i], conditionType_text[i])) {
                        changeStyle(el[n], targetColor_text[i], targetSize_text[i]);
                        changeBackgroundStyle(el[n], targetBColor_text[i]);
                    }
                }
            }
        }

        for (var i = 0; i < conditionField_date.length; i++) {
            var el = kintone.app.getFieldElements(targetField_date[i]);
            if (el) {
                for (var n = 0; n < el.length; n++) {
                    var record = event.records[n];
                    if (comparison_date(record[conditionField_date[i]]['value'], conditionValue_date[i], conditionType_date[i])) {
                        changeStyle(el[n], targetColor_date[i], targetSize_date[i]);
                        changeBackgroundStyle(el[n], targetBColor_date[i]);
                    }
                }
            }
        }

        return event;
    }, false);

})(jQuery, kintone.$PLUGIN_ID);
