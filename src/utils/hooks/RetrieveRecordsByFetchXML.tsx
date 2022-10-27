import { useState, useEffect } from 'react'

export function RetrieveRecordsByFetchXML(entityname: string, fetchXML: string) {

    const [data, setData] = useState<any>({});
    const _entityname = entityname;
    const _fetchXML = "?fetchXml=" + fetchXML;

    useEffect(() => {
        if (!_entityname || _fetchXML == "?fetchXml=") return;
        async function fetchData() {                        
            const results = await Xrm.WebApi.retrieveMultipleRecords(entityname, _fetchXML);

            for (let i = 0; i < results.entities.length; i++) {
                results.entities[i].id = i;
            }            
            setData(results.entities);
        }
        fetchData();

    }, [_entityname, _fetchXML]);

    return data;
}