import { useState, useEffect } from 'react'
import { debugLog } from '../../global/common';

export function RetrievePrimaryNameAttribute(entityname: string) {

    const [data, setData] = useState<string>("");

    useEffect(() => {
        debugLog("RetrievePrimaryNameAttribute");
        if (!entityname ) return;
        async function fetchData() {
            const primaryNameLogicalName = (await Xrm.Utility.getEntityMetadata(entityname)).PrimaryNameAttribute;

            setData(primaryNameLogicalName);
        }
        setData("")
        fetchData();

    }, [entityname]);

    return data;
}