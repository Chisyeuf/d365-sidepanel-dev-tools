import { useState, useEffect } from 'react'
import { debugLog } from '../../global/common';

export function RetrievePrimaryIdAttribute(entityname: string) {

    const [data, setData] = useState<string>("");

    useEffect(() => {
        debugLog("RetrievePrimaryIdAttribute");
        if (!entityname ) return;
        async function fetchData() {
            const primaryNameLogicalName = (await Xrm.Utility.getEntityMetadata(entityname)).PrimaryIdAttribute;

            setData(primaryNameLogicalName);
        }
        setData("")
        fetchData();

    }, [entityname]);

    return data;
}