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
    try {
        await (0, execute_1.execute)("sudo ifconfig wlan0 up");
        const { stdout, stderr } = await (0, execute_1.execute)("sudo iwlist wlan0 scan | egrep 'Cell |Encryption|Quality|Last beacon|ESSID'");
        const wifiStrData = stdout;
        const wifiDataParser = /Cell \d+ - Address: (\w{2}:?)+\n +Quality=\d{2}\/\d{2}  Signal level=[\w- ]+\n +Encryption key:\w{2,3}\n +ESSID:".+"\n +Extra: Last beacon: \d+ms ago/g;
        const patterns = {
            address: /(?<=Address: )(\w{2}:?)+/,
            signal_quality: /(?<=Quality=)\d{2}\/\d{2}/,
            signal_level: /(?<=Signal level=)[+\d-]+(?= dBm)/,
            encryption_key: /(?<=Encryption key:)\w{2,3}/,
            SSID: /(?<=ESSID:").+?(?=")/,
            last_beacon: /(?<=Extra: Last beacon: )\d+ms(?= ago)/
        };
        const wifiData = wifiStrData.match(wifiDataParser) || [];
        return wifiData.map((wifiData) => {
            const wifi_json = {
                address: "",
                signal_quality: "",
                signal_level: "",
                encryption_key: "",
                SSID: "",
                last_beacon: ""
            };
            for (let key in patterns) {
                const newKey = key;
                const [data] = patterns[newKey].exec(wifiData) || [];
                wifi_json[newKey] = data;
            }
            return wifi_json;
        });
    }
    catch (error) {
        throw error;
    }
};
exports.scanWifi = scanWifi;
const encodeWifiCredentials = async ({ ssid, password }) => {
    const { stdout, stderr } = await (0, execute_1.execute)(`wpa_passphrase '${ssid}' '${password}'`);
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
    try {
        await (0, systemctl_1.enableProcess)("avahi-daemon");
        await (0, systemctl_1.startProcess)("avahi-daemon");
        await (0, access_point_1.stopDnsMasq)();
        await (0, access_point_1.stopHostapd)();
        await (0, exports.killWpaSupplicant)();
    }
    catch (error) {
        console.log(error);
    }
    finally {
        setTimeout(async () => {
            await (0, dhcpcd_1.restartDHCPCD)();
            await (0, exports.loadWpaSupplicantConfig)();
        }, 500);
    }
};
exports.resetWpaSupplicant = resetWpaSupplicant;
const loadWpaSupplicantConfig = async () => {
    const { stdout, stderr } = await (0, execute_1.execute)("sudo wpa_supplicant -B -Dnl80211 -iwlan0 -c /etc/wpa_supplicant/wpa_supplicant.conf");
    return { stdout, stderr };
};
exports.loadWpaSupplicantConfig = loadWpaSupplicantConfig;
