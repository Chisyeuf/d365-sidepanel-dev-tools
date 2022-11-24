import { useState, useEffect } from 'react'
import { MSType } from '../../global/requestsType';

export function RetrievePicklistValues(entityname: string, type: MSType, fieldname: string) {

    const [data, setData] = useState<Xrm.OptionSetValue[]>();

    useEffect(() => {
        console.log("RetrievePicklistValues");
        if (!entityname) return;
        async function fetchData() {
            const response = await fetch(
                Xrm.Utility.getGlobalContext().getClientUrl() +
                "/api/data/v9.2/EntityDefinitions(LogicalName='" +
                entityname +
                "')/Attributes/" +
                type +
                "?$select=LogicalName&$filter=LogicalName eq '" +
                fieldname +
                "'&$expand=OptionSet,GlobalOptionSet", {
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

            const values: Xrm.OptionSetValue[] = results.value?.at(0).OptionSet.Options.map((option: any) => {
                return { text: option.Label.UserLocalizedLabel.Label, value: option.Value };
            });

            setData(values);
        }
        setData([])
        fetchData();

    }, [fieldname, type]);

    return data;
}