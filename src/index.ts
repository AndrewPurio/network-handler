import cors from "cors"
import express from 'express'
import { writeFileSync } from "fs"
import { configureHotspotSSID, createDHCPCDConfigForHostapd, createHostapdConf, disableAvahid, enableHostapd, restartHotspot, startDnsMasq, startHostapd, stopAvahid, stopWifiHotspot } from "./utils/access_point"
import { staticIpAddress } from "./utils/access_point/config"
import { updateDHCPCDConfig } from "./utils/dhcpcd"
import { NetworkState } from "./utils/dhcpcd/types"
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

app.get("/access_point", async (request, response) => {
    writeFileSync("./config.json", JSON.stringify({
        reboot: false
    }))

    const config = await import("./config.json")

    response.json(config)
    deviceReboot()
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

        restartHotspot()

        writeFileSync("./config.json", JSON.stringify({
            reboot: true
        }))
    } catch (error) {
        console.log(error)
    }
}

app.listen(port, async () => {
    const { reboot } = await import("./config.json")

    console.log("Reboot before setup:", reboot)

    if (!reboot) {
        setAccessPoint()
    }

    console.log(`> Ready on http://localhost:${port}`);
})