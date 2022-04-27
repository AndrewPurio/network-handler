"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restartDHCPCD = exports.updateDHCPCDConfig = void 0;
const access_point_1 = require("../access_point");
const types_1 = require("./types");
const fs_1 = require("fs");
const execute_1 = require("../execute");
const wifi_1 = require("../wifi");
const updateDHCPCDConfig = (state, config) => {
    const contents = state === types_1.NetworkState.ACCESS_POINT ? (0, access_point_1.createDHCPCDConfigForHostapd)(config) : (0, wifi_1.wifiDHCPCDTemplate)();
    (0, fs_1.writeFileSync)(types_1.dhcpcdFilePath, contents);
};
exports.updateDHCPCDConfig = updateDHCPCDConfig;
const restartDHCPCD = async () => {
    const { stdout, stderr } = await (0, execute_1.execute)("sudo service dhcpcd restart");
    return {
        stdout, stderr
    };
};
exports.restartDHCPCD = restartDHCPCD;
