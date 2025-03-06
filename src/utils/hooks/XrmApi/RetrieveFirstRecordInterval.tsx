import { useState, useEffect, useMemo, useCallback } from 'react'
import { debugLog } from '../../global/common';

export function RetrieveFirstRecordInterval(entityname: string, attributesList: string[], filter: string, orderby?: string): [any | undefined, boolean, () => void] {

    const [data, setData] = useState<any>();
    const [isFetching, setFetching] = useState<boolean>(false);
    const [launchFlag, setLaunchFlag] = useState(false);


    const attributes = useMemo(() => attributesList.join(","), [attributesList]);
    const _entityname = entityname;
    const _filter = filter;

    const refresh = useCallback(() => {
        setLaunchFlag((prev) => !prev);
    }, []);

    useEffect(() => {

        if (!_entityname) return;

        async function fetchData() {
            debugLog("RetrieveFirstRecordInterval");

            var options: string = '';
            options += (attributes ? (options ? '&' : '') + "$select=" + attributes : '');
            options += (_filter ? (options ? '&' : '') + '$filter=' + _filter : "");
            options += (orderby ? (options ? '&' : '') + '$orderby=' + orderby : '');

            const result = await Xrm.WebApi.online.retrieveMultipleRecords(_entityname, '?' + options, 1);

            setData(result.entities[0]);
            setFetching(false);
        }
        setData(undefined);
        setFetching(true);
        fetchData();

    }, [_entityname, _filter, attributes, launchFlag, orderby]);

    useEffect(() => {
        setData(undefined);
    }, [_entityname]);

    return [data, isFetching, refresh];
}