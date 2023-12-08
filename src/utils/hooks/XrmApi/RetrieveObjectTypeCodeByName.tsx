import { useState, useEffect } from 'react'
import { debugLog } from '../../global/common';

export function RetrieveObjectTypeCodeByName(entityname: string): [number | undefined, boolean] {

    const [data, setData] = useState<number>();
    const [isFetching, setIsFetching] = useState<boolean>(false);

    useEffect(() => {
        debugLog("RetrieveObjectTypeCodeByName");
        if (!entityname) return;

        async function fetchData() {
            const response = await fetch(
                Xrm.Utility.getGlobalContext().getClientUrl() +
                "/api/data/v9.2/EntityDefinitions(LogicalName='" + entityname + "')?$select=ObjectTypeCode", {
                method: "GET",
                headers: {
                    "OData-MaxVersion": "4.0",
                    "OData-Version": "4.0",
                    "Content-Type": "application/json; charset=utf-8",
                    "Accept": "application/json",
                    "Prefer": "odata.include-annotations=*"
                }
            });

            const results = await response.json();

            setData(results.ObjectTypeCode);
            setIsFetching(false);
        }
        setIsFetching(true);
        setData(undefined);
        fetchData();

    }, [entityname]);
    // }, [_entityname, idAttribute]);

    return [data, isFetching];
}