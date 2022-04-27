import { createDHCPCDConfigForHostapd } from "../access_point"
import { DHCPCDHostapdConfig } from "../access_point/types"
import { dhcpcdFilePath, NetworkState } from "./types"
import { writeFileSync } from "fs"
import { execute } from "../execute"
import { wifiDHCPCDTemplate } from "../wifi"

export const updateDHCPCDConfig = (state: NetworkState, config: DHCPCDHostapdConfig) => {
    const contents = state === NetworkState.ACCESS_POINT ? createDHCPCDConfigForHostapd(config): wifiDHCPCDTemplate()

    writeFileSync(dhcpcdFilePath, contents)
}

export const restartDHCPCD = async () => {
    const { stdout, stderr } = await execute("sudo service dhcpcd restart")

    return {
        stdout, stderr
    }
}