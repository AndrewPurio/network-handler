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
app.get("/access_point", async (request, response) => {
    setAccessPoint();
    response.json("Success");
});
const setAccessPoint = async () => {
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
        (0, fs_1.writeFileSync)("./config.json", JSON.stringify({
            reboot: true
        }));
    }
    catch (error) {
        console.log(error);
    }
};
app.listen(port, async () => {
    console.log(`> Ready on http://localhost:${port}`);
});
