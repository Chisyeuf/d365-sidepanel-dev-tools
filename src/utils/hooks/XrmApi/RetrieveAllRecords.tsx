import { useState, useEffect, useMemo } from 'react'
import { debugLog } from '../../global/common';

export function RetrieveAllRecords(entityname: string, attributesList: string[], pageSize?: number): [any[], boolean] {

    const [data, setData] = useState<any[]>([]);
    const [isFetching, setFetching] = useState<boolean>(false)

    const attributes = useMemo(() => attributesList.join(","), [attributesList]);
    const _entityname = entityname;
    // const _filter = filter

    useEffect(() => {

        if (!_entityname) return;
        
        // if (attributes.indexOf(_entityname + "id") == -1) return;

        async function fetchData(link: string = "") {
            debugLog("RetrieveAllRecords");
            
            const options: string =
                (attributes ? "?$select=" + attributes : '') +
                (link ? (attributes ? "&" : '') + link : "")
            //  +(_filter ? "&$filter=" + _filter : "")

            const result = await Xrm.WebApi.online.retrieveMultipleRecords(_entityname, options, pageSize);

            setData((oldData) => [...oldData, ...(result.entities)]);

            if (result.nextLink) {
                let linkIndex: number = result.nextLink.indexOf("$skiptoken")
                let url: string = result.nextLink.substring(linkIndex)
                fetchData(url)
            }
            else {
                setFetching(false)
            }
        }
        setData([])
        setFetching(true)
        fetchData();

    }, [attributes]);

    useEffect(() => {
        setData([])
    }, [_entityname])

    return [data, isFetching];
}