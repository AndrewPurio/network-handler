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

export interface WifiCredentials {
    ssid: string
    password: string
}

export interface WPASupplicantConf extends WifiCredentials {
    country: string
}