import cors from "cors"
import express from 'express'
import { writeFileSync } from "fs"
import { configureHotspotSSID, createDHCPCDConfigForHostapd, createHostapdConf, disableAvahid, enableHostapd, restartHotspot, startDnsMasq, startHostapd, stopAvahid, stopWifiHotspot } from "./utils/access_point"
import { staticIpAddress } from "./utils/access_point/config"
import { updateDHCPCDConfig } from "./utils/dhcpcd"
import { NetworkState } from "./utils/dhcpcd/types"
import { createWpaSupplicantTemplate, encodeWifiCredentials, extractEncodedPsk, getWlanStatus, killWpaSupplicant, resetWpaSupplicant, setUserTimezone, wifiDHCPCDTemplate } from "./utils/wifi"

const app = express()
const port = 3001

app.use(express.json())
app.use(cors())

app.get("/wifi", async (request, response) => {
    const wifiStatus = await getWlanStatus()

    response.json(wifiStatus)
})

app.get("/access_point", async (request, response) => {
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
    } catch (e) {
        const error = e as Error
        response.status(400)

        response.json(error.message)
    }

    response.json("Success")
})

app.post("/wifi", async (request, response) => {
    const { body } = request
    const { ssid, password, country, timezone } = body

    if (!ssid) {
        response.status(400)
        response.json({
            message: "Missing ssid in json body"
        })

        return
    }

    if (!password) {
        response.status(400)
        response.json({
            message: "Missing password in json body"
        })

        return
    }

    if (!country) {
        response.status(400)
        response.json({
            message: "Missing country in json body"
        })

        return
    }

    if (!timezone) {
        response.status(400)
        response.json({
            message: "Missing timezone in json body"
        })

        return
    }

    try {
        const encodedCredentials = await encodeWifiCredentials({ ssid, password })
        const encodedPsk = await extractEncodedPsk(encodedCredentials)
        const wpaSupplicantTemplate = createWpaSupplicantTemplate({
            ssid,
            password: encodedPsk,
            country
        })

        await setUserTimezone(timezone)

        writeFileSync("/etc/wpa_supplicant/wpa_supplicant.conf", wpaSupplicantTemplate)
        writeFileSync("/etc/dhcpcd.conf", wifiDHCPCDTemplate())

        await resetWpaSupplicant()

        response.json({
            message: "Successfully updated wifi credentials"
        })
    } catch (e) {
        const error = e as Error
        response.status(400)

        response.json(error.message)
    }
})

app.get("/wifi/scan", async (request, response) => {
    const wifiList = await getWlanStatus()

    response.json(wifiList)
})

app.listen(port, async () => {
    console.log(`> Ready on http://localhost:${port}`);
})