import { useState, useEffect } from 'react'
import { debugLog } from '../../global/common';
import { MSType } from '../../types/requestsType';

export interface PickListOption {
    "@odata.type"?:  string;
    Value:           number;
    Color:           null | string;
    IsManaged:       boolean;
    ExternalValue:   null | string;
    ParentValues:    any[];
    Tag:             null;
    MetadataId:      null;
    HasChanged:      null;
    DefaultStatus?:  number;
    InvariantName?:  string;
    Label:           Description;
    Description:     Description;
    State?:          number;
    TransitionData?: string;
}

export interface Description {
    LocalizedLabels:    LocalizedLabel[];
    UserLocalizedLabel: LocalizedLabel | null;
}

export interface LocalizedLabel {
    Label:        string;
    LanguageCode: number;
    IsManaged:    boolean;
    MetadataId:   string;
    HasChanged:   null;
}


export function RetrievePicklistValues(entityname: string, type: MSType, fieldname: string) {

    const [data, setData] = useState<PickListOption[]>();

    useEffect(() => {
        debugLog("RetrievePicklistValues");
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

            const values: PickListOption[] = results.value?.at(0).OptionSet.Options

            setData(values);
        }
        setData([])
        fetchData();

    }, [fieldname, type]);

    return data;
}