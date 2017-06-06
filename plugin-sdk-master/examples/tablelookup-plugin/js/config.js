/*
 * Table lookup plug-in
 * Copyright (c) 2017 Cybozu
 *
 * Licensed under the MIT License
 */

jQuery.noConflict();

(function($, PLUGIN_ID) {
    "use strict";



    var conf = kintone.plugin.app.getConfig(PLUGIN_ID);
    var ENABLE_ROW_NUM = Number(conf["enable_row_number"]);
    var TABLE_ROW_NUM = Number(conf["table_row_number"]);

    for (var r = 1; r < ENABLE_ROW_NUM + 1; r++) {
        conf["enablefield_row" + r] = JSON.parse(conf["enablefield_row" + r]);
    }

    for (var k = 1; k < TABLE_ROW_NUM + 1; k++) {
        conf["table_row" + k] = JSON.parse(conf["table_row" + k]);
    }

    $(document).ready(function() {

            var terms = {
                'ja': {
                    'tc_lookup_label': 'ルックアップフィールドの指定',
                    'tc_lookup_description':'コピー元のアプリと関連付けるルックアップフィールドを指定してください',
                    'tc_changeEvent_label': 'コピー元レコード番号',
                    'tc_changeEvent_description':
                    '‘テーブルをコピーするには、ルークアルックアップ設定画面の「ほかのフィールドのコピー」にコピー元のレコード番号を指定する必要があります。',
                    'tc_disable_label': '［オプション］編集可にしたいフィールドの指定',
                    'tc_disable_description': '通常、ルックアップ設定画面の「ほかのフィールドのコピー」に指定したコピー先フィールドは編集不可になります。',
                    'tc_disable_description2':'ここではそのフィールドを編集可に設定することができます。編集可にしたいフィールドを指定してください（複数選択可）。',
                    'tc_disable_field_title': 'フィールドコード',
                    'tc_tablefield_label': 'コピー元とコピー先の指定',
                    'tc_tablefield_description':'コピー元テーブルとコピー先テーブルを指定してください。',
                    'tc_tablefield_from_title': 'コピー元テーブルのフィールドコード',
                    'tc_tablefield_to_title': 'コピー先テーブルのフィールドコード',
                    'tc_copyfield_description': 'テーブル内でコピーしたいフィールドとコピー先のフィールドを指定してしてください（複数選択可）。',
                    'tc_copyfield_from_title': 'コピー元フィールド名',
                    'tc_copyfield_to_title': 'コピー先フィールド名',
                    'tc_submit': '保存',
                    'tc_cancel': 'キャンセル',
                    'tc_message': '必須項目です',
                    'tc_caution': '以下で選択肢を切り替えると、他の項目の設定もリセットされる場合があります。ご注意ください。',
                    'tc_message_changeEventfield': 'ルックアップの「ほかのフィールドのコピー」にコピー元のレコード番号を指定する必要があります。フォームの設定をご確認ください'
                },
                'en': {
                    'tc_lookup_label': 'The Lookup field',
                    'tc_lookup_description':'Select a Lookup field to enhance.',
                    'tc_changeEvent_label': 'Editable fields',
                    'tc_changeEvent_description':
                    'List the fields used in the Field Mappings option of the Lookup.' +
                    ' These fields will become editable.',
                    'tc_disable_label': '[Option] Make fields editable',
                    'tc_disable_description':
                    'List the fields used in the Field Mappings option of the Lookup.' +
                    ' These fields will become editable.',
                    'tc_disable_field_title': 'Field Code',
                    'tc_tablefield_label': 'Table Lookup',
                    'tc_tablefield_description':'Choose which table in the Datasource App'
                    + ' will be mapped to which table in this App.',
                    'tc_tablefield_from_title': 'Datasource table ',
                    'tc_tablefield_to_title': 'Endpoint table in this App',
                    'tc_copyfield_description':
                    'Choose which fields in the Datasource table will be' +
                    ' mapped to which fields in the table of this App.',
                    'tc_copyfield_from_title': 'Datasource table field',
                    'tc_copyfield_to_title': 'Endpoint table field',
                    'tc_submit': 'Save',
                    'tc_cancel': 'Cancel',
                    'tc_message': 'Required field',
                    'tc_caution':
                    'Note: Editing the below fields may cause other values on this page to reset.',
                    'tc_message_changeEventfield':
                    'The Record number must be set as one of the mappings' +
                    ' for the Field Mappings settings of the Lookup.'
                },
                'zh': {
                    'tc_lookup_label': '选择lookup字段',
                    'tc_lookup_description':'请选择与复制来源的应用相关联的lookup字段',
                    'tc_changeEvent_label': '复制来源的记录编号字段',
                    'tc_changeEvent_description': '要复制表格，需要在lookup字段的设置页面的“其他要复制的字段”中指定复制来源的记录编号',
                    'tc_disable_label': '[可选项]设置字段可编辑',
                    'tc_disable_description': '在标准功能下，lookup设置页面的“其他要复制的字段”中设置的复制目标字段是不可编辑的。使用此项设置，可设为可编辑。',
                    'tc_disable_field_title': '字段代码',
                    'tc_tablefield_label': '指定复制的来源和目标位置',
                    'tc_tablefield_description':'请指定复制来源表格和复制目标表格。',
                    'tc_tablefield_from_title': '复制来源表格',
                    'tc_tablefield_to_title': '复制目标表格',
                    'tc_copyfield_description': '指定要从表格内的哪个字段复制到哪个字段。',
                    'tc_copyfield_from_title': '复制来源字段',
                    'tc_copyfield_to_title': '复制目标字段',
                    'tc_submit': '保存',
                    'tc_cancel': '取消',
                    'tc_message': '不能为空',
                    'tc_caution': '请注意！当更改此处的选项时，下面的项目中部分设置将被重置。',
                    'tc_message_changeEventfield': '需要在lookup的[其他要复制的字段]中指定复制来源的记录编号。请确认表单的设置'
                }
            };

            // To switch the display by the login user's language
            var lang = kintone.getLoginUser().language;
            var i18n = (lang in terms) ? terms[lang] : terms['en'];
            var configHtml = $('#tc-plugin').html();
            var tmpl = $.templates(configHtml);
            $('div#tc-plugin').html(tmpl.render({'terms': i18n}));
            var thisAppId = kintone.app.getId();


            // escape fields value
            function escapeHtml(htmlstr) {
                return htmlstr.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
            }


            function checkRowNumber() {
                if ($("#tc-plugin-enablefield-tbody > tr").length === 2) {
                    $("#tc-plugin-enablefield-tbody > tr .removeList").eq(1).hide();
                } else {
                    $("#tc-plugin-enablefield-tbody > tr .removeList").eq(1).show();
                }

                if ($("#tc-plugin-copyfield-tbody > tr").length === 2) {
                    $("#tc-plugin-copyfield-tbody > tr .removeList").eq(1).hide();
                } else {
                    $("#tc-plugin-copyfield-tbody > tr .removeList").eq(1).show();
                }
            }


            function setEnableTableDefault() {
                for (var tn = 1; tn <= ENABLE_ROW_NUM; tn++) {
                    $("#tc-plugin-enablefield-tbody > tr").eq(0).clone(true).insertAfter(
                    $("#tc-plugin-enablefield-tbody > tr").eq(tn - 1)
                    );
                    $("#tc-plugin-enablefield-tbody > tr:eq(" + tn + ") .tc-plugin-column1")
                    .val(conf["enablefield_row" + tn]['column1']);
                }
            }


            function setCopyFieldTableDefault() {
                for (var ti = 1; ti <= TABLE_ROW_NUM; ti++) {
                    $("#tc-plugin-copyfield-tbody > tr").eq(0).clone(true).insertAfter(
                    $("#tc-plugin-copyfield-tbody > tr").eq(ti - 1)
                    );
                    $("#tc-plugin-copyfield-tbody > tr:eq(" + ti + ") .tc-plugin-column1")
                    .val(conf["table_row" + ti]['column1']);
                    $("#tc-plugin-copyfield-tbody > tr:eq(" + ti + ") .tc-plugin-column2")
                    .val(conf["table_row" + ti]['column2']);
                }
            }



            function setDefault() {
                $('.lookupField').val(conf["lookupField"]);
                $('#changeEventField').val(conf["changeEventField"]);
                $('.copyFromTable').val(conf["copyFromTable"]);
                $('.copyToTable').val(conf["copyToTable"]);


                if (ENABLE_ROW_NUM > 0) {
                    setEnableTableDefault();
                } else {
                    $("#tc-plugin-enablefield-tbody > tr").eq(0).clone(true).insertAfter(
                    $("#tc-plugin-enablefield-tbody > tr")).eq(0);
                }

                if (TABLE_ROW_NUM > 0) {
                    setCopyFieldTableDefault();
                } else {
                    $("#tc-plugin-copyfield-tbody > tr").eq(0).clone(true).insertAfter(
                    $("#tc-plugin-copyfield-tbody > tr")).eq(0);
                }
                checkRowNumber();
            }



            function setLookupAndCopyToTableDefault(resp) {
                var fields = resp['properties'];
                var $option = $("<option>");
                for (var key in fields) {
                    if (!fields.hasOwnProperty(key)) {continue; }
                    var prop = fields[key];
                    // lookup Field
                    if (fields[key].hasOwnProperty("lookup")) {
                        $option.attr("value", escapeHtml(prop.code));
                        $option.text(escapeHtml(prop.label));
                        $('.lookupField').append($option.clone());
                    }
                    // current Table
                    if (prop['type'] === "SUBTABLE") {
                        $option.attr("value", escapeHtml(prop.code));
                        $option.text(escapeHtml(prop.code));
                        $('.copyToTable').append($option.clone());
                    }
                }
            }



            function setMappingFieldDefult(resp) {
                var lookup_field = conf["lookupField"];
                var lookupMappingFields = resp.properties[lookup_field].lookup.fieldMappings;
                for (var MappingKey in lookupMappingFields) {
                    if (!lookupMappingFields.hasOwnProperty(MappingKey)) {continue; }
                    var prop = lookupMappingFields[MappingKey];
                    var $option = $("<option>");
                    var recNoField = conf["changeEventField"];
                    if (prop.field !== recNoField) {
                        $option.attr("value", escapeHtml(prop.field));
                        $option.text(escapeHtml(prop.field));
                        $('#tc-plugin-enablefield-tbody > tr:eq(0) .tc-plugin-column1')
                        .append($option.clone());
                        $('#tc-plugin-enablefield-tbody > tr:eq(1) .tc-plugin-column1')
                        .append($option.clone());
                    }
                }
            }


            function setCopyFromTableDefault(res) {
                var relatedFields = res['properties'];
                var $option = $("<option>");
                for (var rk in relatedFields) {
                    if (!relatedFields.hasOwnProperty(rk)) {continue; }
                    var pr = relatedFields[rk];
                    switch (pr['type']) {
                        case "SUBTABLE":
                            $option.attr("value", escapeHtml(pr.code));
                            $option.text(escapeHtml(pr.code));
                            $('.copyFromTable').append($option.clone());
                            break;
                        default:
                            break;
                    }
                }
            }



            function setCopyToFieldDefault(resp) {
                var $option = $("<option>");
                if (!conf['copyToTable']) {return; }
                var currentTable = conf['copyToTable'];
                var currentTableFields = resp.properties[currentTable].fields;
                for (var ct in currentTableFields) {
                    if (!currentTableFields.hasOwnProperty(ct)) {continue; }
                    var p = currentTableFields[ct];
                    switch (p['type']) {
                        case "SINGLE_LINE_TEXT":
                        case "NUMBER":
                        case "MULTI_LINE_TEXT":
                        case "RICH_TEXT":
                        case "CHECK_BOX":
                        case "RADIO_BUTTON":
                        case "DROP_DOWN":
                        case "MULTI_SELECT":
                        case "LINK":
                        case "DATE":
                        case "TIME":
                        case "DATETIME":
                        case "USER_SELECT":
                        case "GROUP_SELECT":
                        case "ORGANIZATION_SELECT":
                            $option.attr("value", escapeHtml(p.code));
                            $option.attr("name", escapeHtml(p.type));
                            $option.text(escapeHtml(p.label));
                            $('#tc-plugin-copyfield-tbody > tr:eq(0) .tc-plugin-column2')
                            .append($option.clone());
                            break;
                        default:
                            break;
                    }
                }
            }




            function setCopyFromFieldDefault(res) {
                var from_Table = conf["copyFromTable"];
                var copyFromFields = res.properties[from_Table].fields;
                for (var from_key in copyFromFields) {
                    if (!copyFromFields.hasOwnProperty(from_key)) {continue; }
                    var copyFromProp = copyFromFields[from_key];
                    var $option = $("<option>");
                    switch (copyFromProp['type']) {
                        case "SINGLE_LINE_TEXT":
                        case "NUMBER":
                        case "MULTI_LINE_TEXT":
                        case "RICH_TEXT":
                        case "CHECK_BOX":
                        case "RADIO_BUTTON":
                        case "DROP_DOWN":
                        case "MULTI_SELECT":
                        case "LINK":
                        case "DATE":
                        case "TIME":
                        case "DATETIME":
                        case "USER_SELECT":
                        case "GROUP_SELECT":
                        case "ORGANIZATION_SELECT":
                            $option.attr("value", escapeHtml(copyFromProp.code));
                            $option.attr("name", escapeHtml(copyFromProp.type));
                            $option.text(escapeHtml(copyFromProp.label));
                            $('#tc-plugin-copyfield-tbody > tr:eq(0) .tc-plugin-column1')
                            .append($option.clone());
                            break;
                        default:
                            break;
                    }
                }
            }


            function setDropdownDefault() {
                kintone.api(kintone.api.url('/k/v1/preview/app/form/fields', true), 'GET', {'app': thisAppId},
                function(resp) {
                    setLookupAndCopyToTableDefault(resp);
                    setCopyToFieldDefault(resp);

                    if (!conf["lookupField"]) {
                        setDefault();
                        return;
                    }

                    setMappingFieldDefult(resp);
                    var lookup_field = conf["lookupField"];
                    var relateAppId = resp.properties[lookup_field].lookup.relatedApp.app;
                    kintone.api('/k/v1/preview/app/form/fields', 'GET', {'app': relateAppId},
                    function(res) {
                        setCopyFromTableDefault(res);
                        setCopyFromFieldDefault(res);
                        setDefault();
                    });
                });
            }


            function alertshow(elmParent) {
                $(elmParent).parent().find('.common').css({'display': 'block'});
                return;
            }


            function alerthide(elmParent) {
                $(elmParent).parent().find('.common').css({'display': 'none'});
            }



            function dataClear_lookupFieldChanged() {
                var rownum_enable = $("#tc-plugin-enablefield-tbody").find("tr").length;
                var rownum_table = $("#tc-plugin-copyfield-tbody").find("tr").length;
                // delete existed table data
                if (rownum_enable > 2) {
                    $('#tc-plugin-enablefield-tbody > tr:gt(1)').remove();
                }
                if (rownum_table > 2) {
                    $('#tc-plugin-copyfield-tbody > tr:gt(1)').remove();
                }
                $('#tc-plugin-enablefield-tbody > tr:eq(0) .tc-plugin-column1 > option:gt(0)').remove();
                $('#tc-plugin-enablefield-tbody > tr:eq(1) .tc-plugin-column1 > option:gt(0)').remove();
                $('#tc-plugin-copyfield-tbody > tr:eq(0) .tc-plugin-column1 > option:gt(0)').remove();
                $('#tc-plugin-copyfield-tbody > tr:eq(1) .tc-plugin-column1 > option:gt(0)').remove();
                $('.copyFromTable > option:gt(0)').remove();
                checkRowNumber();
            }



            function setChangeEventField_lookupFieldChanged(resp) {
                var lookup_field = $(".lookupField").val();
                var mappingFields = resp.properties[lookup_field].lookup.fieldMappings;
                var elmParent = $('.lookupField').parent();
                for (var mf = 0; mf < mappingFields.length; mf++) {
                    var relatedField = mappingFields[mf].relatedField;
                    if (relatedField === "レコード番号" || relatedField === "记录编号" || relatedField === "Record_number") {
                        $(elmParent).parent().find('#msg2').css({'display': 'none'});
                        var currentField = mappingFields[mf].field;
                        $('#changeEventField').val(currentField);
                    } else {
                        $(elmParent).parent().find('#msg2').css({'display': 'block'});
                        $('#changeEventField').val("");
                    }
                }
            }


            function setMappingField_lookupFieldChanged(resp) {
                var lookupFieldCode = $(".lookupField").val();
                var lookupMappingFields = resp.properties[lookupFieldCode].lookup.fieldMappings;
                for (var MappingKey in lookupMappingFields) {
                    if (!lookupMappingFields.hasOwnProperty(MappingKey)) {continue; }
                    var prop = lookupMappingFields[MappingKey];
                    var $option = $("<option>");
                    var recNoField = $("#changeEventField").val();
                    if (prop.field !== recNoField) {
                        $option.attr("value", escapeHtml(prop.field));
                        $option.text(escapeHtml(prop.field));
                        $('#tc-plugin-enablefield-tbody > tr:eq(0) .tc-plugin-column1')
                        .append($option.clone());
                        $('#tc-plugin-enablefield-tbody > tr:eq(1) .tc-plugin-column1')
                        .append($option.clone());
                    }
                }
            }



            function setCopyFromTable_lookupFieldChanged(res) {
                var relatedFields = res['properties'];
                for (var rk in relatedFields) {
                    if (!relatedFields.hasOwnProperty(rk)) {continue; }
                    var p = relatedFields[rk];
                    var $option = $("<option>");
                    switch (p['type']) {
                        case "SUBTABLE":
                            $option.attr("value", escapeHtml(p.code));
                            $option.text(escapeHtml(p.code));
                            $('.copyFromTable').append($option.clone());
                            break;
                        default:
                            break;
                    }
                }
            }


            function dataClear_copyFromTableChanged() {
                var rowNumber = $("#tc-plugin-copyfield-tbody").find("tr").length;
                if (rowNumber > 2) {
                    $('#tc-plugin-copyfield-tbody > tr:gt(1)').remove();
                }
                $('#tc-plugin-copyfield-tbody > tr:eq(0) .tc-plugin-column1 > option:gt(0)').remove();
                $('#tc-plugin-copyfield-tbody > tr:eq(1) .tc-plugin-column1 > option:gt(0)').remove();
                checkRowNumber();
            }



            function setDropdown_CopyFromTableChanged(res) {
                var related_table = $('.copyFromTable').val();
                var copyFromFields = res.properties[related_table].fields;
                for (var key in copyFromFields) {
                    if (!copyFromFields.hasOwnProperty(key)) {continue; }
                    var Prop = copyFromFields[key];
                    var $option = $("<option>");
                    switch (Prop['type']) {
                        case "SINGLE_LINE_TEXT":
                        case "NUMBER":
                        case "MULTI_LINE_TEXT":
                        case "RICH_TEXT":
                        case "CHECK_BOX":
                        case "RADIO_BUTTON":
                        case "DROP_DOWN":
                        case "MULTI_SELECT":
                        case "LINK":
                        case "DATE":
                        case "TIME":
                        case "DATETIME":
                        case "USER_SELECT":
                        case "GROUP_SELECT":
                        case "ORGANIZATION_SELECT":
                            $option.attr("value", escapeHtml(Prop.code));
                            $option.attr("name", escapeHtml(Prop.type));
                            $option.text(escapeHtml(Prop.label));
                            $('#tc-plugin-copyfield-tbody > tr:eq(0) .tc-plugin-column1')
                            .append($option.clone());
                            $('#tc-plugin-copyfield-tbody > tr:eq(1) .tc-plugin-column1')
                            .append($option.clone());
                            break;
                        default:
                            break;
                    }
                }
            }



            function dataClear_CopyToTableChanged() {
                var rowNumber = $("#tc-plugin-copyfield-tbody").find("tr").length;
                if (rowNumber > 2) {
                    $('#tc-plugin-copyfield-tbody > tr:gt(1)').remove();
                }
                $('#tc-plugin-copyfield-tbody > tr:eq(0) .tc-plugin-column2 > option:gt(0)').remove();
                $('#tc-plugin-copyfield-tbody > tr:eq(1) .tc-plugin-column2 > option:gt(0)').remove();
                checkRowNumber();
            }


            function setDropdown_CopyToTableChanged(resp) {
                var currentTable = $('.copyToTable').val();
                var currentTableFields = resp.properties[currentTable].fields;
                var $option = $("<option>");
                for (var tf in currentTableFields) {
                    if (!currentTableFields.hasOwnProperty(tf)) {continue; }
                    var p = currentTableFields[tf];
                    switch (p['type']) {
                        case "SINGLE_LINE_TEXT":
                        case "NUMBER":
                        case "MULTI_LINE_TEXT":
                        case "RICH_TEXT":
                        case "CHECK_BOX":
                        case "RADIO_BUTTON":
                        case "DROP_DOWN":
                        case "MULTI_SELECT":
                        case "LINK":
                        case "DATE":
                        case "TIME":
                        case "DATETIME":
                        case "USER_SELECT":
                        case "GROUP_SELECT":
                        case "ORGANIZATION_SELECT":
                            $option.attr("value", escapeHtml(p.code));
                            $option.attr("name", escapeHtml(p.type));
                            $option.text(escapeHtml(p.label));
                            $('#tc-plugin-copyfield-tbody > tr:eq(0) .tc-plugin-column2')
                            .append($option.clone());
                            $('#tc-plugin-copyfield-tbody > tr:eq(1) .tc-plugin-column2')
                           .append($option.clone());
                            break;
                        default:
                            break;
                    }
                }
            }



            // change lookup field
            $(".lookupField").change(function() {
                var elmParent = $('.lookupField').parent();
                var lookupFieldCode = $(".lookupField").val();
                if (lookupFieldCode === "") {
                    alertshow(elmParent);
                    $(elmParent).parent().find('#msg2').css({'display': 'none'});
                    return;
                }
                alerthide(elmParent);
                dataClear_lookupFieldChanged();
                // set related table
                kintone.api(kintone.api.url('/k/v1/preview/app/form/fields', true), 'GET', {'app': thisAppId},
                function(resp) {
                    var relateAppId = resp.properties[lookupFieldCode].lookup.relatedApp.app;
                    setChangeEventField_lookupFieldChanged(resp);
                    setMappingField_lookupFieldChanged(resp);
                    // set related table fields
                    return kintone.api('/k/v1/preview/app/form/fields', 'GET', {'app': relateAppId })
                    .then(function(res) {
                        setCopyFromTable_lookupFieldChanged(res);
                    });
                });
            });



            // change related table
            $('.copyFromTable').change(function() {
                var elmParent = $('.copyFromTable').parent();
                var related_table = $('.copyFromTable').val();
                if ($('.lookupField').val() === "") {return; }
                if (related_table === "") {
                    alertshow(elmParent);
                    return;
                }
                alerthide(elmParent);
                dataClear_copyFromTableChanged();
                // set related fields
                kintone.api(kintone.api.url('/k/v1/preview/app/form/fields', true), 'GET', {'app': thisAppId},
                function(resp) {
                    var lookupFieldCode = $(".lookupField").val();
                    var relateAppId = resp.properties[lookupFieldCode].lookup.relatedApp.app;
                    return kintone.api('/k/v1/preview/app/form/fields', 'GET', {'app': relateAppId })
                    .then(function(res) {
                        setDropdown_CopyFromTableChanged(res);
                    });
                });
            });



            // change current table
            $('.copyToTable').change(function() {
                var elmParent = $('.copyToTable').parent();
                if ($('.copyToTable').val() === "") {
                    alertshow(elmParent);
                    return;
                }
                alerthide(elmParent);
                dataClear_CopyToTableChanged();
                kintone.api(kintone.api.url('/k/v1/preview/app/form/fields', true),
                'GET', {'app': thisAppId}, function(resp) {
                    setDropdown_CopyToTableChanged(resp);
                });
            });


            //Add Row
            $("#tc-plugin-enablefield-tbody .addList").click(function() {
                $("#tc-plugin-enablefield-tbody > tr").eq(0).clone(true).insertAfter($(this).parent().parent());
                checkRowNumber();
            });

            $("#tc-plugin-copyfield-tbody .addList").click(function() {
                $("#tc-plugin-copyfield-tbody > tr").eq(0).clone(true).insertAfter($(this).parent().parent());
                checkRowNumber();
            });
            // Remove Row
            $(".removeList").click(function() {
                $(this).parent('td').parent('tr').remove();
                checkRowNumber();
            });



            function createErrorMessage(type, error_num, row_num) {
                var user_lang = kintone.getLoginUser().language;
                var error_messages = {
                    'ja': {
                        'lookup_field': {
                            "1": "ルークアップフィールドは指定してください。"
                        },
                        'copy_field': {
                            "1": "「コピーを行うテーブル内のフィールドの指定」の" + row_num + "行目のコピー先を指定してください。",
                            "2": "「コピーを行うテーブル内のフィールドの指定」の" + row_num + "行目のコピー元を指定してください。",
                            "3": "「コピーを行うテーブル内のフィールドの指定」の" + row_num + "行目のフィールドタイプが一致していません。指定しなおしてください。"
                        }
                    },
                    'en': {
                        'lookup_field': {
                            "1": "The Lookup field has not been set."
                        },
                        'copy_field': {
                            "1": "Set the Endpoint table field for row " + row_num + " of the Table Field Mappings.",
                            "2": "Set the Datasource table field for row " + row_num + " of the Table Field Mappings.",
                            "3": "The field types do not match for row " + row_num + " of the Table Field Mappings."
                        }
                    },
                    'zh': {
                        'lookup_field': {
                            "1": "lookup字段不能为空。"
                        },
                        'copy_field': {
                            "1": "[设置要复制的字段]的第" + row_num + "行未指定复制目标字段。",
                            "2": "[设置要复制的字段]的第" + row_num + "行未指定复制来源字段。",
                            "3": "[设置要复制的字段]的第" + row_num + "行的字段类型不一致。请重新选择。"
                        }
                    }
                };
                return error_messages[user_lang][type][error_num];
            }


            function checklookupField(config) {
                if ($('.lookupField').val() === "") {
                    throw new Error(createErrorMessage("lookup_field", "1"));
                }
            }



            function checkConfigCopyfieldVal(config) {
                var row_num = Number(config["table_row_number"]);

                for (var cf = 1; cf <= row_num; cf++) {
                    var type2 = $('#tc-plugin-copyfield-tbody > tr:eq(' + cf + ') .tc-plugin-column2 option:selected')
                        .attr('name');
                    var type1 = $('#tc-plugin-copyfield-tbody > tr:eq(' + cf + ') .tc-plugin-column1 option:selected')
                        .attr('name');
                    var copy_field = JSON.parse(config['table_row' + cf]);
                    if (copy_field.column1 !== "" && copy_field.column2 === "") {
                        throw new Error(createErrorMessage("copy_field", "1", cf));
                    }
                    if (copy_field.column1 === "" && copy_field.column2 !== "") {
                        throw new Error(createErrorMessage("copy_field", "2", cf));
                    }
                    if (copy_field.column1 !== "" && copy_field.column2 !== "" && type2 !== type1) {
                        throw new Error(createErrorMessage("copy_field", "3", cf));
                    }
                }
            }



            function createConfig() {
                var config = {};
                // Save lookupField setting to config;
                config["lookupField"] = String($(".lookupField").val());

                // Set change event field to config;
                config["changeEventField"] = String($("#changeEventField").val());

                // Set enablefield setting to config;
                var totalrows_enablefield = $("#tc-plugin-enablefield-tbody").find("tr").length - 1;
                for (var h = 1; h <= totalrows_enablefield; h++) {
                    var lookupfield_value = $('#tc-plugin-enablefield-tbody > tr')
                        .eq(h).find('.tc-plugin-column1').val();
                    if (lookupfield_value === "") {
                        $('#tc-plugin-enablefield-tbody > tr:eq(' + h + ')').remove();
                        totalrows_enablefield = totalrows_enablefield - 1;
                        h--;
                        continue;
                    }
                    var row_enablefield = {"column1": lookupfield_value};
                    config['enablefield_row' + h] = JSON.stringify(row_enablefield);
                }
                config["enable_row_number"] = String(totalrows_enablefield);

                // Set tablefield setting to config;
                config["copyFromTable"] = String($(".copyFromTable").val());
                config["copyToTable"] = String($(".copyToTable").val());

                // Set copyfield setting to config;
                var totalrows_copyfield = $("#tc-plugin-copyfield-tbody").find("tr").length - 1;
                for (var y = 1; y <= totalrows_copyfield; y++) {
                    var valuecopyfrom = $('#tc-plugin-copyfield-tbody > tr').eq(y).find('.tc-plugin-column1').val();
                    var valuecopyto = $('#tc-plugin-copyfield-tbody > tr').eq(y).find('.tc-plugin-column2').val();
                    if (valuecopyfrom === "" && valuecopyto === "") {
                        $('#tc-plugin-copyfield-tbody > tr:eq(' + y + ')').remove();
                        totalrows_copyfield = totalrows_copyfield - 1;
                        y--;
                        continue;
                    }
                    var row_table = {"column1": valuecopyfrom, "column2": valuecopyto};
                    config['table_row' + y] = JSON.stringify(row_table);
                }
                config["table_row_number"] = String(totalrows_copyfield);
                return config;
            }


           //  click Save
            $('#kintoneplugin-submit').click(function() {
                try {
                    var config = createConfig();
                    checklookupField(config);
                    checkConfigCopyfieldVal(config);
                    kintone.plugin.app.setConfig(config);
                } catch(error) {
                    alert(error.message);
                }
            });


            //click Cancel
            $('#kintoneplugin-cancel').click(function() {
                history.back();
            });
            setDropdownDefault();
        });
})(jQuery, kintone.$PLUGIN_ID);
