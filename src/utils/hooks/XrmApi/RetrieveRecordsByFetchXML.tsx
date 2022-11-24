import { useState, useEffect, useMemo } from 'react'

export function RetrieveRecordsByFetchXML(entityname: string, fetchXML: string) {

    const [data, setData] = useState<any>({});
    const _entityname = entityname;
    const _fetchXML = useMemo(() => "?fetchXml=" + fetchXML, [fetchXML]);

    useEffect(() => {
        console.log("RetrieveRecordsByFetchXML");
        if (!_entityname || _fetchXML == "?fetchXml=") return;
        async function fetchData() {                        
            const results = await Xrm.WebApi.retrieveMultipleRecords(entityname, _fetchXML);

            for (let i = 0; i < results.entities.length; i++) {
                results.entities[i].id = i;
            }            
            setData(results.entities);
        }
        setData({})
        fetchData();

    }, [_fetchXML]);

    return data;
}