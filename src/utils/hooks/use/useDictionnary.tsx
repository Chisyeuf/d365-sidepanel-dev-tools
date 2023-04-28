import { useState, useEffect, useMemo, useCallback } from 'react'

export function useDictionnary<DictValueType>(defaultValue: { [key: string]: DictValueType }) {

    const [dict, setDict] = useState<{ [key: string]: DictValueType }>(defaultValue);

    const keys: string[] = useMemo(
        () => {
            return Object.keys(dict)
        }, [dict]
    )
    const values: DictValueType[] = useMemo(
        () => {
            return Object.values(dict)
        }, [dict]
    )
    const entries: [string, DictValueType][] = useMemo(
        () => {
            return Object.entries(dict)
        }, [dict]
    )


    const setValue = useCallback(
        (key: string, value: DictValueType) => {
            setDict((oldDict) => { oldDict[key] = value; return oldDict })
        }, []
    )

    const removeValue = useCallback(
        (key: string) => {
            setDict(oldDict => { delete oldDict[key]; return oldDict })
        }, []
    )


    return { dict, keys, values, setDict, setValue, removeValue };
}