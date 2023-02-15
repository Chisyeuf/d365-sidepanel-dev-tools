import { useState, useEffect } from 'react'

export function RetrievePrimaryIdAttribute(entityname: string) {

    const [data, setData] = useState<string>("");

    useEffect(() => {
        console.log("RetrievePrimaryIdAttribute");
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