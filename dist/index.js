"use strict";
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
const wifi_1 = require("./utils/wifi");
const app = (0, express_1.default)();
const port = 3001;
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.get("/wifi", async (request, response) => {
    const wifiStatus = await (0, wifi_1.getWlanStatus)();
    response.json(wifiStatus);
});
app.get("/access_point", async (request, response) => {
    const dhcpcdConfig = {
        staticIpAddress: config_1.staticIpAddress
    };
    try {
        const ssid = await (0, access_point_1.configureHotspotSSID)();
        const hostapdConf = (0, access_point_1.createHostapdConf)({ ssid });
        await (0, access_point_1.stopWifiHotspot)();
        await (0, dhcpcd_1.updateDHCPCDConfig)(types_1.NetworkState.ACCESS_POINT, dhcpcdConfig);
        await (0, access_point_1.disableAvahid)();
        await (0, access_point_1.stopAvahid)();
        (0, fs_1.writeFileSync)("/etc/hostapd/hostapd.conf", hostapdConf);
        await (0, wifi_1.killWpaSupplicant)();
        (0, access_point_1.restartHotspot)();
    }
    catch (e) {
        const error = e;
        response.status(400);
        response.json(error.message);
    }
    response.json("Success");
});
app.post("/wifi", async (request, response) => {
    const { body } = request;
    const { ssid, password, country, timezone } = body;
    if (!ssid) {
        response.status(400);
        response.json({
            message: "Missing ssid in json body"
        });
        return;
    }
    if (!password) {
        response.status(400);
        response.json({
            message: "Missing password in json body"
        });
        return;
    }
    if (!country) {
        response.status(400);
        response.json({
            message: "Missing country in json body"
        });
        return;
    }
    if (!timezone) {
        response.status(400);
        response.json({
            message: "Missing timezone in json body"
        });
        return;
    }
    try {
        const encodedCredentials = await (0, wifi_1.encodeWifiCredentials)({ ssid, password });
        const encodedPsk = await (0, wifi_1.extractEncodedPsk)(encodedCredentials);
        const wpaSupplicantTemplate = (0, wifi_1.createWpaSupplicantTemplate)({
            ssid,
            password: encodedPsk,
            country
        });
        await (0, wifi_1.setUserTimezone)(timezone);
        (0, fs_1.writeFileSync)("/etc/wpa_supplicant/wpa_supplicant.conf", wpaSupplicantTemplate);
        (0, fs_1.writeFileSync)("/etc/dhcpcd.conf", (0, wifi_1.wifiDHCPCDTemplate)());
        await (0, wifi_1.resetWpaSupplicant)();
        response.json({
            message: "Successfully updated wifi credentials"
        });
    }
    catch (e) {
        const error = e;
        response.status(400);
        response.json(error.message);
    }
});
app.get("/wifi/scan", async (request, response) => {
    const { stdout: wifiList } = await (0, wifi_1.scanWifi)();
    response.json(wifiList);
});
app.listen(port, async () => {
    console.log(`> Ready on http://localhost:${port}`);
});
