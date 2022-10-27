import { useState, useEffect } from 'react'

export function RetrievePrimaryAttribute(entityname: string) {

    const [data, setData] = useState<string>("");

    useEffect(() => {
        if (!entityname ) return;
        async function fetchData() {
            const primaryNameLogicalName = (await Xrm.Utility.getEntityMetadata(entityname)).PrimaryNameAttribute;

            setData(primaryNameLogicalName);
        }
        fetchData();

    }, [entityname]);

    return data;
}