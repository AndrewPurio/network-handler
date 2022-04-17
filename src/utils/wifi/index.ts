import { execute } from "../execute"

export interface WifiStatus {
    ssid: string
    id: string
    mode: string
    pairwise_cipher: string
    key_mgmt: string
    wpa_state: "COMPLETED" | "ASSOCIATING"
    ip_address: string
    p2p_device_address: string
    address: string
    uuid: string
    ieee80211ac: string
}

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