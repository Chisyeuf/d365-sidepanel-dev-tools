import { useState, useEffect, useMemo, useCallback } from 'react'

export function useStorage<T>(key: string, defaultData: T): [T | null, (data: T) => void] {

    const [data, setData] = useState<T | null>(null);

    const set = (data: T) => {
        let dataUpdate: { [key: string]: any } = {}
        dataUpdate[key] = data
        chrome.storage.sync.set(dataUpdate);
    }

    useEffect(() => {
        async function getData() {

            const dataStored = await chrome.storage.sync.get(key);
            console.log(key, dataStored);
            if (dataStored && dataStored[key]) {
                setData(dataStored[key]);
            }
            else {
                setData(defaultData);
            }
        }
        setData(null);
        getData();
    }, [key])

    return [data, set];
}