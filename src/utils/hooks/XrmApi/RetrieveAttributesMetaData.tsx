import { useState, useEffect } from 'react'
import { AttributeMetadata, MSType, getMSTypeKeyByValue, getMSFormatDateKeyByValue } from '../../global/requestsType';

export function RetrieveAttributesMetaData(entityname: string) {

    const [data, setData] = useState<AttributeMetadata[]>([]);
    const _entityname = entityname

    useEffect(() => {
        console.log("RetrieveAttributesMetaData");
        if (!entityname) return;
        async function fetchData() {
            const response = await fetch(
                Xrm.Utility.getGlobalContext().getClientUrl() +
                "/api/data/v9.2/EntityDefinitions(LogicalName='" +
                _entityname + "')/Attributes?$filter=DisplayName ne null and IsValidODataAttribute eq true and IsValidForRead eq true and (AttributeType ne 'Uniqueidentifier' or LogicalName eq '" + _entityname + "id')", {
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
            // results.value?.filter((r: any) => r?.IsPrimaryId != false)
            results.value?.sort((a: any, b: any) => {
                var n = a.DisplayName?.UserLocalizedLabel?.Label?.localeCompare(b.DisplayName?.UserLocalizedLabel?.Label);
                if (n != null && n !== 0) {
                    return n;
                }
                return a.SchemaName.localeCompare(b.SchemaName);
            });

            // const responsePrimaryId = await fetch(
            //     Xrm.Utility.getGlobalContext().getClientUrl() +
            //     "/api/data/v9.2/EntityDefinitions(LogicalName='" +
            //     _entityname + "')/Attributes?$filter=DisplayName ne null and IsValidODataAttribute eq true and AttributeType eq 'Uniqueidentifier'", {
            //     method: "GET",
            //     headers: {
            //         "OData-MaxVersion": "4.0",
            //         "OData-Version": "4.0",
            //         "Content-Type": "application/json; charset=utf-8",
            //         "Accept": "application/json",
            //         "Prefer": "odata.include-annotations=*"
            //     }
            // });

            // const resultsPrimaryId = await responsePrimaryId.json();
            // const primaryId = resultsPrimaryId.value?.find((r:any) => r?.IsPrimaryId)
            // results.value?.push(primaryId)

            const dataM: AttributeMetadata[] = results.value?.map((attribute: any) => {
                const t: AttributeMetadata = {
                    LogicalName: attribute.LogicalName,
                    DisplayName: attribute?.DisplayName?.UserLocalizedLabel?.Label || attribute.SchemaName,
                    SchemaName: attribute.SchemaName,
                    MStype: attribute["@odata.type"] ? getMSTypeKeyByValue(attribute["@odata.type"].replace("#", "")) : attribute.AttributeType,
                    IsValidForCreate: attribute.IsValidForCreate,
                    IsValidForForm: attribute.IsValidForForm,
                    IsValidForGrid: attribute.IsValidForGrid,
                    IsValidForRead: attribute.IsValidForRead,
                    IsValidForUpdate: attribute.IsValidForUpdate,
                    IsValidODataAttribute: attribute.IsValidODataAttribute,
                    Parameters: {
                        MinValue: attribute.MinValue,
                        MaxValue: attribute.MaxValue,
                        Precision: attribute.Precision,
                        MaxLength: attribute.MaxLength,
                        Target: attribute.Targets?.at(0),
                        Format: getMSFormatDateKeyByValue(attribute.Format)
                    }
                };
                return t;
            });
            setData(dataM);
        }
        setData([])
        fetchData();

    }, [_entityname]);

    return data;
}