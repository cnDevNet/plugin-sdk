(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var ErrorHandler = {
  apiError: function apiError(resp) {
    var messages = "添加或更新时发生错误。请重新检查应用的设置\n";
    var bulkErrors = resp.results.filter(function (error) {
      return error.code;
    });
    bulkErrors.forEach(function (bulkError) {
      Object.keys(bulkError.errors).forEach(function (key, i) {
        messages += key + ": " + bulkError.errors[key].messages.join(',') + "\n";
      });
    });
    alert(messages);
  }
};

exports.default = ErrorHandler;

},{}],2:[function(require,module,exports){
'use strict';

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _ErrorHandler = require('./ErrorHandler');

var _ErrorHandler2 = _interopRequireDefault(_ErrorHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(function (PLUGIN_ID) {
  kintone.events.on('app.record.index.show', function (event) {

    var config = kintone.plugin.app.getConfig(PLUGIN_ID);
    if (!config) return false;
    console.dir(config);

    var container = document.getElementById(config.elementId);

    if (!container) return false;

    _utils2.default.setExcpectField();

    var colHeaders = _utils2.default.getColumnsFromConfig(config);
    var hot;

    _utils2.default.getColumnData(colHeaders).then(function (columnData) {
      hot = new Handsontable(container, {
        // 这个时候不输入数据，而是让之后再读入。（因为数据更新时也要读入）
        data: [],
        minSpareRows: 100,
        colHeaders: colHeaders,
        contextMenu: ["remove_row"],
        columns: columnData,

        // 删除电子表格上的记录时调用的事件
        // 参数index是要删除的行
        // 参数amount是要删除的行数
        beforeRemoveRow: function beforeRemoveRow(index, amount) {
          // 删除kintone的记录
          _utils2.default.deleteRecords(hot.getSourceData(), index, amount, function (resp) {
            console.dir(resp);
            _utils2.default.getRecords(function (resp) {
              hot.loadData(resp.records);
            });
          }, function (resp) {
            console.dir(resp);
          });
        },

        // 编辑电子表格上的记录时调用的事件
        afterChange: function afterChange(change, source) {
          console.log(source);

          // 数据读入时结束事件
          if (source === 'loadData') {
            return;
          }

          // 更新或添加kintone的记录
          _utils2.default.saveRecords(hot.getSourceData(), change, function (resp) {
            console.dir(resp);
            _utils2.default.getRecords(function (resp) {
              // 更新后重新读入数据
              hot.loadData(resp.records);
            }, function (resp) {
              // 记录获取失败时调用
              console.dir(resp);
            });
          }, function (resp) {
            // 更新条件时调用
            throw new _ErrorHandler2.default.apiError(resp);
          });
        }
      });
      // 获取记录并应用到handsontable
      _utils2.default.getRecords(function (resp) {
        hot.loadData(resp.records);
        autoload();
      });

      // 定期重新获取kintone上的数据
      var autoload = function autoload() {
        setTimeout(function () {
          _utils2.default.getRecords(function (resp) {
            hot.loadData(resp.records);
          });
          autoload();
        }, 10000); // 10秒。应用API调用次数有上限，请根据必要进行更改。
      };
    });
  });
})(kintone.$PLUGIN_ID);

},{"./ErrorHandler":1,"./utils":3}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var utils = {
  exceptField: null,

  // 获取要排除的字段代码
  setExcpectField: function setExcpectField() {
    var exceptField = [];
    kintone.api('/k/v1/app/form/fields', 'GET', { app: kintone.app.getId() }, function (resp) {
      var properties = resp.properties;
      for (var prop in properties) {
        if (['RECORD_NUMBER', 'CREATED_TIME', 'UPDATED_TIME', 'CREATOR', 'MODIFIER', 'STATUS', 'STATUS_ASSIGNEE'].indexOf(properties[prop].type) !== -1) {
          exceptField.push(properties[prop].code);
        }
      }
      utils.exceptField = exceptField;
    });
  },

  // 更新或添加kintone的记录时，类似$id之类的无法更新的字段需要排除，这时要使用的method
  setParams: function setParams(record) {
    var result = {};
    for (var prop in record) {
      if (utils.exceptField.indexOf(prop) === -1) {
        result[prop] = record[prop];
      }
    }
    return result;
  },

  // 获取kintone的记录时用的method
  getRecords: function getRecords(callback, errorCallback) {
    kintone.api('/k/v1/records', 'GET', { app: kintone.app.getId(), query: 'order by $id asc limit 500' }, function (resp) {
      callback(resp);
    }, function (resp) {
      errorCallback(resp);
    });
  },

  // 更新或添加kintone记录所用的method
  saveRecords: function saveRecords(records, changedDatas, callback, errorCallback) {
    var requests = [];
    var updateRecords = [];
    var insertRecords = [];
    var changedRows = [];
    var i;

    // 从发生更改的单元格数列中取出有变更的行
    for (i = 0; i < changedDatas.length; i++) {
      changedRows.push(changedDatas[i][0]);
    }
    // 排除发生变更的行的重复编号
    changedRows = changedRows.filter(function (x, i, self) {
      return self.indexOf(x) === i;
    });

    // 判断发生变更的行是添加记录还是更改记录，然后做成查询
    for (i = 0; i < changedRows.length; i++) {
      if (records[changedRows[i]]["$id"].value === null) {
        insertRecords.push(utils.setParams(records[changedRows[i]]));
      } else {
        updateRecords.push({
          id: records[changedRows[i]]["$id"].value,
          record: utils.setParams(records[changedRows[i]])
        });
      }
    }

    // 更新用bulkRequest
    requests.push({
      method: "PUT",
      api: "/k/v1/records.json",
      payload: {
        app: kintone.app.getId(),
        records: updateRecords
      }
    });

    // 添加用bulkRequest
    requests.push({
      method: "POST",
      api: "/k/v1/records.json",
      payload: {
        app: kintone.app.getId(),
        records: insertRecords
      }
    });

    // 用bulkrequest批量添加、更新。
    // 失败时回滚。
    kintone.api('/k/v1/bulkRequest', 'POST', { requests: requests }, function (resp) {
      console.dir(requests);
      console.dir(resp);
      callback(resp);
    }, function (resp) {
      if ((typeof resp === 'undefined' ? 'undefined' : _typeof(resp)) === "object") errorCallback(resp); // 因某些原因而返回2次应答（第２回是String）时的类型判断
    });
  },

  //删除kintone的记录所用的method
  deleteRecords: function deleteRecords(records, index, amount, callback, errorCallback) {
    var i;
    var ids = [];
    for (i = index; i < index + amount; i++) {
      ids.push(records[i]["$id"].value);
    }
    kintone.api('/k/v1/records', 'DELETE', { app: kintone.app.getId(), ids: ids }, function (resp) {
      callback(resp);
    }, function (resp) {
      errorCallback(resp);
    });
  },

  getColumnsFromConfig: function getColumnsFromConfig(config) {
    var result = [];
    Object.keys(config).forEach(function (key) {
      if (key.substring(0, 6) === "column") {
        result.push(config[key]);
      }
    });
    return result;
  },

  getColumnData: function getColumnData(columns) {
    return utils.getFieldsInfo().then(function (resp) {
      return columns.map(function (column) {
        var columnData = { data: column + '.value' };

        // if type is DROP_DOWN, add type and source property
        if (resp.properties[column].type === "DROP_DOWN" || resp.properties[column].type === "RADIO_BUTTON") {
          columnData.type = "dropdown";
          columnData.source = Object.keys(resp.properties[column].options);
        }
        return columnData;
      });
    });
  },

  getFieldsInfo: function getFieldsInfo() {
    return kintone.api('/k/v1/app/form/fields', 'GET', { app: kintone.app.getId() });
  }
};

exports.default = utils;

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvRXJyb3JIYW5kbGVyLmpzIiwic3JjL2pzL2Rlc2t0b3AuanMiLCJzcmMvanMvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztBQ0FBLElBQUksZUFBZTtBQUNqQixZQUFVLGtCQUFDLElBQUQsRUFBVTtBQUNsQixRQUFJLFdBQVcsdUNBQVgsQ0FEYztBQUVsQixRQUFJLGFBQWEsS0FBSyxPQUFMLENBQWEsTUFBYixDQUFvQixVQUFDLEtBQUQsRUFBVztBQUM3QyxhQUFPLE1BQU0sSUFBTixDQURzQztLQUFYLENBQWpDLENBRmM7QUFLbEIsZUFBVyxPQUFYLENBQW1CLFVBQUMsU0FBRCxFQUFlO0FBQ2hDLGFBQU8sSUFBUCxDQUFZLFVBQVUsTUFBVixDQUFaLENBQThCLE9BQTlCLENBQXNDLFVBQUMsR0FBRCxFQUFNLENBQU4sRUFBWTtBQUNoRCxvQkFBZSxhQUFRLFVBQVUsTUFBVixDQUFpQixHQUFqQixFQUFzQixRQUF0QixDQUErQixJQUEvQixDQUFvQyxHQUFwQyxRQUF2QixDQURnRDtPQUFaLENBQXRDLENBRGdDO0tBQWYsQ0FBbkIsQ0FMa0I7QUFVbEIsVUFBTSxRQUFOLEVBVmtCO0dBQVY7Q0FEUjs7a0JBZVc7Ozs7Ozs7Ozs7Ozs7OztBQ1pmLENBQUMsVUFBQyxTQUFELEVBQWU7QUFDZCxVQUFRLE1BQVIsQ0FBZSxFQUFmLENBQWtCLHVCQUFsQixFQUEyQyxVQUFDLEtBQUQsRUFBVzs7QUFFcEQsUUFBSSxTQUFTLFFBQVEsTUFBUixDQUFlLEdBQWYsQ0FBbUIsU0FBbkIsQ0FBNkIsU0FBN0IsQ0FBVCxDQUZnRDtBQUdwRCxRQUFJLENBQUMsTUFBRCxFQUFTLE9BQU8sS0FBUCxDQUFiO0FBQ0EsWUFBUSxHQUFSLENBQVksTUFBWixFQUpvRDs7QUFNcEQsUUFBSSxZQUFZLFNBQVMsY0FBVCxDQUF3QixPQUFPLFNBQVAsQ0FBcEMsQ0FO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RUFBUztBQUNuQyxVQUFJLElBQUksU0FBSixDQUFjLENBQWQsRUFBaUIsQ0FBakIsTUFBd0IsUUFBeEIsRUFBa0M7QUFDcEMsZUFBTyxJQUFQLENBQVksT0FBTyxHQUFQLENBQVosRUFEb0M7T0FBdEM7S0FEMEIsQ0FBNUIsQ0FGZ0M7QUFPaEMsV0FBTyxNQUFQLENBUGdDO0dBQVo7O0FBVXRCLGlCQUFlLHVCQUFDLE9BQUQsRUFBYTtBQUMxQixXQUFPLE1BQU0sYUFBTixHQUFzQixJQUF0QixDQUEyQixVQUFDLElBQUQsRUFBVTtBQUMxQyxhQUFPLFFBQVEsR0FBUixDQUFZLFVBQUMsTUFBRCxFQUFZO0FBQzdCLFlBQUksYUFBYSxFQUFDLE1BQVMsaUJBQVQsRUFBZDs7O0FBRHlCLFlBSXpCLEtBQUssVUFBTCxDQUFnQixNQUFoQixFQUF3QixJQUF4QixLQUFpQyxXQUFqQyxJQUFnRCxLQUFLLFVBQUwsQ0FBZ0IsTUFBaEIsRUFBd0IsSUFBeEIsS0FBaUMsY0FBakMsRUFBaUQ7QUFDbkcscUJBQVcsSUFBWCxHQUFrQixVQUFsQixDQURtRztBQUVuRyxxQkFBVyxNQUFYLEdBQW9CLE9BQU8sSUFBUCxDQUFZLEtBQUssVUFBTCxDQUFnQixNQUFoQixFQUF3QixPQUF4QixDQUFoQyxDQUZtRztTQUFyRztBQUlBLGVBQU8sVUFBUCxDQVI2QjtPQUFaLENBQW5CLENBRDBDO0tBQVYsQ0FBbEMsQ0FEMEI7R0FBYjs7QUFlZixpQkFBZSx5QkFBTTtBQUNuQixXQUFPLFFBQVEsR0FBUixDQUFZLHVCQUFaLEVBQXFDLEtBQXJDLEVBQTRDLEVBQUMsS0FBSyxRQUFRLEdBQVIsQ0FBWSxLQUFaLEVBQUwsRUFBN0MsQ0FBUCxDQURtQjtHQUFOO0NBcEpiOztrQkF5SlciLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIEVycm9ySGFuZGxlciA9IHtcbiAgYXBpRXJyb3I6IChyZXNwKSA9PiB7XG4gICAgdmFyIG1lc3NhZ2VzID0gXCLnmbvpjLLjg7vmm7TmlrDmmYLjgavjgqjjg6njg7zjgYznmbrnlJ/jgZfjgabjgYTjgb7jgZnjgILjgqLjg5fjg6rjga7oqK3lrprjgpLopovjgarjgYrjgZfjgabjgY/jgaDjgZXjgYRcXG5cIjtcbiAgICB2YXIgYnVsa0Vycm9ycyA9IHJlc3AucmVzdWx0cy5maWx0ZXIoKGVycm9yKSA9PiB7XG4gICAgICAgcmV0dXJuIGVycm9yLmNvZGVcbiAgICB9KTtcbiAgICBidWxrRXJyb3JzLmZvckVhY2goKGJ1bGtFcnJvcikgPT4ge1xuICAgICAgT2JqZWN0LmtleXMoYnVsa0Vycm9yLmVycm9ycykuZm9yRWFjaCgoa2V5LCBpKSA9PiB7XG4gICAgICAgIG1lc3NhZ2VzICs9IGAke2tleX06ICR7YnVsa0Vycm9yLmVycm9yc1trZXldLm1lc3NhZ2VzLmpvaW4oJywnKX1cXG5gO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgYWxlcnQobWVzc2FnZXMpO1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBFcnJvckhhbmRsZXI7XG4iLCJpbXBvcnQgdSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCBlIGZyb20gJy4vRXJyb3JIYW5kbGVyJztcblxuKChQTFVHSU5fSUQpID0+IHtcbiAga2ludG9uZS5ldmVudHMub24oJ2FwcC5yZWNvcmQuaW5kZXguc2hvdycsIChldmVudCkgPT4ge1xuXG4gICAgdmFyIGNvbmZpZyA9IGtpbnRvbmUucGx1Z2luLmFwcC5nZXRDb25maWcoUExVR0lOX0lEKTtcbiAgICBpZiAoIWNvbmZpZykgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnNvbGUuZGlyKGNvbmZpZyk7XG5cbiAgICB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29uZmlnLmVsZW1lbnRJZCk7XG5cbiAgICBpZiAoIWNvbnRhaW5lcikgcmV0dXJuIGZhbHNlO1xuXG4gICAgdS5zZXRFeGNwZWN0RmllbGQoKTtcblxuICAgIHZhciBjb2xIZWFkZXJzID0gdS5nZXRDb2x1bW5zRnJvbUNvbmZpZyhjb25maWcpO1xuICAgIHZhciBob3Q7XG5cbiAgICB1LmdldENvbHVtbkRhdGEoY29sSGVhZGVycykudGhlbigoY29sdW1uRGF0YSkgPT4ge1xuICAgICAgaG90ID0gbmV3IEhhbmRzb250YWJsZShjb250YWluZXIsIHtcbiAgICAgICAgLy8g44GT44Gu5pmC54K544Gn44GvZGF0YeOBr+WFpeWKm+OBm+OBmuOAgeOBguOBqOOBi+OCieiqreOBv+i+vOOBvuOBm+OCi+OCiOOBhuOBq+OBmeOCi+OAgu+8iOODh+ODvOOCv+abtOaWsOaZguOCguWGjeiqreOBv+i+vOOBv+OBleOBm+OBn+OBhOOBn+OCge+8iVxuICAgICAgICBkYXRhOiBbXSxcbiAgICAgICAgbWluU3BhcmVSb3dzOiAxMDAsXG4gICAgICAgIGNvbEhlYWRlcnM6IGNvbEhlYWRlcnMsXG4gICAgICAgIGNvbnRleHRNZW51OiBbXCJyZW1vdmVfcm93XCJdLFxuICAgICAgICBjb2x1bW5zOiBjb2x1bW5EYXRhLFxuXG4gICAgICAgIC8vIOOCueODl+ODrOODg+ODiOOCt+ODvOODiOS4iuOBruODrOOCs+ODvOODieOCkuWJiumZpOOBl+OBn+OBqOOBjeOBq+WRvOOBs+WHuuOBleOCjOOCi+OCpOODmeODs+ODiFxuICAgICAgICAvLyDlvJXmlbBpbmRleOOBr+WJiumZpOOBmeOCi+ihjFxuICAgICAgICAvLyDlvJXmlbBhbW91bnTjga/liYrpmaTjgZnjgovooYzmlbBcbiAgICAgICAgYmVmb3JlUmVtb3ZlUm93OiAoaW5kZXgsIGFtb3VudCkgPT4ge1xuICAgICAgICAgIC8vIGtpbnRvbmXjga7jg6zjgrPjg7zjg4njgpLliYrpmaTjgZnjgotcbiAgICAgICAgICB1LmRlbGV0ZVJlY29yZHMoaG90LmdldFNvdXJjZURhdGEoKSwgaW5kZXgsIGFtb3VudCxcbiAgICAgICAgICAgIChyZXNwKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZGlyKHJlc3ApO1xuICAgICAgICAgICAgICB1LmdldFJlY29yZHMoKHJlc3ApID0+IHtcbiAgICAgICAgICAgICAgICBob3QubG9hZERhdGEocmVzcC5yZWNvcmRzKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgKHJlc3ApID0+IHtcbiAgICAgICAgICAgICAgY29uc29sZS5kaXIocmVzcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvLyDjgrnjg5fjg6zjg4Pjg4jjgrfjg7zjg4jkuIrjga7jg6zjgrPjg7zjg4njgYznt6jpm4bjgZXjgozjgZ/jgajjgY3jgavlkbzjgbPlh7rjgZXjgozjgovjgqTjg5njg7Pjg4hcbiAgICAgICAgYWZ0ZXJDaGFuZ2U6IChjaGFuZ2UsIHNvdXJjZSkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKHNvdXJjZSk7XG5cbiAgICAgICAgICAvLyDjg4fjg7zjgr/oqq3jgb/ovrzjgb/mmYLjga/jgqTjg5njg7Pjg4jjgpLntYLkuoZcbiAgICAgICAgICBpZiAoc291cmNlID09PSAnbG9hZERhdGEnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8ga2ludG9uZeOBruODrOOCs+ODvOODieOCkuabtOaWsOOAgei/veWKoOOBmeOCi1xuICAgICAgICAgIHUuc2F2ZVJlY29yZHMoaG90LmdldFNvdXJjZURhdGEoKSwgY2hhbmdlLFxuICAgICAgICAgICAgKHJlc3ApID0+IHtcbiAgICAgICAgICAgICAgY29uc29sZS5kaXIocmVzcCk7XG4gICAgICAgICAgICAgIHUuZ2V0UmVjb3JkcygocmVzcCkgPT4ge1xuICAgICAgICAgICAgICAgICAgLy8g5pu05paw5b6M44CB44OH44O844K/44KS5YaN6Kqt44G/6L6844G/XG4gICAgICAgICAgICAgICAgICBob3QubG9hZERhdGEocmVzcC5yZWNvcmRzKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIChyZXNwKSA9PiB7XG4gICAgICAgICAgICAgICAgICAvLyDjg6zjgrPjg7zjg4nlj5blvpflpLHmlZfmmYLjgavlkbzjgbPlh7rjgZXjgozjgotcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZGlyKHJlc3ApO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIChyZXNwKSA9PiB7XG4gICAgICAgICAgICAgIC8vIOabtOaWsOODu+i/veWKoOaZguOBq+WRvOOBs+WHuuOBleOCjOOCi1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgZS5hcGlFcnJvcihyZXNwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgLy8g44Os44Kz44O844OJ44KS5Y+W5b6X44GX44GmaGFuZHNvbnRhYmxl44Gr5Y+N5pigXG4gICAgICB1LmdldFJlY29yZHMoKHJlc3ApID0+IHtcbiAgICAgICAgaG90LmxvYWREYXRhKHJlc3AucmVjb3Jkcyk7XG4gICAgICAgIGF1dG9sb2FkKCk7XG4gICAgICB9KTtcblxuICAgICAgLy8g5a6a5pyf55qE44Gra2ludG9uZeS4iuOBruODh+ODvOOCv+OCkuWGjeWPluW+l+OBmeOCi1xuICAgICAgdmFyIGF1dG9sb2FkID0gKCkgPT4ge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICB1LmdldFJlY29yZHMoKHJlc3ApID0+IHtcbiAgICAgICAgICAgIGhvdC5sb2FkRGF0YShyZXNwLnJlY29yZHMpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGF1dG9sb2FkKCk7XG4gICAgICAgIH0sIDEwMDAwKTsgLy8gMTDnp5LjgIJBUEnjga7lkbzjgbPlh7rjgZfmlbDjga7kuIrpmZDjgYzjgYLjgovjga7jgafjgIHlv4XopoHjgavlv5zjgZjjgablpInmm7TjgZfjgabjgY/jgaDjgZXjgYTjgIJcbiAgICAgIH07XG4gICAgfSk7XG4gIH0pO1xuXG59KShraW50b25lLiRQTFVHSU5fSUQpO1xuXG5cbiIsInZhciB1dGlscyA9IHtcbiAgZXhjZXB0RmllbGQ6IG51bGwsXG5cbiAgLy8g6Zmk5aSW44GZ44KL44G544GN44OV44Kj44O844Or44OJ44Kz44O844OJ44KS5Y+W5b6XXG4gIHNldEV4Y3BlY3RGaWVsZDogKCkgPT4ge1xuICAgIGxldCBleGNlcHRGaWVsZCA9IFtdO1xuICAgIGtpbnRvbmUuYXBpKCcvay92MS9hcHAvZm9ybS9maWVsZHMnLCAnR0VUJywge2FwcDoga2ludG9uZS5hcHAuZ2V0SWQoKX0sXG4gICAgKHJlc3ApID0+IHtcbiAgICAgIGxldCBwcm9wZXJ0aWVzID0gcmVzcC5wcm9wZXJ0aWVzO1xuICAgICAgZm9yIChsZXQgcHJvcCBpbiBwcm9wZXJ0aWVzKSB7XG4gICAgICAgIGlmIChbJ1JFQ09SRF9OVU1CRVInLCAnQ1JFQVRFRF9USU1FJywgJ1VQREFURURfVElNRScsICdDUkVBVE9SJywgJ01PRElGSUVSJywgJ1NUQVRVUycsICdTVEFUVVNfQVNTSUdORUUnXS5pbmRleE9mKHByb3BlcnRpZXNbcHJvcF0udHlwZSkgIT09IC0xKSB7XG4gICAgICAgICAgZXhjZXB0RmllbGQucHVzaChwcm9wZXJ0aWVzW3Byb3BdLmNvZGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB1dGlscy5leGNlcHRGaWVsZCA9IGV4Y2VwdEZpZWxkO1xuICAgIH0pO1xuICB9LFxuXG4gIC8vIGtpbnRvbmXjga7jg6zjgrPjg7zjg4nmm7TmlrDjg7vov73liqDmmYLjga/jgIEkaWTjgarjganjgqLjg4Pjg5fjg4fjg7zjg4jjgafjgY3jgarjgYTjg5XjgqPjg7zjg6vjg4njgYzjgYLjgovjga7jgafjgIHpmaTlpJbjgZnjgovjgZ/jgoHjga7jg6Hjgr3jg4Pjg4lcbiAgc2V0UGFyYW1zOiAocmVjb3JkKSA9PiB7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIGZvciAobGV0IHByb3AgaW4gcmVjb3JkKSB7XG4gICAgICBpZiAodXRpbHMuZXhjZXB0RmllbGQuaW5kZXhPZihwcm9wKSA9PT0gLTEpIHtcbiAgICAgICAgcmVzdWx0W3Byb3BdID0gcmVjb3JkW3Byb3BdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9LFxuXG4gIC8vIGtpbnRvbmXjga7jg6zjgrPjg7zjg4nlj5blvpfnlKjjg6Hjgr3jg4Pjg4lcbiAgZ2V0UmVjb3JkczogKGNhbGxiYWNrLCBlcnJvckNhbGxiYWNrKSA9PiB7XG4gICAga2ludG9uZS5hcGkoJy9rL3YxL3JlY29yZHMnLCAnR0VUJywge2FwcDoga2ludG9uZS5hcHAuZ2V0SWQoKSwgcXVlcnk6ICdvcmRlciBieSAkaWQgYXNjIGxpbWl0IDUwMCd9LFxuICAgICAgZnVuY3Rpb24ocmVzcCkge1xuICAgICAgICBjYWxsYmFjayhyZXNwKTtcbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbihyZXNwKSB7XG4gICAgICAgIGVycm9yQ2FsbGJhY2socmVzcCk7XG4gICAgICB9XG4gICAgKTtcbiAgfSxcblxuICAvLyBraW50b25l44Gu44Os44Kz44O844OJ5pu05paw44CB6L+95Yqg55So44Oh44K944OD44OJXG4gIHNhdmVSZWNvcmRzOiAocmVjb3JkcywgY2hhbmdlZERhdGFzLCBjYWxsYmFjaywgZXJyb3JDYWxsYmFjaykgPT4ge1xuICAgIHZhciByZXF1ZXN0cyA9IFtdO1xuICAgIHZhciB1cGRhdGVSZWNvcmRzID0gW107XG4gICAgdmFyIGluc2VydFJlY29yZHMgPSBbXTtcbiAgICB2YXIgY2hhbmdlZFJvd3MgPSBbXTtcbiAgICB2YXIgaTtcblxuICAgIC8vIOWkieabtOOBleOCjOOBn+OCu+ODq+OBrumFjeWIl+OBi+OCieOAgeWkieabtOOBjOOBguOBo+OBn+ihjOOBoOOBkeaKnOOBjeWHuuOBmVxuICAgIGZvcihpID0gMDsgaSA8IGNoYW5nZWREYXRhcy5sZW5ndGg7IGkrKykge1xuICAgICAgY2hhbmdlZFJvd3MucHVzaChjaGFuZ2VkRGF0YXNbaV1bMF0pO1xuICAgIH1cbiAgICAvLyDlpInmm7TjgYzjgYLjgaPjgZ/ooYznlarlj7fjga7ph43opIfjgpLmjpLpmaRcbiAgICBjaGFuZ2VkUm93cyA9IGNoYW5nZWRSb3dzLmZpbHRlcihmdW5jdGlvbiAoeCwgaSwgc2VsZikge1xuICAgICAgcmV0dXJuIHNlbGYuaW5kZXhPZih4KSA9PT0gaTtcbiAgICB9KTtcblxuICAgIC8vIOWkieabtOOBjOOBguOBo+OBn+ihjOOBi+OCieOAgeODrOOCs+ODvOODiei/veWKoOOBi+WkieabtOOBi+OCkuWIpOaWreOBl+OAgeOCr+OCqOODquOCkuOBpOOBj+OCi1xuICAgIGZvcihpID0gMDsgaSA8IGNoYW5nZWRSb3dzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAocmVjb3Jkc1tjaGFuZ2VkUm93c1tpXV1bXCIkaWRcIl0udmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgaW5zZXJ0UmVjb3Jkcy5wdXNoKFxuICAgICAgICAgIHV0aWxzLnNldFBhcmFtcyhyZWNvcmRzW2NoYW5nZWRSb3dzW2ldXSlcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHVwZGF0ZVJlY29yZHMucHVzaCh7XG4gICAgICAgICAgaWQ6IHJlY29yZHNbY2hhbmdlZFJvd3NbaV1dW1wiJGlkXCJdLnZhbHVlLFxuICAgICAgICAgIHJlY29yZDogdXRpbHMuc2V0UGFyYW1zKHJlY29yZHNbY2hhbmdlZFJvd3NbaV1dKVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDmm7TmlrDnlKhidWxrUmVxdWVzdFxuICAgIHJlcXVlc3RzLnB1c2goe1xuICAgICAgbWV0aG9kOiBcIlBVVFwiLFxuICAgICAgYXBpOiBcIi9rL3YxL3JlY29yZHMuanNvblwiLFxuICAgICAgcGF5bG9hZDoge1xuICAgICAgICBhcHA6IGtpbnRvbmUuYXBwLmdldElkKCksXG4gICAgICAgIHJlY29yZHM6IHVwZGF0ZVJlY29yZHNcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIOi/veWKoOeUqGJ1bGtSZXF1ZXN0XG4gICAgcmVxdWVzdHMucHVzaCh7XG4gICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgYXBpOiBcIi9rL3YxL3JlY29yZHMuanNvblwiLFxuICAgICAgcGF5bG9hZDoge1xuICAgICAgICBhcHA6IGtpbnRvbmUuYXBwLmdldElkKCksXG4gICAgICAgIHJlY29yZHM6IGluc2VydFJlY29yZHNcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIGJ1bGtyZXF1ZXN044Gn5LiA5ous44Gn6L+95Yqg44CB5pu05paw44CCXG4gICAgLy8g5aSx5pWX44GX44Gf5aC05ZCI44Gv44Ot44O844Or44OQ44OD44Kv44GV44KM44KL44CCXG4gICAga2ludG9uZS5hcGkoJy9rL3YxL2J1bGtSZXF1ZXN0JywgJ1BPU1QnLCB7cmVxdWVzdHM6IHJlcXVlc3RzfSxcbiAgICAgIChyZXNwKSA9PiB7XG4gICAgICAgIGNvbnNvbGUuZGlyKHJlcXVlc3RzKTtcbiAgICAgICAgY29uc29sZS5kaXIocmVzcCk7XG4gICAgICAgIGNhbGxiYWNrKHJlc3ApO1xuICAgICAgfSxcbiAgICAgIChyZXNwKSA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgcmVzcCA9PT0gXCJvYmplY3RcIikgZXJyb3JDYWxsYmFjayhyZXNwKTsgLy8g5L2V5pWF44GL77yS5Zue44Os44K544Od44Oz44K577yI77yS5Zue44KB44GvU3RyaW5n77yJ44GM6L+U44Gj44Gm44GP44KL44Gf44KB5Z6L5Yik5a6aXG4gICAgICB9XG4gICAgKTtcbiAgfSxcblxuICAvLyBraW50b25l44Gu44Os44Kz44O844OJ5YmK6Zmk55So44Oh44K944OD44OJXG4gIGRlbGV0ZVJlY29yZHM6IChyZWNvcmRzLCBpbmRleCwgYW1vdW50LCBjYWxsYmFjaywgZXJyb3JDYWxsYmFjaykgPT4ge1xuICAgIHZhciBpO1xuICAgIHZhciBpZHMgPSBbXTtcbiAgICBmb3IoaSA9IGluZGV4OyBpIDwgaW5kZXgrYW1vdW50OyBpKyspIHtcbiAgICAgIGlkcy5wdXNoKHJlY29yZHNbaV1bXCIkaWRcIl0udmFsdWUpO1xuICAgIH1cbiAgICBraW50b25lLmFwaSgnL2svdjEvcmVjb3JkcycsICdERUxFVEUnLCB7YXBwOiBraW50b25lLmFwcC5nZXRJZCgpLCBpZHM6IGlkc30sXG4gICAgICAocmVzcCkgPT4ge1xuICAgICAgICBjYWxsYmFjayhyZXNwKTtcbiAgICAgIH0sXG4gICAgICAocmVzcCkgPT4ge1xuICAgICAgICBlcnJvckNhbGxiYWNrKHJlc3ApO1xuICAgICAgfVxuICAgICk7XG4gIH0sXG5cbiAgZ2V0Q29sdW1uc0Zyb21Db25maWc6IChjb25maWcpID0+IHtcbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgT2JqZWN0LmtleXMoY29uZmlnKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgIGlmIChrZXkuc3Vic3RyaW5nKDAsIDYpID09PSBcImNvbHVtblwiKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKGNvbmZpZ1trZXldKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9LFxuXG4gIGdldENvbHVtbkRhdGE6IChjb2x1bW5zKSA9PiB7XG4gICAgcmV0dXJuIHV0aWxzLmdldEZpZWxkc0luZm8oKS50aGVuKChyZXNwKSA9PiB7XG4gICAgICByZXR1cm4gY29sdW1ucy5tYXAoKGNvbHVtbikgPT4ge1xuICAgICAgICB2YXIgY29sdW1uRGF0YSA9IHtkYXRhOiBgJHtjb2x1bW59LnZhbHVlYH07XG5cbiAgICAgICAgLy8gaWYgdHlwZSBpcyBEUk9QX0RPV04sIGFkZCB0eXBlIGFuZCBzb3VyY2UgcHJvcGVydHlcbiAgICAgICAgaWYgKHJlc3AucHJvcGVydGllc1tjb2x1bW5dLnR5cGUgPT09IFwiRFJPUF9ET1dOXCIgfHwgcmVzcC5wcm9wZXJ0aWVzW2NvbHVtbl0udHlwZSA9PT0gXCJSQURJT19CVVRUT05cIikge1xuICAgICAgICAgIGNvbHVtbkRhdGEudHlwZSA9IFwiZHJvcGRvd25cIjtcbiAgICAgICAgICBjb2x1bW5EYXRhLnNvdXJjZSA9IE9iamVjdC5rZXlzKHJlc3AucHJvcGVydGllc1tjb2x1bW5dLm9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb2x1bW5EYXRhO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0sXG5cbiAgZ2V0RmllbGRzSW5mbzogKCkgPT4ge1xuICAgIHJldHVybiBraW50b25lLmFwaSgnL2svdjEvYXBwL2Zvcm0vZmllbGRzJywgJ0dFVCcsIHthcHA6IGtpbnRvbmUuYXBwLmdldElkKCl9KTtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgdXRpbHM7XG4iXX0=
