import cors from "cors"
import express from 'express'
import { writeFileSync } from "fs"
import { configureHotspotSSID, createDHCPCDConfigForHostapd, createHostapdConf, disableAvahid, enableHostapd, restartHotspot, startDnsMasq, startHostapd, stopAvahid, stopWifiHotspot } from "./utils/access_point"
import { staticIpAddress } from "./utils/access_point/config"
import { updateDHCPCDConfig } from "./utils/dhcpcd"
import { NetworkState } from "./utils/dhcpcd/types"
import { deviceReboot } from "./utils/systemctl"
import { getWlanStatus, killWpaSupplicant } from "./utils/wifi"

const app = express()
const port = 3001

app.use(express.json())
app.use(cors())

app.get("/wifi", async (request, response) => {
    const wifiStatus = await getWlanStatus()

    response.json(wifiStatus)
})

app.get("/access_point", async (request, response) => {
    setAccessPoint()

    response.json("Success")
})

const setAccessPoint = async () => {
    const dhcpcdConfig = {
        staticIpAddress
    }

    try {
        const ssid = await configureHotspotSSID()
        const hostapdConf = createHostapdConf({ ssid })

        await stopWifiHotspot()
        await updateDHCPCDConfig(NetworkState.ACCESS_POINT, dhcpcdConfig)
        await disableAvahid()
        await stopAvahid()

        writeFileSync("/etc/hostapd/hostapd.conf", hostapdConf)
        await killWpaSupplicant()

        restartHotspot()
    } catch (error) {
        console.log(error)
    }
}

app.listen(port, async () => {
    console.log(`> Ready on http://localhost:${port}`);
})