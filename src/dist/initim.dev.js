"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _easemobWebsdk = _interopRequireDefault(require("easemob-websdk"));

var _consts = require("./consts");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var conn = new _easemobWebsdk["default"].connection({
  appKey: _consts.APPKEY
});
window.EIM = conn;
var _default = conn;
exports["default"] = _default;