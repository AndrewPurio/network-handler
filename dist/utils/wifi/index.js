"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadWpaSupplicantConfig = exports.resetWpaSupplicant = exports.wifiDHCPCDTemplate = exports.createWpaSupplicantTemplate = exports.setUserTimezone = exports.extractEncodedPsk = exports.encodeWifiCredentials = exports.scanWifi = exports.getWlanStatus = exports.killWpaSupplicant = void 0;
const mustache_1 = require("mustache");
const access_point_1 = require("../access_point");
const dhcpcd_1 = require("../dhcpcd");
const execute_1 = require("../execute");
const systemctl_1 = require("../systemctl");
const killWpaSupplicant = async () => {
    const { stdout, stderr } = await (0, execute_1.execute)("sudo killall wpa_supplicant");
    return {
        stdout, stderr
    };
};
exports.killWpaSupplicant = killWpaSupplicant;
const getWlanStatus = async () => {
    const { stdout } = await (0, execute_1.execute)("wpa_cli -iwlan0 status");
    const wifiStatus = stdout.split("\n");
    const entries = wifiStatus.map((status) => status.split("="));
    const wifiStatusObject = Object.fromEntries(entries);
    return wifiStatusObject;
};
exports.getWlanStatus = getWlanStatus;
const scanWifi = async () => {
    const { stdout, stderr } = await (0, execute_1.execute)("iwlist wlan0 scanning | egrep 'Cell |Encryption|Quality|Last beacon|ESSID'");
    return { stdout, stderr };
};
exports.scanWifi = scanWifi;
const encodeWifiCredentials = async ({ ssid, password }) => {
    const { stdout, stderr } = await (0, execute_1.execute)(`wpa_passphrade '${ssid}' '${password}'`);
    return stdout;
};
exports.encodeWifiCredentials = encodeWifiCredentials;
const extractEncodedPsk = async (credentials) => {
    const encoded_psk = /(?<=\tpsk ?= ?)"?\w+"?/;
    const [encoded_password] = encoded_psk.exec(credentials) || [];
    return encoded_password;
};
exports.extractEncodedPsk = extractEncodedPsk;
const setUserTimezone = async (timezone) => {
    const { stdout, stderr } = await (0, execute_1.execute)(`sudo timedatectl set-timezone ${timezone}`);
    return {
        stdout, stderr
    };
};
exports.setUserTimezone = setUserTimezone;
const createWpaSupplicantTemplate = (config) => {
    const template = `ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country={{country}}

network={
    ssid="{{ssid}}"
    psk={{password}}
}`;
    return (0, mustache_1.render)(template, config);
};
exports.createWpaSupplicantTemplate = createWpaSupplicantTemplate;
const wifiDHCPCDTemplate = () => {
    const template = `hostname
clientid
persistent

option rapid_commit
option domain_name_servers, domain_name, domain_search, host_name
option classless_static_routes
option interface_mtu

require dhcp_server_identifier

slaac private
interface wlan0`;
    return template;
};
exports.wifiDHCPCDTemplate = wifiDHCPCDTemplate;
const resetWpaSupplicant = async () => {
    await (0, systemctl_1.enableProcess)("avahi-daemon");
    await (0, systemctl_1.startProcess)("avahi-daemon");
    await (0, access_point_1.stopDnsMasq)();
    await (0, access_point_1.stopHostapd)();
    await (0, exports.killWpaSupplicant)();
    await (0, dhcpcd_1.restartDHCPCD)();
    await (0, exports.loadWpaSupplicantConfig)();
};
exports.resetWpaSupplicant = resetWpaSupplicant;
const loadWpaSupplicantConfig = async () => {
    const { stdout, stderr } = await (0, execute_1.execute)("sudo wpa_supplicant -B -Dnl80211 -iwlan0 -c /etc/wpa_supplicant/wpa_supplicant.conf");
    return { stdout, stderr };
};
exports.loadWpaSupplicantConfig = loadWpaSupplicantConfig;
