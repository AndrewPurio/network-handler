"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWlanStatus = exports.killWpaSupplicant = void 0;
const execute_1 = require("../execute");
const killWpaSupplicant = async () => {
    const { stdout, stderr } = await (0, execute_1.execute)("sudo killall wpa_supplicant");
    return {
        stdout, stderr
    };
};
exports.killWpaSupplicant = killWpaSupplicant;
const getWlanStatus = async () => {
    const { stdout, stderr } = await (0, execute_1.execute)("wpa_cli -iwlan0 status");
    const wifiStatus = stdout.split("\n");
    const entries = wifiStatus.map((status) => status.split("="));
    const wifiStatusObject = Object.fromEntries(entries);
    return wifiStatusObject;
};
exports.getWlanStatus = getWlanStatus;
