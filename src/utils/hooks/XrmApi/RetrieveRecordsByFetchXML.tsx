import { useState, useEffect, useMemo } from 'react'
import { debugLog } from '../../global/common';

export function RetrieveRecordsByFetchXML(entityname: string, fetchXML: string) : [any[], boolean] {

    const [data, setData] = useState<any[]>([])
    const [isFetching, setFetching] = useState<boolean>(false)
    const _entityname = entityname;
    const _fetchXML = useMemo(() => "?fetchXml=" + fetchXML, [fetchXML]);

    useEffect(() => {
        debugLog("RetrieveRecordsByFetchXML");
        if (!_entityname || _fetchXML === "?fetchXml=") {
            setFetching(false)
            setData([])
            return
        }
        async function fetchData() {                        
            const results = await Xrm.WebApi.retrieveMultipleRecords(_entityname, _fetchXML);

            for (let i = 0; i < results.entities.length; i++) {
                results.entities[i].id = i;
            }            
            setData(results.entities)
            setFetching(false)
        }
        setFetching(true)
        setData([])
        fetchData()

    }, [_entityname, _fetchXML]);

    return [data, isFetching];
}