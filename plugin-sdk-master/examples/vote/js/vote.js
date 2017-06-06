jQuery.noConflict();

(function(pluginId, $) {
    "use strict";

    var APPID = kintone.app.getId();
    var config = kintone.plugin.app.getConfig(pluginId);
    var VOTE_FIELD = config['vote_field'];
    var VOTE_COUNT_FIELD = config['vote_count_field'];



    function getRecordField() {
        var d = new $.Deferred();
        kintone.api(kintone.api.url('/k/v1/form', true), 'GET', {'app': APPID}, function(evt) {
            var found = $.grep(evt.properties, function(field) {
                return field['type'] === 'RECORD_NUMBER';
            });
            if (found.length === 0) {
                alert('未找到记录编号字段。需要在表单中设置记录编号字段才可使用顶！插件。');
                d.reject();
            } else {
                var code = found[0]['code'];
                d.resolve(code);
            }
        });
        return d.promise();
    }

    function VoteModel(record) {
        var recordId = Number(record['$id']['value']);
        var voteUsers = record[VOTE_FIELD]['value'];
        var revision = Number(record['$revision']['value']);

        function createErrorMessage(e) {
            var message;
            switch (e['code']) {
                case 'GAIA_CO02':
                    message = '在点顶的同时有其他人更新了记录，请再点一次。';
                    break;
                case 'CB_NO02':
                    message = '无记录编辑权限的用户不可以点顶。详情请咨询应用管理员。';
                    break;
                default:
                    message = '出错了！详情请咨询应用管理员。';
                    break;
            }
            message += '(id:' + e['id'] + ', code: ' + e['code'] + ')';
            return message;
        }

        return {
            getRecordId: function() {
                return recordId;
            },
            getVoteUsers: function() {
                return voteUsers;
            },
            getRevision: function() {
                return revision;
            },
            countVoteUsers: function() {
                return voteUsers.length;
            },
            isLoginUserVoted: function() {
                return $.grep(voteUsers, function(user) {
                    return user['code'] === kintone.getLoginUser().code;
                }).length !== 0;
            },
            toggleLoginUser: function() {
                var that = this;
                var promise = this.fetch().then(function() {
                    if (that.isLoginUserVoted()) {
                        voteUsers = $.grep(voteUsers, function(user) {
                            return user['code'] !== kintone.getLoginUser().code;
                        });
                    } else {
                        voteUsers.push({
                            'code': kintone.getLoginUser().code
                        });
                    }
                }).then(function() {
                    return that.update();
                });
                return promise;
            },
            fetch: function() {
                var d = new $.Deferred();
                kintone.api(kintone.api.url('/k/v1/record', true), 'GET', {
                    'app': APPID,
                    'id': recordId
                }, function(evt) {
                    voteUsers = evt['record'][VOTE_FIELD]['value'];
                    revision = evt['record']['$revision']['value'];
                    d.resolve();
                });
                return d.promise();
            },
            update: function() {
                var d = new $.Deferred();
                var rec = {};
                rec[VOTE_FIELD] = {'value': voteUsers};
                rec[VOTE_COUNT_FIELD] = {'value': voteUsers.length};
                kintone.api(kintone.api.url('/k/v1/record', true), 'PUT', {
                    'app': APPID,
                    'id': recordId,
                    'record': rec,
                    'revision': revision
                }, d.resolve, function(e) {
                    alert(createErrorMessage(e));
                });
                return d.promise();
            }
        };
    }

    function fetchVoteModel() {
        var d = new $.Deferred();
        var id = kintone.app.record.getId();
        kintone.api(kintone.api.url('/k/v1/record', true), 'GET', {
            'app': APPID,
            'id': id
        }, function(evt) {
            var record = {
                '$id': { 'value': id },
                '$revision': evt['record']['$revision']
            };
            record[VOTE_FIELD] = evt['record'][VOTE_FIELD];
            d.resolve(new VoteModel(record));
        });
        return d.promise();
    }

    function fetchVoteModels() {
        var d = new $.Deferred();

        var rawQuery = kintone.app.getQuery().match(/(.*)(limit .+)/);
        var query;
        if (rawQuery[1] === '') {
            query = 'order by 创建时间 desc ' + rawQuery[2];
        } else {
            query = rawQuery[1] + ', 创建时间 desc ' + rawQuery[2];
        }

        kintone.api('/k/v1/records', 'GET', {
            'app': APPID,
            'query': query,
            'fields': ['$id', VOTE_FIELD, '$revision']
        }, function(evt) {
            var models = [];
            $.each(evt['records'], function(i, record) {
                var model = new VoteModel(record);
                models.push(model);
            });
            d.resolve(models);
        });
        return d.promise();
    }


    function VoteView(model) {
        var $element = $('<span class="vote-plugin-show">');
        var clickable = true;

        function updateImg(voted) {
            $element.find('.vote-plugin-img').toggleClass('vote-plugin-voted', voted);
        }

        function updateCounterEl(usercount) {
            $element.find('.vote-plugin-count').remove();
            if (usercount !== 0) {
                $element.append($('<span>').addClass('vote-plugin-count').text(usercount));
            }
        }

        function handleClick() {
            if (!clickable) {
                return;
            }
            clickable = false;
            model.toggleLoginUser().then(function() {
                updateImg(model.isLoginUserVoted());
                updateCounterEl(model.countVoteUsers());
                clickable = true;
            });
        }

        function renderImgAndCounter() {
            // createImg
            var $imgEl = $('<span class="vote-plugin-img">');
            $element.append($imgEl);
            updateImg(model.isLoginUserVoted());

            // createCounter
            updateCounterEl(model.countVoteUsers());

            $element.click(handleClick);
        }


        return {
            append: function($parentEl) {
                $parentEl.append($element);
                renderImgAndCounter();
            },

            prepend: function($parentEl) {
                $parentEl.prepend($element);
                renderImgAndCounter();
            }
        };
    }




    kintone.events.on(['app.record.create.show', 'app.record.index.edit.show', 'app.record.edit.show'], function(evt) {
        var record = evt['record'];
        var users = record[VOTE_FIELD].value;
        if (evt.reuse) {
            for (var i = 0; i < users.length; i++) {
                record[VOTE_FIELD].value = [];
            }
            record[VOTE_COUNT_FIELD].value = "";
        }else {
            record[VOTE_FIELD]['disabled'] = true;
            record[VOTE_COUNT_FIELD]['disabled'] = true;
        }
        return evt;
    });

    kintone.events.on('app.record.index.show', function() {
        var RECORD_FIELD;
        getRecordField().then(function(code) {
            RECORD_FIELD = code;
            return fetchVoteModels();
        }).then(function(voteModels) {
            var cellEls = $(kintone.app.getFieldElements(RECORD_FIELD));
            cellEls.each(function() {
                var recordId = Number($(this).text().split('-').pop());
                var vote_Model = $.grep(voteModels, function(voteModel) {
                    return voteModel.getRecordId() === recordId;
                })[0];

                if (vote_Model !== null) {
                    var $parentEl = $(this).find("*").contents().filter(function() {
                        return this.nodeType === 3;
                    }).parent();
                    new VoteView(vote_Model).append($parentEl);
                }
            });
        });
    });

    kintone.events.on('app.record.detail.show', function(appId, record, recordId) {
        fetchVoteModel().then(function(voteModel) {
            var $labelEl = $(kintone.app.record.getFieldElement(VOTE_FIELD));
            new VoteView(voteModel).prepend($labelEl);
        });
    });
})(kintone.$PLUGIN_ID, jQuery);
