import { useState, useEffect } from 'react'
import { debugLog } from '../../global/common';

export function RetrieveAllAttributes(entityname: string, recordid: string | undefined): [{ [key: string]: any }, boolean] {

    const [data, setData] = useState<{ [key: string]: any }>({});
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const _recordid = recordid;
    const _entityname = entityname;

    useEffect(() => {
        debugLog("RetrieveAllAttributes");
        if (!_entityname || !_recordid) {
            setData({});
            setIsFetching(false);
            return
        }
        async function fetchData() {
            if (!_entityname || !_recordid) return
            const result = await Xrm.WebApi.online.retrieveRecord(_entityname, _recordid)
            delete result["@odata.context"]
            delete result["@odata.etag"]
            setData(result);
            setIsFetching(false);
        }
        setIsFetching(true);
        setData({});
        fetchData();

    }, [_recordid]);

    return [data, isFetching];
}