import { createDHCPCDConfigForHostapd } from "../access_point"
import { DHCPCDHostapdConfig } from "../access_point/types"
import { dhcpcdFilePath, NetworkState } from "./types"
import { writeFileSync } from "fs"
import { restartProcess } from "../systemctl"

export const updateDHCPCDConfig = (state: NetworkState, config: DHCPCDHostapdConfig) => {
    const contents = state === NetworkState.ACCESS_POINT ? createDHCPCDConfigForHostapd(config): ""

    writeFileSync(dhcpcdFilePath, contents)
}

export const restartDHCPCD = async () => {
    const { stdout, stderr } = await restartProcess("dhcpcd")

    return {
        stdout, stderr
    }
}