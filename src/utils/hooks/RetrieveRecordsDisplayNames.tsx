import { useState, useEffect } from 'react'
import { RetrievePrimaryAttribute } from './RetrievePrimaryAttribute';

type RecordsDisplayNamesResponse = {
    id: string,
    displayName: string
}
export function RetrieveRecordsDisplayNames(entityname: string, recordsid: string[]) {

    const primaryAttribute = RetrievePrimaryAttribute(entityname)
    const [data, setData] = useState<RecordsDisplayNamesResponse[]>([]);
    const _entityname = entityname;
    const _recordsid = recordsid.map(r => {
        return r ? _entityname + "id eq " + r : ""
    }).join(" or ");


    useEffect(() => {
        if (!_entityname || !_recordsid || !primaryAttribute) return;
        async function fetchData() {
            const result = await Xrm.WebApi.online.retrieveMultipleRecords(_entityname, "?$select=" + primaryAttribute + "&$filter=" + _recordsid);

            const dataProcessed: RecordsDisplayNamesResponse[] = []
            for (let i = 0; i < result?.entities?.length; i++) {
                const record = result.entities[i];
                dataProcessed.push({ id: record[_entityname + "id"], displayName: record[primaryAttribute] })
            }
            setData(dataProcessed);
        }
        fetchData();

    }, [primaryAttribute, _entityname, _recordsid]);

    return data;
}