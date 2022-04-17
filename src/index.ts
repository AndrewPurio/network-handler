import cors from "cors"
import express, { response } from 'express'
import { writeFileSync } from "fs"
import { configureHotspotSSID, createDHCPCDConfigForHostapd, createHostapdConf, disableAvahid, enableHostapd, restartHotspot, startDnsMasq, startHostapd, stopAvahid, stopWifiHotspot } from "./utils/access_point"
import { staticIpAddress } from "./utils/access_point/config"
import { updateDHCPCDConfig } from "./utils/dhcpcd"
import { NetworkState } from "./utils/dhcpcd/types"
import { reboot } from "./config.json"
import { deviceReboot } from "./utils/systemctl"

const app = express()
const port = 3001

app.use(express.json())
app.use(cors())

app.get("/", (request, response) => {
    response.json(
        createDHCPCDConfigForHostapd({
            staticIpAddress
        })
    )
})

app.post("/test", (request, response) => {
    const { body } = request

    console.log("Body:", body)

    response.json("Test response")
})

app.get("/access_point", () => {
    writeFileSync("./config.json", JSON.stringify({
        reboot: false
    }))

    response.json("Success")
    deviceReboot()
})

const setAccessPoint = async () => {
    const dhcpcdConfig = {
        staticIpAddress
    }

    await stopWifiHotspot()
    await updateDHCPCDConfig(NetworkState.ACCESS_POINT, dhcpcdConfig)
    await disableAvahid()
    await stopAvahid()

    writeFileSync("/etc/hostapd/hostapd.conf", createHostapdConf({
        ssid: await configureHotspotSSID()
    }))

    restartHotspot()

    writeFileSync("./config.json", JSON.stringify({
        reboot: true
    }))
}

if(!reboot) {
    setAccessPoint()
}

app.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
})