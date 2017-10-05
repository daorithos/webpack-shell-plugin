'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _toArray2 = require('babel-runtime/helpers/toArray');

var _toArray3 = _interopRequireDefault(_toArray2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var os = require('os');

var defaultOptions = {
  onBuildStart: [],
  onBuildEnd: [],
  onBuildExit: [],
  dev: true,
  verbose: false,
  safe: false
};

var WebpackShellPlugin = function () {
  function WebpackShellPlugin(options) {
    (0, _classCallCheck3.default)(this, WebpackShellPlugin);

    this.options = this.validateInput(this.mergeOptions(options, defaultOptions));
  }

  (0, _createClass3.default)(WebpackShellPlugin, [{
    key: 'puts',
    value: function puts(resolve) {
      return function (error, stdout, stderr) {
        if (error) {
          throw error;
        }
        resolve();
      };
    }
  }, {
    key: 'spreadStdoutAndStdErr',
    value: function spreadStdoutAndStdErr(proc) {
      proc.stdout.pipe(process.stdout);
      proc.stderr.pipe(process.stdout);
    }
  }, {
    key: 'serializeScript',
    value: function serializeScript(script) {
      if (typeof script === 'string') {
        var _script$split = script.split(' '),
            _script$split2 = (0, _toArray3.default)(_script$split),
            _command = _script$split2[0],
            _args = _script$split2.slice(1);

        return { command: _command, args: _args };
      }
      var command = script.command,
          args = script.args;

      return { command: command, args: args };
    }
  }, {
    key: 'handleScript',
    value: function handleScript(script) {
      var _this = this;

      if (os.platform() === 'win32' || this.options.safe) {
        return new _promise2.default(function (resolve) {
          return _this.spreadStdoutAndStdErr(exec(script, _this.puts(resolve)));
        });
      }

      var _serializeScript = this.serializeScript(script),
          command = _serializeScript.command,
          args = _serializeScript.args;

      var proc = spawn(command, args, { stdio: 'inherit' });
      return new _promise2.default(function (resolve) {
        return proc.on('close', _this.puts(resolve));
      });
    }
  }, {
    key: 'validateInput',
    value: function validateInput(options) {
      if (typeof options.onBuildStart === 'string') {
        options.onBuildStart = options.onBuildStart.split('&&');
      }
      if (typeof options.onBuildEnd === 'string') {
        options.onBuildEnd = options.onBuildEnd.split('&&');
      }
      if (typeof options.onBuildExit === 'string') {
        options.onBuildExit = options.onBuildExit.split('&&');
      }
      return options;
    }
  }, {
    key: 'mergeOptions',
    value: function mergeOptions(options, defaults) {
      for (var key in defaults) {
        if (options.hasOwnProperty(key)) {
          defaults[key] = options[key];
        }
      }
      return defaults;
    }
  }, {
    key: 'apply',
    value: function apply(compiler) {
      var _this2 = this;

      compiler.plugin('before-compile', function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(compilation, cb) {
          var i;
          return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  if (_this2.options.verbose) {
                    console.log('Report compilation: ' + compilation);
                    console.warn('WebpackShellPlugin [' + new Date() + ']: Verbose is being deprecated, please remove.');
                  }

                  if (!_this2.options.onBuildStart.length) {
                    _context.next = 11;
                    break;
                  }

                  console.log('Executing pre-build scripts');
                  i = 0;

                case 4:
                  if (!(i < _this2.options.onBuildStart.length)) {
                    _context.next = 10;
                    break;
                  }

                  _context.next = 7;
                  return _this2.handleScript(_this2.options.onBuildStart[i]);

                case 7:
                  i++;
                  _context.next = 4;
                  break;

                case 10:
                  if (_this2.options.dev) {
                    _this2.options.onBuildStart = [];
                  }

                case 11:
                  cb();

                case 12:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, _this2);
        }));

        return function (_x, _x2) {
          return _ref.apply(this, arguments);
        };
      }());

      compiler.plugin('after-emit', function (compilation, callback) {
        if (_this2.options.onBuildEnd.length) {
          console.log('Executing post-build scripts');
          for (var i = 0; i < _this2.options.onBuildEnd.length; i++) {
            _this2.handleScript(_this2.options.onBuildEnd[i]);
          }
          if (_this2.options.dev) {
            _this2.options.onBuildEnd = [];
          }
        }
        callback();
      });

      compiler.plugin('done', function () {
        if (_this2.options.onBuildExit.length) {
          console.log('Executing additional scripts before exit');
          for (var i = 0; i < _this2.options.onBuildExit.length; i++) {
            _this2.handleScript(_this2.options.onBuildExit[i]);
          }
        }
      });
    }
  }]);
  return WebpackShellPlugin;
}();

module.exports = WebpackShellPlugin;
