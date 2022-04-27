"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disableFirewall = exports.enableFirewall = void 0;
const execute_1 = require("../execute");
const enableFirewall = async () => {
    try {
        const { stdout, stderr } = await (0, execute_1.execute)("sudo ufw enable");
    }
    catch (error) {
        throw error;
    }
};
exports.enableFirewall = enableFirewall;
const disableFirewall = async () => {
    try {
        const { stdout, stderr } = await (0, execute_1.execute)("sudo ufw disable");
    }
    catch (error) {
        throw error;
    }
};
exports.disableFirewall = disableFirewall;
