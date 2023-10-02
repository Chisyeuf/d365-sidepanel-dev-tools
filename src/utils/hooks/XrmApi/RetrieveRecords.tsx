import { useState, useEffect, useMemo } from 'react'
import { debugLog } from '../../global/common';

export function RetrieveRecords(entityname: string, attributesList: string[], filter: string, orderby?: string): [any[], boolean] {

    const [data, setData] = useState<any[]>([]);
    const [isFetching, setFetching] = useState<boolean>(false)

    const attributes = useMemo(() => attributesList.join(","), [attributesList]);
    const _entityname = entityname;
    const _filter = filter;

    useEffect(() => {

        if (!_entityname) return;

        // if (attributes.indexOf(_entityname + "id") == -1) return;

        async function fetchData() {
            debugLog("RetrieveRecords");

            var options: string = '';
            options += (attributes ? (options ? '&' : '') + "$select=" + attributes : '');
            options += (_filter ? (options ? '&' : '') + '$filter=' + _filter : "");
            options += (orderby ? (options ? '&' : '') + '$orderby=' + orderby : '');

            const result = await Xrm.WebApi.online.retrieveMultipleRecords(_entityname, '?' + options);

            setData(result.entities);
            setFetching(false);
        }
        setData([]);
        setFetching(true);
        fetchData();

    }, [attributes]);

    useEffect(() => {
        setData([]);
    }, [_entityname]);

    return [data, isFetching];
}