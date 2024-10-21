import { useState, useEffect, useMemo, useCallback } from 'react'

export function useDictionnary<DictValueType>(defaultValue: { [key: string]: DictValueType }) {

    const [dict, setDict] = useState<{ [key: string]: DictValueType }>(defaultValue);

    const keys: string[] = useMemo(
        () => {
            return Object.keys(dict)
        }, [dict]
    );
    const values: DictValueType[] = useMemo(
        () => {
            return Object.values(dict)
        }, [dict]
    );


    const setValue = useCallback(
        (key: string, value: DictValueType) => {
            setDict((oldDict) => { return {...oldDict, [key]: value} });
        }, [setDict]
    );

    const removeValue = useCallback(
        (key: string) => {
            setDict(oldDict => { const { [key]: removedProperty, ...newDict } = oldDict; return newDict; });
        }, [setDict]
    );


    return { dict, keys, values, setDict, setValue, removeValue };
}