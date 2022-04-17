"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dhcpcdFilePath = exports.NetworkState = void 0;
var NetworkState;
(function (NetworkState) {
    NetworkState["WIFI"] = "wifi";
    NetworkState["ACCESS_POINT"] = "access_point";
})(NetworkState = exports.NetworkState || (exports.NetworkState = {}));
exports.dhcpcdFilePath = "/etc/dhcpcd.conf";
