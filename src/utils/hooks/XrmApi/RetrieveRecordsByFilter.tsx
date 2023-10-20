import { useState, useEffect, useMemo, useCallback } from 'react'
import { debugLog } from '../../global/common';

export function RetrieveRecordsByFilter(entityname: string, attributesList: string[], filter: string, orderby?: string): [any[], boolean, () => void] {

    const [data, setData] = useState<any[]>([]);
    const [isFetching, setFetching] = useState<boolean>(false);
    const [launchFlag, setLaunchFlag] = useState<boolean>(false);

    const refresh = useCallback(() => {
        setLaunchFlag((prev) => !prev);
    }, []);


    const attributes = useMemo(() => attributesList.join(","), [attributesList]);
    const _entityname = entityname;
    const _filter = filter;

    useEffect(() => {

        if (!_entityname) return;

        async function fetchData() {
            debugLog("RetrieveRecordsByFilter");

            var options: string = '';
            options += (attributes ? (options ? '&' : '') + "$select=" + attributes : '');
            options += (_filter ? (options ? '&' : '') + '$filter=' + _filter : "");
            options += (orderby ? (options ? '&' : '') + '$orderby=' + orderby : '');

            const result = await Xrm.WebApi.online.retrieveMultipleRecords(_entityname, '?' + options);

            setData(result.entities);
            setFetching(false);
        }
        // setData([]);
        setFetching(true);
        fetchData();

    }, [attributes, filter, orderby, launchFlag]);

    useEffect(() => {
        setData([]);
    }, [_entityname]);

    return [data, isFetching, refresh];
}