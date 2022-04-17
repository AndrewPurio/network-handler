"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeFile = exports.execute = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
async function execute(command) {
    const execute_command = (0, util_1.promisify)(child_process_1.exec);
    return execute_command(command);
}
exports.execute = execute;
async function executeFile(filePath) {
    const execute_file = (0, util_1.promisify)(child_process_1.execFile);
    return execute_file(filePath);
}
exports.executeFile = executeFile;
