import { execute } from "../execute"

export const killWpaSupplicant = async () => {
    const { stdout, stderr } = await execute("sudo killall wpa_supplicant") 

    return {
        stdout, stderr
    }
}

export const getWlanStatus = async () => {
    const { stdout, stderr } = await execute("wpa_cli -iwlan0 status") 

    return {
        stdout, stderr
    }
}