(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

jQuery.noConflict();

(function ($, PLUGIN_ID) {

  var arrColumnConfig = function arrColumnConfig(config) {
    var result = [];
    Object.keys(config).forEach(function (key) {
      if (key.substring(0, 6) === "column") {
        result.push(config[key]);
      }
    });
    return result;
  };

  var config = kintone.plugin.app.getConfig(PLUGIN_ID);
  var fields = [];

  $(document).ready(function () {
    kintone.api(kintone.api.url('/k/v1/preview/form', true), 'GET', {
      'app': kintone.app.getId()
    }, function (resp) {
      fields = [];
      Object.keys(resp.properties).forEach(function (i, key) {
        if ('code' in resp.properties[key]) {
          fields.push(resp.properties[key].code);
        }
      });
      console.dir(fields);
      var options = fields.map(function (i, key) {
        return { text: fields[key], value: fields[key] };
      });

      var columns = arrColumnConfig(config);
      //未设置时使用默认设置
      if (columns.length <= 0) columns = [options[0].value];

      var vue = new Vue({
        el: '#form',
        data: {
          options: options,
          columns: columns,
          elementId: 'elementId' in config ? config.elementId : ''
        },
        methods: {
          delColumn: function delColumn(index) {
            this.columns.splice(index, 1);
          },
          addColumn: function addColumn(index) {
            this.columns.splice(index, 0, this.options[0].value);
          },
          registConfig: function registConfig() {
            var config = {};
            this.columns.forEach(function (column, i) {
              config['columns' + i] = column;
            });
            config['elementId'] = this.elementId;
            kintone.plugin.app.setConfig(config);
          },
          cancel: function cancel() {
            history.back();
          }
        }
      });
    });
  });
})(jQuery, kintone.$PLUGIN_ID);

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvY29uZmlnLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxPQUFPLFVBQVA7O0FBRUEsQ0FBQyxVQUFDLENBQUQsRUFBSSxTQUFKLEVBQWtCOztBQUVqQixNQUFJLGtCQUFrQixTQUFsQixlQUFrQixDQUFDLE1BQUQsRUFBWTtBQUNoQyxRQUFJLFNBQVMsRUFBVCxDQUQ0QjtBQUVoQyxXQUFPLElBQVAsQ0FBWSxNQUFaLEVBQW9CLE9BQXBCLENBQTRCLFVBQUMsR0FBRCxFQUFTO0FBQ25DLFVBQUksSUFBSSxTQUFKLENBQWMsQ0FBZCxFQUFpQixDQUFqQixNQUF3QixRQUF4QixFQUFrQztBQUNwQyxlQUFPLElBQVAsQ0FBWSxPQUFPLEdBQVAsQ0FBWixFQURvQztPQUF0QztLQUQwQixDQUE1QixDQUZnQztBQU9oQyxXQUFPLE1BQVAsQ0FQZ0M7R0FBWixDQUZMOztBQVlqQixNQUFJLFNBQVMsUUFBUSxNQUFSLENBQWUsR0FBZixDQUFtQixTQUFuQixDQUE2QixTQUE3QixDQUFULENBWmE7QUFhakIsTUFBSSxTQUFTLEVBQVQsQ0FiYTs7QUFlakIsSUFBRSxRQUFGLEVBQVksS0FBWixDQUFrQixZQUFNO0FBQ3RCLFlBQVEsR0FBUixDQUFZLFFBQVEsR0FBUixDQUFZLEdBQVosQ0FBZ0Isb0JBQWhCLEVBQXNDLElBQXRDLENBQVosRUFBeUQsS0FBekQsRUFBZ0U7QUFDOUQsYUFBTyxRQUFRLEdBQVIsQ0FBWSxLQUFaLEVBQVA7S0FERixFQUVHLFVBQUMsSUFBRCxFQUFVO0FBQ1gsZUFBUyxFQUFULENBRFc7QUFFWCxhQUFPLElBQVAsQ0FBWSxLQUFLLFVBQUwsQ0FBWixDQUE2QixPQUE3QixDQUFxQyxVQUFDLENBQUQsRUFBSSxHQUFKLEVBQVk7QUFDL0MsWUFBSSxVQUFVLEtBQUssVUFBTCxDQUFnQixHQUFoQixDQUFWLEVBQWdDO0FBQ2xDLGlCQUFPLElBQVAsQ0FBWSxLQUFLLFVBQUwsQ0FBZ0IsR0FBaEIsRUFBcUIsSUFBckIsQ0FBWixDQURrQztTQUFwQztPQURtQyxDQUFyQyxDQUZXO0FBT1gsY0FBUSxHQUFSLENBQVksTUFBWixFQVBXO0FBUVgsVUFBSSxVQUFVLE9BQU8sR0FBUCxDQUFXLFVBQUMsQ0FBRCxFQUFJLEdBQUosRUFBWTtBQUNuQyxlQUFPLEVBQUMsTUFBTSxPQUFPLEdBQVAsQ0FBTixFQUFtQixPQUFPLE9BQU8sR0FBUCxDQUFQLEVBQTNCLENBRG1DO09BQVosQ0FBckIsQ0FSTzs7QUFZWCxVQUFJLFVBQVUsZ0JBQWdCLE1BQWhCLENBQVY7O0FBWk8sVUFjUCxRQUFRLE1BQVIsSUFBa0IsQ0FBbEIsRUFBcUIsVUFBVSxDQUFDLFFBQVEsQ0FBUixFQUFXLEtBQVgsQ0FBWCxDQUF6Qjs7QUFFQSxVQUFJLE1BQU0sSUFBSSxHQUFKLENBQVE7QUFDaEIsWUFBSSxPQUFKO0FBQ0EsY0FBTTtBQUNKLG1CQUFTLE9BQVQ7QUFDQSxtQkFBUyxPQUFUO0FBQ0EscUJBQVcsZUFBZSxNQUFmLEdBQXdCLE9BQU8sU0FBUCxHQUFtQixFQUEzQztTQUhiO0FBS0EsaUJBQVM7QUFDUCx3Q0FBVSxPQUFPO0FBQ2YsaUJBQUssT0FBTCxDQUFhLE1BQWIsQ0FBb0IsS0FBcEIsRUFBMkIsQ0FBM0IsRUFEZTtXQURWO0FBSVAsd0NBQVUsT0FBTztBQUNmLGlCQUFLLE9BQUwsQ0FBYSxNQUFiLENBQW9CLEtBQXBCLEVBQTJCLENBQTNCLEVBQThCLEtBQUssT0FBTCxDQUFhLENBQWIsRUFBZ0IsS0FBaEIsQ0FBOUIsQ0FEZTtXQUpWO0FBT1AsZ0RBQWU7QUFDYixnQkFBSSxTQUFTLEVBQVQsQ0FEUztBQUViLGlCQUFLLE9BQUwsQ0FBYSxPQUFiLENBQXFCLFVBQUMsTUFBRCxFQUFTLENBQVQsRUFBZTtBQUNsQyxpQ0FBaUIsQ0FBakIsSUFBd0IsTUFBeEIsQ0FEa0M7YUFBZixDQUFyQixDQUZhO0FBS2IsbUJBQU8sV0FBUCxJQUFzQixLQUFLLFNBQUwsQ0FMVDtBQU1iLG9CQUFRLE1BQVIsQ0FBZSxHQUFmLENBQW1CLFNBQW5CLENBQTZCLE1BQTdCLEVBTmE7V0FQUjtBQWVQLG9DQUFTO0FBQ1Asb0JBQVEsSUFBUixHQURPO1dBZkY7U0FBVDtPQVBRLENBQU4sQ0FoQk87S0FBVixDQUZILENBRHNCO0dBQU4sQ0FBbEIsQ0FmaUI7Q0FBbEIsQ0FBRCxDQWdFRyxNQWhFSCxFQWdFVyxRQUFRLFVBQVIsQ0FoRVgiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwialF1ZXJ5Lm5vQ29uZmxpY3QoKTtcblxuKCgkLCBQTFVHSU5fSUQpID0+IHtcblxuICB2YXIgYXJyQ29sdW1uQ29uZmlnID0gKGNvbmZpZykgPT4ge1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICBPYmplY3Qua2V5cyhjb25maWcpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgaWYgKGtleS5zdWJzdHJpbmcoMCwgNikgPT09IFwiY29sdW1uXCIpIHtcbiAgICAgICAgcmVzdWx0LnB1c2goY29uZmlnW2tleV0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICB2YXIgY29uZmlnID0ga2ludG9uZS5wbHVnaW4uYXBwLmdldENvbmZpZyhQTFVHSU5fSUQpO1xuICB2YXIgZmllbGRzID0gW107XG5cbiAgJChkb2N1bWVudCkucmVhZHkoKCkgPT4ge1xuICAgIGtpbnRvbmUuYXBpKGtpbnRvbmUuYXBpLnVybCgnL2svdjEvcHJldmlldy9mb3JtJywgdHJ1ZSksICdHRVQnLCB7XG4gICAgICAnYXBwJzoga2ludG9uZS5hcHAuZ2V0SWQoKVxuICAgIH0sIChyZXNwKSA9PiB7XG4gICAgICBmaWVsZHMgPSBbXTtcbiAgICAgIE9iamVjdC5rZXlzKHJlc3AucHJvcGVydGllcykuZm9yRWFjaCgoaSwga2V5KSA9PiB7XG4gICAgICAgIGlmICgnY29kZScgaW4gcmVzcC5wcm9wZXJ0aWVzW2tleV0pIHtcbiAgICAgICAgICBmaWVsZHMucHVzaChyZXNwLnByb3BlcnRpZXNba2V5XS5jb2RlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBjb25zb2xlLmRpcihmaWVsZHMpO1xuICAgICAgdmFyIG9wdGlvbnMgPSBmaWVsZHMubWFwKChpLCBrZXkpID0+IHtcbiAgICAgICAgcmV0dXJuIHt0ZXh0OiBmaWVsZHNba2V5XSwgdmFsdWU6IGZpZWxkc1trZXldfTtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgY29sdW1ucyA9IGFyckNvbHVtbkNvbmZpZyhjb25maWcpO1xuICAgICAgLy8g5pyq6Kit5a6a44Gu5aC05ZCI44Gv44OH44OV44Kp44Or44OI6Kit5a6aXG4gICAgICBpZiAoY29sdW1ucy5sZW5ndGggPD0gMCkgY29sdW1ucyA9IFtvcHRpb25zWzBdLnZhbHVlXTtcbiAgICAgICBcbiAgICAgIHZhciB2dWUgPSBuZXcgVnVlKHtcbiAgICAgICAgZWw6ICcjZm9ybScsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBvcHRpb25zOiBvcHRpb25zLFxuICAgICAgICAgIGNvbHVtbnM6IGNvbHVtbnMsXG4gICAgICAgICAgZWxlbWVudElkOiAnZWxlbWVudElkJyBpbiBjb25maWcgPyBjb25maWcuZWxlbWVudElkIDogJycsXG4gICAgICAgIH0sXG4gICAgICAgIG1ldGhvZHM6IHtcbiAgICAgICAgICBkZWxDb2x1bW4oaW5kZXgpIHtcbiAgICAgICAgICAgIHRoaXMuY29sdW1ucy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgYWRkQ29sdW1uKGluZGV4KSB7XG4gICAgICAgICAgICB0aGlzLmNvbHVtbnMuc3BsaWNlKGluZGV4LCAwLCB0aGlzLm9wdGlvbnNbMF0udmFsdWUpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgcmVnaXN0Q29uZmlnKCkge1xuICAgICAgICAgICAgdmFyIGNvbmZpZyA9IHt9O1xuICAgICAgICAgICAgdGhpcy5jb2x1bW5zLmZvckVhY2goKGNvbHVtbiwgaSkgPT4ge1xuICAgICAgICAgICAgICBjb25maWdbYGNvbHVtbnMke2l9YF0gPSBjb2x1bW47XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbmZpZ1snZWxlbWVudElkJ10gPSB0aGlzLmVsZW1lbnRJZDtcbiAgICAgICAgICAgIGtpbnRvbmUucGx1Z2luLmFwcC5zZXRDb25maWcoY29uZmlnKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGNhbmNlbCgpIHtcbiAgICAgICAgICAgIGhpc3RvcnkuYmFjaygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgIH0pXG4gIH0pO1xuXG59KShqUXVlcnksIGtpbnRvbmUuJFBMVUdJTl9JRCk7XG5cbiJdfQ==
