import { render } from "mustache"
import { stopDnsMasq, stopHostapd } from "../access_point"
import { restartDHCPCD } from "../dhcpcd"
import { execute } from "../execute"
import { enableProcess, startProcess } from "../systemctl"
import type { WifiCredentials, WifiStatus, WPASupplicantConf } from "./types"

export const killWpaSupplicant = async () => {
    const { stdout, stderr } = await execute("sudo killall wpa_supplicant")

    return {
        stdout, stderr
    }
}

export const getWlanStatus = async () => {
    const { stdout } = await execute("wpa_cli -iwlan0 status")

    const wifiStatus = (stdout as string).split("\n")

    const entries = wifiStatus.map((status) => status.split("="))
    const wifiStatusObject = Object.fromEntries(entries) as WifiStatus

    return wifiStatusObject
}

export const scanWifi = async () => {
    try {
        await execute("sudo ifconfig wlan0 up")
        const { stdout, stderr } = await execute("sudo iwlist wlan0 scan | egrep 'Cell |Encryption|Quality|Last beacon|ESSID'")
        const wifiStrData = stdout as string
        const wifiDataParser = /Cell \d+ - Address: (\w{2}:?)+\n +Quality=\d{2}\/\d{2}  Signal level=[\w- ]+\n +Encryption key:\w{2,3}\n +ESSID:".+"\n +Extra: Last beacon: \d+ms ago/g
        const patterns = {
            address: /(?<=Address: )(\w{2}:?)+/,
            signal_quality: /(?<=Quality=)\d{2}\/\d{2}/,
            signal_level: /(?<=Signal level=)[+\d-]+(?= dBm)/,
            encryption_key: /(?<=Encryption key:)\w{2,3}/,
            SSID: /(?<=ESSID:").+?(?=")/,
            last_beacon: /(?<=Extra: Last beacon: )\d+ms(?= ago)/
        }

        const wifiData = wifiStrData.match(wifiDataParser) || []

        return wifiData.map((wifiData) => {
            const wifi_json = {
                address: "",
                signal_quality: "",
                signal_level: "",
                encryption_key: "",
                SSID: "",
                last_beacon: ""
            }

            for (let key in patterns) {
                const newKey = key as keyof typeof patterns
                const [data] = patterns[newKey].exec(wifiData) || []

                wifi_json[newKey] = data
            }

            return wifi_json
        })
    } catch (error) {
        throw error as Error
    }
}

export const encodeWifiCredentials = async ({ ssid, password }: WifiCredentials) => {
    const { stdout, stderr } = await execute(`wpa_passphrade '${ssid}' '${password}'`)

    return stdout as string
}

export const extractEncodedPsk = async (credentials: string) => {
    const encoded_psk = /(?<=\tpsk ?= ?)"?\w+"?/
    const [encoded_password] = encoded_psk.exec(credentials) || []

    return encoded_password
}

export const setUserTimezone = async (timezone: string) => {
    const { stdout, stderr } = await execute(`sudo timedatectl set-timezone ${timezone}`)

    return {
        stdout, stderr
    }
}

export const createWpaSupplicantTemplate = (config: WPASupplicantConf) => {
    const template = `ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country={{country}}

network={
    ssid="{{ssid}}"
    psk={{password}}
}`

    return render(template, config)
}

export const wifiDHCPCDTemplate = () => {
    const template = `hostname
clientid
persistent

option rapid_commit
option domain_name_servers, domain_name, domain_search, host_name
option classless_static_routes
option interface_mtu

require dhcp_server_identifier

slaac private
interface wlan0`

    return template
}

export const resetWpaSupplicant = async () => {
    await enableProcess("avahi-daemon")
    await startProcess("avahi-daemon")
    await stopDnsMasq()
    await stopHostapd()
    await killWpaSupplicant()
    await restartDHCPCD()

    await loadWpaSupplicantConfig()
}

export const loadWpaSupplicantConfig = async () => {
    const { stdout, stderr } = await execute("sudo wpa_supplicant -B -Dnl80211 -iwlan0 -c /etc/wpa_supplicant/wpa_supplicant.conf")

    return { stdout, stderr }
}
