"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restartHotspot = exports.configureHotspotSSID = exports.stopWifiHotspot = exports.stopAvahid = exports.disableAvahid = exports.stopHostapd = exports.startHostapd = exports.enableHostapd = exports.stopDnsMasq = exports.startDnsMasq = exports.createHostapdConf = exports.createDHCPCDConfigForHostapd = void 0;
const mustache_1 = __importDefault(require("mustache"));
const dhcpcd_1 = require("../dhcpcd");
const systemctl_1 = require("../systemctl");
const createDHCPCDConfigForHostapd = (config) => {
    const template = `
    hostname
    clientid
    persistent
    
    option rapid_commit
    option domain_name_servers, domain_name, domain_search, host_name
    option classless_static_routes
    option interface_mtu
    
    require dhcp_server_identifier
    
    slaac private
    interface wlan0
    static ip_address={{staticIpAddress}}/24
    nohook wpa_supplicant
    `;
    return mustache_1.default.render(template, config);
};
exports.createDHCPCDConfigForHostapd = createDHCPCDConfigForHostapd;
const createHostapdConf = (config) => {
    const template = `
    ssid={{ssid}}
    wpa_passphrase=rest_node
    
    interface=wlan0
    driver=nl80211
    hw_mode=g
    channel=7
    wmm_enabled=0
    macaddr_acl=0
    auth_algs=1
    ignore_broadcast_ssid=0
    wpa=2
    wpa_key_mgmt=WPA-PSK
    wpa_pairwise=TKIP
    rsn_pairwise=CCMP
    `;
    return mustache_1.default.render(template, config);
};
exports.createHostapdConf = createHostapdConf;
const startDnsMasq = async () => {
    const { stdout, stderr } = await (0, systemctl_1.startProcess)("dnsmasq");
    return {
        stdout, stderr
    };
};
exports.startDnsMasq = startDnsMasq;
const stopDnsMasq = async () => {
    const { stdout, stderr } = await (0, systemctl_1.stopProcess)("dnsmasq");
    return {
        stdout, stderr
    };
};
exports.stopDnsMasq = stopDnsMasq;
const enableHostapd = async () => {
    const { stdout, stderr } = await (0, systemctl_1.startProcess)("dnsmasq");
    return {
        stdout, stderr
    };
};
exports.enableHostapd = enableHostapd;
const startHostapd = async () => {
    const { stdout, stderr } = await (0, systemctl_1.startProcess)("hostapd");
    return {
        stdout, stderr
    };
};
exports.startHostapd = startHostapd;
const stopHostapd = async () => {
    const { stdout, stderr } = await (0, systemctl_1.stopProcess)("hostapd");
    return {
        stdout, stderr
    };
};
exports.stopHostapd = stopHostapd;
const disableAvahid = async () => {
    const { stdout, stderr } = await (0, systemctl_1.disableProcess)("avahi-daemon");
    return {
        stdout, stderr
    };
};
exports.disableAvahid = disableAvahid;
const stopAvahid = async () => {
    const { stdout, stderr } = await (0, systemctl_1.stopProcess)("avahi-daemon");
    return {
        stdout, stderr
    };
};
exports.stopAvahid = stopAvahid;
const stopWifiHotspot = async () => {
    await (0, exports.stopDnsMasq)();
    await (0, exports.stopHostapd)();
};
exports.stopWifiHotspot = stopWifiHotspot;
const configureHotspotSSID = async () => {
    const { stdout: serialNumber } = await (0, systemctl_1.getDeviceSerialNumber)();
    console.log("Serial Number:", serialNumber);
    const last_4_characters = /\w{4}$/;
    const id = last_4_characters.exec(serialNumber);
    if (!id)
        throw new Error("Failed to get the device serial number");
    const ssid = `Rest_Node_${id[0]}`;
    return ssid;
};
exports.configureHotspotSSID = configureHotspotSSID;
const restartHotspot = async () => {
    await (0, dhcpcd_1.restartDHCPCD)();
    await (0, exports.startDnsMasq)();
    await (0, exports.enableHostapd)();
    await (0, exports.startHostapd)();
};
exports.restartHotspot = restartHotspot;
