import { execute } from "../execute"

export const stopProcess = async (name: string) => {
    const command = `sudo systemctl stop ${name}`
    const { stdout, stderr } = await execute(command)

    return {
        stdout, stderr
    }
}

export const startProcess = async (name: string) => {
    const command = `sudo systemctl start ${name}`
    const { stdout, stderr } = await execute(command)

    return {
        stdout, stderr
    }
}

export const enableProcess = async (name: string) => {
    const command = `sudo systemctl enable ${name}`
    const { stdout, stderr } = await execute(command)

    return {
        stdout, stderr
    }
}

export const disableProcess = async (name: string) => {
    const command = `sudo systemctl disable ${name}`
    const { stdout, stderr } = await execute(command)
    
    return {
        stdout, stderr
    }
}

export const restartProcess = async (name: string) => {
    const command = `sudo systemctl restart ${name}`
    const { stdout, stderr } = await execute(command)

    return {
        stdout, stderr
    }
}

export const getDeviceSerialNumber = async () => {
    const { stdout, stderr } = await execute("cat /sys/firmware/devicetree/base/serial-number")

    return {
        stdout, stderr
    }
}

export const deviceReboot = async () => {
    const { stdout, stderr } = await execute("sudo reboot")

    return {
        stdout, stderr
    }
}