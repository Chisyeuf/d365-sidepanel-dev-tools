import { useState, useEffect } from 'react'

export function RetrieveAttributes(entityname: string, recordid: string, attributesList: string[]) {

    const [data, setData] = useState<any>({});
    const attributes = attributesList.join(",");
    const _recordid = recordid;
    const _entityname = entityname;

    useEffect(() => {
        if (!_entityname || !_recordid || !attributes || attributes.length === 0) return;
        async function fetchData() {
            const result = await Xrm.WebApi.online.retrieveRecord(_entityname, _recordid, "?$select=" + attributes);
            delete result["@odata.context"];
            delete result["@odata.etag"];
            setData(result);
        }
        fetchData();

    }, [attributes, _entityname, _recordid]);

    return data;
}