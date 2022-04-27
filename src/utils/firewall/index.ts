import { execute } from "../execute"

export const enableFirewall = async () => {
    try {
        const { stdout, stderr } = await execute("sudo ufw enable")
    } catch (error) {
        throw error        
    }
}

export const disableFirewall = async () => {
    try {
        const { stdout, stderr } = await execute("sudo ufw disable")
    } catch (error) {
        throw error        
    }
}