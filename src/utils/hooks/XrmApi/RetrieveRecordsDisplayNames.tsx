import { useState, useEffect, useMemo } from 'react'
import { RetrievePrimaryAttribute } from './RetrievePrimaryAttribute';

export type RecordsDisplayNamesResponse = {
    id: string,
    displayName: string
}
export function RetrieveRecordsDisplayNames(entityname: string, recordsid: string[]) : [RecordsDisplayNamesResponse[], boolean] {

    const primaryAttribute = RetrievePrimaryAttribute(entityname)
    const [data, setData] = useState<RecordsDisplayNamesResponse[]>([])
    const [fetching, setFetching] = useState<boolean>(false)

    const _entityname = entityname
    const _recordsid = useMemo(() => {
        return recordsid.map(r => {
            return r ? _entityname + "id eq " + r : ""
        }).join(" or ")
    }, [recordsid])


    useEffect(() => {
        console.log("RetrieveRecordsDisplayNames");
        async function fetchData() {
            if (!_entityname || !_recordsid || !primaryAttribute) {
                setData([])
                setFetching(false)
                return;
            }
            const result = await Xrm.WebApi.online.retrieveMultipleRecords(_entityname, "?$select=" + primaryAttribute + "&$filter=" + _recordsid);
            
            const dataProcessed: RecordsDisplayNamesResponse[] = []
            for (let i = 0; i < result?.entities?.length; i++) {
                const record = result.entities[i];
                dataProcessed.push({ id: record[_entityname + "id"], displayName: record[primaryAttribute] })
            }
            setData(dataProcessed)
            setFetching(false)
        }
        setFetching(true)
        fetchData()

    }, [primaryAttribute, _recordsid]);

    return [data, fetching]
}