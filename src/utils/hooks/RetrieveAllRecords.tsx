import { useState, useEffect } from 'react'

export function RetrieveAllRecords(entityname: string, attributesList: string[], top: number = 100) {

    const [data, setData] = useState<any[]>([]);
    const attributes = attributesList.join(",");
    const _entityname = entityname;

    useEffect(() => {
        if (!_entityname || !attributes || attributes.length === 0) return;
        async function fetchData(link: string = "") {
            const result = await Xrm.WebApi.online.retrieveMultipleRecords(_entityname, "?$select=" + attributes + (link ? "&" + link : ""), top);
            setData((oldData) => [...oldData, ...(result.entities)]);
            if (result.nextLink) {
                let linkIndex: number = result.nextLink.indexOf("$skiptoken")
                let url: string = result.nextLink.substring(linkIndex)
                fetchData(url)
            }
        }
        fetchData();

    }, [attributes, _entityname]);

    return data;
}