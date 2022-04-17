"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deviceReboot = exports.getDeviceSerialNumber = exports.restartProcess = exports.disableProcess = exports.enableProcess = exports.startProcess = exports.stopProcess = void 0;
const execute_1 = require("../execute");
const stopProcess = async (name) => {
    const command = `sudo systemctl stop ${name}`;
    const { stdout, stderr } = await (0, execute_1.execute)(command);
    return {
        stdout, stderr
    };
};
exports.stopProcess = stopProcess;
const startProcess = async (name) => {
    const command = `sudo systemctl start ${name}`;
    const { stdout, stderr } = await (0, execute_1.execute)(command);
    return {
        stdout, stderr
    };
};
exports.startProcess = startProcess;
const enableProcess = async (name) => {
    const command = `sudo systemctl enable ${name}`;
    const { stdout, stderr } = await (0, execute_1.execute)(command);
    return {
        stdout, stderr
    };
};
exports.enableProcess = enableProcess;
const disableProcess = async (name) => {
    const command = `sudo systemctl disable ${name}`;
    const { stdout, stderr } = await (0, execute_1.execute)(command);
    return {
        stdout, stderr
    };
};
exports.disableProcess = disableProcess;
const restartProcess = async (name) => {
    const command = `sudo systemctl restart ${name}`;
    const { stdout, stderr } = await (0, execute_1.execute)(command);
    return {
        stdout, stderr
    };
};
exports.restartProcess = restartProcess;
const getDeviceSerialNumber = async () => {
    const { stdout, stderr } = await (0, execute_1.execute)("cat /sys/firmware/devicetree/base/serial-number");
    return {
        stdout, stderr
    };
};
exports.getDeviceSerialNumber = getDeviceSerialNumber;
const deviceReboot = async () => {
    const { stdout, stderr } = await (0, execute_1.execute)("sudo reboot");
    return {
        stdout, stderr
    };
};
exports.deviceReboot = deviceReboot;
