import { useState, useEffect, useMemo } from 'react'

export function RetrieveAttributes(entityname: string, recordid: string | undefined, attributesList: string[]) {

    const [data, setData] = useState<any>({});
    const attributes = useMemo(() => attributesList.join(","), [attributesList]);
    const _recordid = recordid;
    const _entityname = entityname;

    useEffect(() => {
        console.log("RetrieveAttributes");
        if (!_entityname || !_recordid || !attributes || attributes.length === 0) {
            setData([])
            return
        }
        async function fetchData() {
            if (!_entityname || !_recordid || !attributes || attributes.length === 0) return;
            const result = await Xrm.WebApi.online.retrieveRecord(_entityname, _recordid, "?$select=" + attributes);
            delete result["@odata.context"];
            delete result["@odata.etag"];
            setData(result);
        }
        setData([])
        fetchData();

    }, [attributes, _recordid]);

    return data;
}