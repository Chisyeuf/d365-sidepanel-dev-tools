import { useState, useEffect } from 'react'

type AttributesDisplayNameRequest = {
    logicalname: string,
    relatedentity: string
}
export function RetrieveAttributesDisplayName(fieldsList: AttributesDisplayNameRequest[]) {

    const [data, setData] = useState<{ [field: string]: string }>({});
    const entityFilter = fieldsList.map(f => {
        return "LogicalName eq '" + f.relatedentity + "'"
    }).join(" or ");
    const fieldFilter = fieldsList.map(f => {
        return "LogicalName eq '" + f.logicalname + "'"
    }).join(" or ");

    useEffect(() => {

        if (!fieldFilter || fieldFilter.length == 0 || !entityFilter || entityFilter.length == 0) return;
        async function fetchData() {            
            const response = await fetch(
                Xrm.Utility.getGlobalContext().getClientUrl() +
                "/api/data/v9.2/EntityDefinitions?$select=LogicalName&$filter=" + entityFilter +
                "&$expand=Attributes($select=DisplayName,SchemaName,LogicalName;$filter=" + fieldFilter + ")", {
                method: "GET",
                headers: {
                    "OData-MaxVersion": "4.0",
                    "OData-Version": "4.0",
                    "Content-Type": "application/json; charset=utf-8",
                    "Accept": "application/json",
                    "Prefer": "odata.include-annotations=*"
                }
            });
            // const response = await fetch(
            //     Xrm.Utility.getGlobalContext().getClientUrl() +
            //     "/api/data/v9.2/EntityDefinitions(LogicalName='" +
            //     entityname + "')/Attributes?$select=DisplayName,SchemaName,LogicalName&$filter=" + filter, {
            //     method: "GET",
            //     headers: {
            //         "OData-MaxVersion": "4.0",
            //         "OData-Version": "4.0",
            //         "Content-Type": "application/json; charset=utf-8",
            //         "Accept": "application/json",
            //         "Prefer": "odata.include-annotations=*"
            //     }
            // });

            const results = await response.json();

            const dataM: { [field: string]: string } = {};
            for (let i = 0; i < fieldsList.length; i++) {
                const element = fieldsList[i];
                const fieldName = element.relatedentity + element.logicalname
                const attributeNode = results?.value?.find((entity: any) => entity.LogicalName == element.relatedentity)?.Attributes?.find((att: any) => att.LogicalName == element.logicalname)
                const label = attributeNode?.DisplayName?.UserLocalizedLabel?.Label
                const schemaName = attributeNode?.SchemaName
                dataM[fieldName] = label ?? schemaName;
            }
            setData(dataM);
        }
        fetchData();

    }, [fieldFilter, entityFilter]);

    return data;
}