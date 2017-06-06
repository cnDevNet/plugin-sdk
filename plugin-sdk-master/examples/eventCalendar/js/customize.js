jQuery.noConflict();
(function($, PLUGIN_ID) {
    "use strict";

    // 在日历上更改活动时间时的更新处理
    function putRecord(event) {
        var putConfig = kintone.plugin.app.getConfig(PLUGIN_ID);
        var stdtKey = putConfig.start_datetime;
        var eddtKey = putConfig.end_datetime;

        kintone.api('/k/v1/record', 'PUT', {
            "app": kintone.app.getId(),
            "id": event.rec,
            "record": (function() {
                var param = {};
                param[stdtKey] = {
                    "value": moment(event.start).add(-9, 'hours').format('YYYY-MM-DDTHH:mm:ssZ')
                };
                param[eddtKey] = {
                    "value": moment(event.end).add(-9, 'hours').format('YYYY-MM-DDTHH:mm:ssZ')
                };
                return param;
            })()
        });
    }

    // 记录列表页面显示事件
    kintone.events.on('app.record.index.show', function(event) {
        var config = kintone.plugin.app.getConfig(PLUGIN_ID);
        if (!config) {
            return false;
        }

        var evTitle = config.name;
        var evStart = config.start_datetime;
        var evEnd = config.end_datetime;

        var startDate;
        var endDate;

        var records = event.records;
        var recEvents = [];
        // 只有当应用中有记录时才循环
        if (records.length !== 0) {
            for (var i = 0; i < records.length; i++) {
                startDate = moment(records[i][evStart].value);
                endDate = moment(records[i][evEnd].value);

                // 活动背景色设置错误或流程管理无效时，显示默认的蓝色
                var eventColor = "#0000ff";
                // 活动背景色设置处理
                if (typeof (records[i].状态) !== 'undefined') {
                    var eventStatus = records[i].状态.value;

                    for (var k = 1; k < 6; k++) {
                        var stsPropName = "status" + k;
                        var clrPropName = "color" + k;
                        var status = config[stsPropName];
                        if (status === eventStatus) {
                            eventColor = config[clrPropName];
                            break;
                        }
                    }
                }
                recEvents.push({
                    title: records[i][evTitle].value,
                    start: startDate.format("YYYY-MM-DD HH:mm:ss"),
                    end: endDate.format("YYYY-MM-DD HH:mm:ss"),
                    url: location.protocol + '//' + location.hostname + '/k/' +
                        kintone.app.getId() + '/show#record=' + records[i].$id.value,
                    rec: records[i].$id.value,
                    backgroundColor: eventColor,
                    borderColor: eventColor
                });
            }
        }


        // 日历的设置
        $('#calendar').fullCalendar({
            lang: 'ja',
            theme: false,
            // 顶部的按钮和标题
            header: {
                left: 'prev,next, today',
                center: 'title',
                right: ' month,agendaWeek,agendaDay'
            },
            // 各日历的每天表达形式
            columnFormat: {
                month: 'ddd',
                week: 'M/D[(]ddd[)]',
                day: 'M/D[(]ddd[)]'
            },
            // 各日历的标题
            titleFormat: {
                month: 'YYYY年M月',
                week: "YYYY年 M月 D日",
                day: 'YYYY年 M月 D日[(]ddd[)]'
            },
            // 按钮文字的表述
            buttonText: {
                prev: '＜',
                next: '＞',
                today: '今日',
                month: '月',
                week: '週',
                day: '日'
            },
            // 从周日开始的日历
            firstDay: '0',
            // 显示周末（周六周日）
            weekends: true,
            // 默认为按月显示的日历
            defaultView: 'month',
            // 按月显示
            monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
            monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
            // 周几的表达
            dayNames: ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
            dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
            // 各日历的每个小时的表述
            axisFormat: 'H:mm',
            timeFormat: 'H:mm',
            //在日历上编辑活动
            editable: true,
            durationEditable: true,
            startEditable: true,
            unselectAuto: true,
            unselectCancel: '',
            dragRevertDuration: 100,
            // 不显示整天预订
            allDaySlot: false,
            // 从0点开始算新一天的日历
            nextDayThreshold: '00:00:00',
            // 日历的高度
            height: 700,
            contentHeight: 600,
            // 时间轴的单位
            slotDuration: '01:00:00',
            // 以几分为单位移动横条
            snapDuration: '01:00:00',
            // 设置只有按天显示的日历显示详情
            views: {
                day: {
                    slotDuration: '00:30:00',
                    snapDuration: '00:30:00',
                    scrollTime: '06:00:00'
                }
            },
            minTime: '00:00:00',
            maxTime: '24:00:00',
            // 初始时间位置
            scrollTime: '00:00:00',
            // 按月显示的活动如果很多，省略
            eventLimit: true,
            eventLimitText: '查看全部',
            eventResize: function(ev, delta, revertFunc, jsEvent, ui, view) {
                putRecord(ev);
                $('#calendar').fullCalendar('unselect');
            },
            eventDrop: function(ev, delta, revertFunc, jsEvent, ui, view) {
                putRecord(ev);
                $('#calendar').fullCalendar('unselect');
            },
            eventSources: [{
                events: recEvents
            }]
        });
        return event;
    });

    // 记录添加・编辑页面・列表编辑事件
    kintone.events.on(['app.record.create.submit', 'app.record.edit.submit',
        'app.record.index.edit.submit'], function(event) {
        var record = event.record;

        var config = kintone.plugin.app.getConfig(PLUGIN_ID);
        if (!config) {
            return false;
        }

        var evTitleVal = record[config.name].value;
        var evStartVal = record[config.start_datetime].value;
        var evEndVal = record[config.end_datetime].value;

        // 活动标题・活动开始/结束时间不可不输入
        if (!evTitleVal || !evStartVal || !evEndVal) {
            event.error = "有为输入的项目";
            if (!evTitleVal) {
                record[config.name].error = "必填";
            }
            if (!evStartVal) {
                record[config.start_datetime].error = "必填";
            }
            if (!evEndVal) {
                record[config.end_datetime].error = "必填";
            }
        // 开始时间晚于结束时间时报错
        } else if (moment(evStartVal).format("X") > moment(evEndVal).format("X")) {
            event.error = "开始时间晚于结束时间";
            record[config.start_datetime].error = "必须早于结束时间";
            record[config.end_datetime].error = "必须晚于开始时间";
        // 开始时间和结束时间一样时报错（FullCalendar规格上的问题）
        } else if (moment(evStartVal).format("X") === moment(evEndVal).format("X")) {
            event.error = "开始时间和结束时间必须间隔1分钟以上";
            record[config.start_datetime].error = "必须早于结束时间";
            record[config.end_datetime].error = "必须晚于开始时间";
        }

        return event;

    });

})(jQuery, kintone.$PLUGIN_ID);
