import { useState, useEffect } from 'react'
import { debugLog } from '../../global/common';
import { Entity } from '../../types/requestsType';

export function RetrieveEntities() : [Entity[], boolean] {

    const [data, setData] = useState<Entity[]>([]);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    

    useEffect(() => {
        debugLog("RetrieveEntities");
        async function fetchData() {

            const response = await fetch(Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.0/EntityDefinitions?$select=MetadataId,LogicalName,SchemaName,DisplayName", {
                method: "GET",
                headers: {
                    "OData-MaxVersion": "4.0",
                    "OData-Version": "4.0",
                    "Content-Type": "application/json; charset=utf-8",
                    "Accept": "application/json"
                }
            });

            const results = await response.json();

            results.value.sort((a: any, b: any) => a["DisplayName"]?.["UserLocalizedLabel"]?.Label?.localeCompare(b["DisplayName"]?.["UserLocalizedLabel"]?.Label));
            var entities: Entity[] = results.value.map((entity: any) => {
                return { logicalname: entity["LogicalName"], name: entity["DisplayName"]?.["UserLocalizedLabel"]?.Label || entity["SchemaName"], entityid: entity["MetadataId"] };
            });

            setIsFetching(false);
            setData(entities);
        }
        setData([])
        setIsFetching(true);
        fetchData();

    }, []);

    return [data, isFetching];
}