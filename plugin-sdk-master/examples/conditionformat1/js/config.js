jQuery.noConflict();

(function($, PLUGIN_ID) {
    "use strict";
    
    $(document).ready(function() {
        // 设置密钥
        var KEY = PLUGIN_ID;
        var conf = kintone.plugin.app.getConfig(KEY);

        var max = 5;    //指定行数
        max++;

        // 获取表单设计信息，放到选择框里
        kintone.api(kintone.api.url('/k/v1/preview/form', true), 'GET', {'app': kintone.app.getId()}, function(resp) {
            for (var i = 0; i < resp.properties.length; i++) {
                var prop = resp.properties[i];
                
                switch (prop['type']){
                    
                case 'SINGLE_LINE_TEXT': 
                case 'NUMBER': 
                case 'CALC': 
                case 'RADIO_BUTTON': 
                case 'DROP_DOWN': 
                    $('#conditionformat-plugin-cfield_text_1').append($('<option>').text(prop['label']).val(prop['code']));
                    $('#conditionformat-plugin-cfield_text_2').append($('<option>').text(prop['label']).val(prop['code']));
                    $('#conditionformat-plugin-cfield_text_3').append($('<option>').text(prop['label']).val(prop['code']));
                    $('#conditionformat-plugin-cfield_text_4').append($('<option>').text(prop['label']).val(prop['code']));
                    $('#conditionformat-plugin-cfield_text_5').append($('<option>').text(prop['label']).val(prop['code']));
                    $('#conditionformat-plugin-tfield_text_1').append($('<option>').text(prop['label']).val(prop['code']));
                    $('#conditionformat-plugin-tfield_text_2').append($('<option>').text(prop['label']).val(prop['code']));
                    $('#conditionformat-plugin-tfield_text_3').append($('<option>').text(prop['label']).val(prop['code']));
                    $('#conditionformat-plugin-tfield_text_4').append($('<option>').text(prop['label']).val(prop['code']));
                    $('#conditionformat-plugin-tfield_text_5').append($('<option>').text(prop['label']).val(prop['code']));
                    $('#conditionformat-plugin-tfield_date_1').append($('<option>').text(prop['label']).val(prop['code']));
                    $('#conditionformat-plugin-tfield_date_2').append($('<option>').text(prop['label']).val(prop['code']));
                    $('#conditionformat-plugin-tfield_date_3').append($('<option>').text(prop['label']).val(prop['code']));
                    $('#conditionformat-plugin-tfield_date_4').append($('<option>').text(prop['label']).val(prop['code']));
                    $('#conditionformat-plugin-tfield_date_5').append($('<option>').text(prop['label']).val(prop['code']));
                    break;
                case 'DATE': 
                case 'DATETIME': 
                    $('#conditionformat-plugin-tfield_text_1').append($('<option>').text(prop['label']).val(prop['code']));
                    $('#conditionformat-plugin-tfield_text_2').append($('<option>').text(prop['label']).val(prop['code']));
                    $('#conditionformat-plugin-tfield_text_3').append($('<option>').text(prop['label']).val(prop['code']));
                    $('#conditionformat-plugin-tfield_text_4').append($('<option>').text(prop['label']).val(prop['code']));
                    $('#conditionformat-plugin-tfield_text_5').append($('<option>').text(prop['label']).val(prop['code']));
                    $('#conditionformat-plugin-cfield_date_1').append($('<option>').text(prop['label']).val(prop['code']));
                    $('#conditionformat-plugin-cfield_date_2').append($('<option>').text(prop['label']).val(prop['code']));
                    $('#conditionformat-plugin-cfield_date_3').append($('<option>').text(prop['label']).val(prop['code']));
                    $('#conditionformat-plugin-cfield_date_4').append($('<option>').text(prop['label']).val(prop['code']));
                    $('#conditionformat-plugin-cfield_date_5').append($('<option>').text(prop['label']).val(prop['code']));
                    $('#conditionformat-plugin-tfield_date_1').append($('<option>').text(prop['label']).val(prop['code']));
                    $('#conditionformat-plugin-tfield_date_2').append($('<option>').text(prop['label']).val(prop['code']));
                    $('#conditionformat-plugin-tfield_date_3').append($('<option>').text(prop['label']).val(prop['code']));
                    $('#conditionformat-plugin-tfield_date_4').append($('<option>').text(prop['label']).val(prop['code']));
                    $('#conditionformat-plugin-tfield_date_5').append($('<option>').text(prop['label']).val(prop['code']));
                    break;
                }
            }
            
            //如果已经有设定值的情况下，设置字段的值。
            if (conf['body_text']){
                var body_text = JSON.parse(conf['body_text']);
                var body_date = JSON.parse(conf['body_date']);
        
                for(var i = 1; i < max; i++){
                    if (body_text[ 'conditionformat-plugin-cfield_text_' + i ]) {
                        $('select[ name=conditionformat-plugin-cfield_text_' + i + ']' ).val(body_text[ 'conditionformat-plugin-cfield_text_' + i ]['value']);
                    }
                    if (body_text[ 'conditionformat-plugin-ctype_text_' + i ]) {
                        $('select[ name=conditionformat-plugin-ctype_text_' + i + ']' ).val(body_text[ 'conditionformat-plugin-ctype_text_' + i ]['value']);
                    }
                    if (body_text[ 'conditionformat-plugin-cvalue_text_' + i ]) {
                        $('#conditionformat-plugin-cvalue_text_' + i).val(body_text[ 'conditionformat-plugin-cvalue_text_' + i ]['value']);
                    }
                    if (body_text[ 'conditionformat-plugin-tfield_text_' + i ]) {
                        $('select[ name=conditionformat-plugin-tfield_text_' + i + ']' ).val(body_text[ 'conditionformat-plugin-tfield_text_' + i ]['value']);
                    }
                    if (body_text[ 'conditionformat-plugin-tcolor_text_' + i ]) {
                        $('#conditionformat-plugin-tcolor_text_' + i).val(body_text[ 'conditionformat-plugin-tcolor_text_' + i ]['value']);
                    }
                    if (body_text[ 'conditionformat-plugin-tsize_text_' + i ]) {
                        $('select[ name=conditionformat-plugin-tsize_text_' + i + ']' ).val(body_text[ 'conditionformat-plugin-tsize_text_' + i ]['value']);
                    }
                    if (body_text[ 'conditionformat-plugin-bcolor_text_' + i ]) {
                        $('#conditionformat-plugin-bcolor_text_' + i).val(body_text[ 'conditionformat-plugin-bcolor_text_' + i ]['value']);
                    }

                    if (body_date[ 'conditionformat-plugin-cfield_date_' + i ]) {
                        $('select[ name=conditionformat-plugin-cfield_date_' + i + ']' ).val(body_date[ 'conditionformat-plugin-cfield_date_' + i ]['value']);
                    }
                    if (body_date[ 'conditionformat-plugin-ctype_date_' + i ]) {
                        $('select[ name=conditionformat-plugin-ctype_date_' + i + ']' ).val(body_date[ 'conditionformat-plugin-ctype_date_' + i ]['value']);
                    }
                    if (body_date[ 'conditionformat-plugin-cvalue_date_' + i ]) {
                        $('#conditionformat-plugin-cvalue_date_' + i).val(body_date[ 'conditionformat-plugin-cvalue_date_' + i ]['value']);
                    }
                    if (body_date[ 'conditionformat-plugin-tfield_date_' + i ]) {
                        $('select[ name=conditionformat-plugin-tfield_date_' + i + ']' ).val(body_date[ 'conditionformat-plugin-tfield_date_' + i ]['value']);
                    }
                    if (body_date[ 'conditionformat-plugin-tcolor_date_' + i ]) {
                        $('#conditionformat-plugin-tcolor_date_' + i).val(body_date[ 'conditionformat-plugin-tcolor_date_' + i ]['value']);
                    }
                    if (body_date[ 'conditionformat-plugin-tsize_date_' + i ]) {
                        $('select[ name=conditionformat-plugin-tsize_date_' + i + ']' ).val(body_date[ 'conditionformat-plugin-tsize_date_' + i ]['value']);
                    }
                    if (body_date[ 'conditionformat-plugin-bcolor_date_' + i ]) {
                        $('#conditionformat-plugin-bcolor_date_' + i).val(body_date[ 'conditionformat-plugin-bcolor_date_' + i ]['value']);
                    }
                }
            }
        });
     
        // 点击 “保存” 按钮，设置输入的信息
        $('#submit').click(function() {
            var config = [];
            var body_text = {};
            var body_date = {};
            
            //文字条件格式输入校验
            for (var i = 1; i < max; i++) {
                var fieldText = $('[name=conditionformat-plugin-cfield_text_' + i + ']').val();
                var typeText = $('[name=conditionformat-plugin-ctype_text_' + i + ']').val();
                var valueText = $('#conditionformat-plugin-cvalue_text_' + i).val();
                var targetFieldText = $('[name=conditionformat-plugin-tfield_text_' + i + ']').val();
                var targetColorText = $('#conditionformat-plugin-tcolor_text_' + i).val();
                var targetSizeText = $('[name=conditionformat-plugin-tsize_text_' + i + ']').val();
                var targetBColorText = $('#conditionformat-plugin-bcolor_text_' + i).val();
                
                if (!(fieldText == "" && typeText == "" && valueText == "" && targetFieldText == "" && targetColorText == "" && targetSizeText == "" && targetBColorText == "") && !(fieldText != "" && typeText != "" && valueText != "" && targetFieldText != "")) {
                    alert("每行的条件和字段都是必填项。");
                    return false;
                }
                body_text[ 'conditionformat-plugin-cfield_text_' + i ] = {"value": fieldText};
                body_text[ 'conditionformat-plugin-ctype_text_' + i ]  = {"value": typeText};
                body_text[ 'conditionformat-plugin-cvalue_text_' + i ] = {"value": valueText};
                body_text[ 'conditionformat-plugin-tfield_text_' + i ]    = {"value": targetFieldText};
                body_text[ 'conditionformat-plugin-tcolor_text_' + i ]    = {"value": targetColorText};
                body_text[ 'conditionformat-plugin-tsize_text_' + i ]     = {"value": targetSizeText};
                body_text[ 'conditionformat-plugin-bcolor_text_' + i ]    = {"value": targetBColorText};
            }
                
            //日期条件格式输入校验
            for (var i = 1; i < max; i++) {
                var fieldDate = $('[name=conditionformat-plugin-cfield_date_' + i + ']').val();
                var typeDate = $('[name=conditionformat-plugin-ctype_date_' + i + ']').val();
                var valueDate = $('#conditionformat-plugin-cvalue_date_' + i).val();
                var targetFieldDate = $('[name=conditionformat-plugin-tfield_date_' + i + ']').val();
                var targetColorDate = $('#conditionformat-plugin-tcolor_date_' + i).val();
                var targetSizeDate = $('[name=conditionformat-plugin-tsize_date_' + i + ']').val();
                var targetBColorDate = $('#conditionformat-plugin-bcolor_date_' + i).val();
                
                if (!(fieldDate == "" && typeDate == "" && valueDate == "" && targetFieldDate == "" && targetColorDate == "" && targetSizeDate == "" && targetBColorDate == "") && !(fieldDate != "" && typeDate != "" && valueDate != "" && targetFieldDate != "")) {
                    alert("每行的条件和字段都是必填项。");
                    return false;
                }
                body_date[ 'conditionformat-plugin-cfield_date_' + i ] = {"value": fieldDate};
                body_date[ 'conditionformat-plugin-ctype_date_' + i ]  = {"value": typeDate};
                body_date[ 'conditionformat-plugin-cvalue_date_' + i ] = {"value": valueDate};
                body_date[ 'conditionformat-plugin-tfield_date_' + i ]    = {"value": targetFieldDate};
                body_date[ 'conditionformat-plugin-tcolor_date_' + i ]    = {"value": targetColorDate};
                body_date[ 'conditionformat-plugin-tsize_date_' + i ]     = {"value": targetSizeDate};
                body_date[ 'conditionformat-plugin-bcolor_date_' + i ]    = {"value": targetBColorDate};
            }
            config['body_text'] = JSON.stringify(body_text);
            config['body_date'] = JSON.stringify(body_date);
            
            kintone.plugin.app.setConfig(config);
        });
         
        // 点击 “取消” 按钮时的处理
        $('#cancel').click(function() {
            history.back();
        });
    });
})(jQuery,kintone.$PLUGIN_ID);