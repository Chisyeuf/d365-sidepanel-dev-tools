import { useState, useEffect } from 'react'
import { debugLog } from '../../global/common';

export function RetrieveSingleAttribute(entityname: string, recordid: string | undefined, attributeName: string) {

    const [data, setData] = useState<any>(undefined);
    const _recordid = recordid;
    const _entityname = entityname;

    useEffect(() => {
        debugLog("RetrieveSingleAttribute");
        if (!_entityname || !_recordid || !attributeName || attributeName.length === 0) {
            setData(undefined)
            return
        }
        async function fetchData() {
            if (!_entityname || !_recordid || !attributeName || attributeName.length === 0) return;
            const result = await Xrm.WebApi.online.retrieveRecord(_entityname, _recordid, "?$select=" + attributeName);
            setData(result[attributeName]);
        }
        setData(undefined)
        fetchData();

    }, [attributeName, _recordid]);

    return data;
}