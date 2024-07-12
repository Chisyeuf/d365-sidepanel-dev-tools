import { useState, useEffect } from 'react'
import { debugLog } from '../../global/common';
import { Entity } from '../../types/requestsType';

export function RetrieveEntityMetadata(entityname: string) {

    const [data, setData] = useState<Entity | null>(null);

    useEffect(() => {
        debugLog("RetrieveEntityMetadata");
        if (!entityname) return;

        async function fetchData() {

            const response = await fetch(Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.0/EntityDefinitions(LogicalName='" + entityname + "')?$select=MetadataId,LogicalName,SchemaName,DisplayName", {
                method: "GET",
                headers: {
                    "OData-MaxVersion": "4.0",
                    "OData-Version": "4.0",
                    "Content-Type": "application/json; charset=utf-8",
                    "Accept": "application/json"
                }
            });

            const results = await response.json();
            if (!results) {
                setData(null);
            }
            else {
                const entity = {
                    logicalname: results["LogicalName"],
                    name: results["DisplayName"]?.["UserLocalizedLabel"]?.Label || results["SchemaName"],
                    entityid: results["MetadataId"]
                }

                setData(entity);
            }
        }
        setData(null);
        fetchData();

    }, [entityname]);

    return data;
}