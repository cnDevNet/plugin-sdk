/*
 * Table lookup plug-in
 * Copyright (c) 2017 Cybozu
 *
 * Licensed under the MIT License
 */

jQuery.noConflict();

(function($, PLUGIN_ID) {
    "use strict";

    // To HTML escape
    function escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }


    var conf = kintone.plugin.app.getConfig(PLUGIN_ID);
    if (!conf) {return false; }

    // JSON parse
    var ENABLE_ROW_NUM = Number(conf["enable_row_number"]);
    var TABLE_ROW_NUM = Number(conf["table_row_number"]);

    for (var r = 1; r < ENABLE_ROW_NUM + 1; r++) {
        conf["enablefield_row" + r] = JSON.parse(conf["enablefield_row" + r]);
    }
    for (var k = 1; k < TABLE_ROW_NUM + 1; k++) {
        conf["table_row" + k] = JSON.parse(conf["table_row" + k]);
    }



    //create table data
    function setTableData(Table) {
        var thisRecord = kintone.app.record.get();
        var tableCode = conf["copyToTable"];
        var thisTableFields = thisRecord.record[tableCode].value[0].value;
        var newrow = [];

        for (var h = 0; h < Table.value.length; h++) {
            var row = {};
            row.value = {};

            var fields = Table.value[h].value;

            // loop every filed in This table
            for (var key in thisTableFields) {
                if (!thisTableFields.hasOwnProperty(key)) {continue; }
                row.value[key] = {};

                for (var m = 1; m < TABLE_ROW_NUM + 1; m++) {
                    var copyFromField = conf['table_row' + m]['column1'];
                    var copyToField = conf['table_row' + m]['column2'];

                    if (key === copyToField) {
                        if (thisTableFields.hasOwnProperty(copyToField)) {
                            row.value[key].value = escapeHtml(fields[copyFromField].value);
                            row.value[key].type = escapeHtml(thisTableFields[key].type);
                        }
                        break;
                    }else {
                        row.value[key].value = "";
                        row.value[key].type = escapeHtml(thisTableFields[key].type);
                    }
                }
            }
            newrow.push(row);
        }
        thisRecord.record.Table.value = newrow;
        kintone.app.record.set(thisRecord);
    }




    // Enable mapping field
    var events = ['app.record.create.show', 'app.record.edit.show'];
    kintone.events.on(events, function(event) {
        var record = event.record;
        for (var h = 1; h < ENABLE_ROW_NUM + 1; h++) {
            var fieldCode = conf['enablefield_row' + h]['column1'];
            if (fieldCode) {
              record[fieldCode].disabled = false;
            }
        }
        return event;
    });



    //get data from form
    var changeEventField = conf["changeEventField"];
    if (changeEventField === "") {return false; }
    var ChangeEvents = ["app.record.create.change." + changeEventField,
                        "app.record.edit.change." + changeEventField];
    kintone.events.on(ChangeEvents, function(event) {
        var record = event.record;
        if (record[changeEventField].value === undefined) {
            return;
        }

        var body = {
            'app': kintone.app.getId()
        };
        kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', body, function(resp) {
            var lookup_field = conf['lookupField'];
            var relatedAppId = resp.properties[lookup_field].lookup.relatedApp.app;
            var relatedRecId = record[changeEventField].value;
            kintone.api(kintone.api.url('/k/v1/record', true),
            'GET', {'app': relatedAppId, 'id': relatedRecId}, function(rec) {
                setTableData(rec.record.Table);
            });
        });
    });


})(jQuery, kintone.$PLUGIN_ID);
