"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restartDHCPCD = exports.updateDHCPCDConfig = void 0;
const access_point_1 = require("../access_point");
const types_1 = require("./types");
const fs_1 = require("fs");
const systemctl_1 = require("../systemctl");
const updateDHCPCDConfig = (state, config) => {
    const contents = state === types_1.NetworkState.ACCESS_POINT ? (0, access_point_1.createDHCPCDConfigForHostapd)(config) : "";
    (0, fs_1.writeFileSync)(types_1.dhcpcdFilePath, contents);
};
exports.updateDHCPCDConfig = updateDHCPCDConfig;
const restartDHCPCD = async () => {
    const { stdout, stderr } = await (0, systemctl_1.restartProcess)("dhcpcd");
    return {
        stdout, stderr
    };
};
exports.restartDHCPCD = restartDHCPCD;
