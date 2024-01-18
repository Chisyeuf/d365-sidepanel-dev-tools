import { StorageConfiguration } from "../../utils/types/StorageConfiguration";

const setStorage = (key: string, data: any) => {
    let dataUpdate: { [key: string]: any } = {};
    dataUpdate[key] = data;
    chrome.storage.sync.set(dataUpdate);
}

export function setExtensionConfiguration(data: { key: string, configurations: StorageConfiguration[] }) {
    setStorage(data.key, data.configurations);
}

export async function getExtensionConfiguration(data: { key: string }): Promise<any | null> {
    const dataStored = await chrome.storage.sync.get(data.key);
    if (dataStored && dataStored.hasOwnProperty(data.key)) {
        return dataStored[data.key];
    }
    return null;
}