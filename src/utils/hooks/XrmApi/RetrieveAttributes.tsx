import { useState, useEffect, useMemo } from 'react'
import { debugLog, isObjectEquals } from '../../global/common';

export function RetrieveAttributes(entityname: string, recordid: string | undefined, attributesList: string[]): [{ [key: string]: any }, boolean] {

    const [data, setData] = useState<{ [key: string]: any }>({});
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const attributes = useMemo(() => attributesList.join(","), [attributesList]);
    const _recordid = recordid;
    const _entityname = entityname;

    useEffect(() => {
        debugLog("RetrieveAttributes");
        if (!_entityname || !_recordid || !attributes || attributes.length === 0) {
            setData({});
            setIsFetching(false);
            return;
        }
        async function fetchData() {
            if (!_entityname || !_recordid || !attributes || attributes.length === 0) return;
            const result = await Xrm.WebApi.online.retrieveRecord(_entityname, _recordid, "?$select=" + attributes);
            delete result["@odata.context"];
            delete result["@odata.etag"];

            if (!isObjectEquals(result, data)) {
                setData(result);
            }
            setIsFetching(false);
        }
        setIsFetching(true);
        fetchData();

    }, [attributes, _recordid]);

    return [data, isFetching];
}