"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const fs_1 = require("fs");
const access_point_1 = require("./utils/access_point");
const config_1 = require("./utils/access_point/config");
const dhcpcd_1 = require("./utils/dhcpcd");
const types_1 = require("./utils/dhcpcd/types");
const systemctl_1 = require("./utils/systemctl");
const app = (0, express_1.default)();
const port = 3001;
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.get("/", (request, response) => {
    response.json((0, access_point_1.createDHCPCDConfigForHostapd)({
        staticIpAddress: config_1.staticIpAddress
    }));
});
app.post("/test", (request, response) => {
    const { body } = request;
    console.log("Body:", body);
    response.json("Test response");
});
app.get("/access_point", (request, response) => {
    (0, fs_1.writeFileSync)("./config.json", JSON.stringify({
        reboot: false
    }));
    response.json("Success");
    (0, systemctl_1.deviceReboot)();
});
const setAccessPoint = async () => {
    const dhcpcdConfig = {
        staticIpAddress: config_1.staticIpAddress
    };
    const ssid = await (0, access_point_1.configureHotspotSSID)();
    const hostapdConf = (0, access_point_1.createHostapdConf)({ ssid });
    await (0, access_point_1.stopWifiHotspot)();
    await (0, dhcpcd_1.updateDHCPCDConfig)(types_1.NetworkState.ACCESS_POINT, dhcpcdConfig);
    await (0, access_point_1.disableAvahid)();
    await (0, access_point_1.stopAvahid)();
    (0, fs_1.writeFileSync)("/etc/hostapd/hostapd.conf", hostapdConf);
    (0, access_point_1.restartHotspot)();
    (0, fs_1.writeFileSync)("./config.json", JSON.stringify({
        reboot: true
    }));
};
app.listen(port, async () => {
    const { reboot } = await Promise.resolve().then(() => __importStar(require("./config.json")));
    console.log("Reboot before setup:", reboot);
    if (!reboot) {
        setAccessPoint();
    }
    console.log(`> Ready on http://localhost:${port}`);
});
