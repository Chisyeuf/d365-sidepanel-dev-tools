import { useState, useEffect, useMemo } from 'react'
import { debugLog } from '../../global/common';
import { RetrievePrimaryIdAttribute } from './RetrievePrimaryIdAttribute';
import { RetrievePrimaryNameAttribute } from './RetrievePrimaryNameAttribute';

export type RecordsDisplayNamesResponse = {
    id: string,
    displayName: string
}
export function RetrieveRecordsDisplayNames(entityname: string, recordsid: string[]) : [RecordsDisplayNamesResponse[], boolean] {

    const [data, setData] = useState<RecordsDisplayNamesResponse[]>([])
    const [fetching, setFetching] = useState<boolean>(false)
    
    const primaryAttribute = RetrievePrimaryNameAttribute(entityname)
    const idAttribute = RetrievePrimaryIdAttribute(entityname)

    const _entityname = entityname
    const _recordsid = useMemo(() => {
        return recordsid.map(r => {
            return r && idAttribute ? idAttribute + " eq " + r : ''
        }).join(" or ")
    }, [recordsid, idAttribute])


    useEffect(() => {
        debugLog("RetrieveRecordsDisplayNames");
        async function fetchData() {
            if (!_entityname || !_recordsid || _recordsid === '' || !primaryAttribute) {
                setData([])
                setFetching(false)
                return;
            }
            const result = await Xrm.WebApi.online.retrieveMultipleRecords(_entityname, `?$select=${primaryAttribute}&$filter=${_recordsid}`);
            
            const dataProcessed: RecordsDisplayNamesResponse[] = []
            for (let i = 0; i < result?.entities?.length; i++) {
                const record = result.entities[i];
                dataProcessed.push({ id: record[idAttribute], displayName: record[primaryAttribute] })
            }
            setData(dataProcessed)
            setFetching(false)
        }
        setFetching(true)
        fetchData()

    }, [primaryAttribute, _recordsid, idAttribute, _entityname]);

    return [data, fetching]
}