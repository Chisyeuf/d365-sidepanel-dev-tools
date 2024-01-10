import { useState, useEffect } from 'react'
import { debugLog } from '../../global/common';
import { MSType } from '../../types/requestsType';

export interface PickList {
    IsGlobal:boolean;
    IsManaged:boolean;
    IsCustomOptionSet:boolean;
    Name:string;
    ExternalTypeName:string;
    OptionSetType:string;
    Options:PickListOption[];
    DisplayName:Description;
    Description:Description;
}

export interface PickListOption {
    Value: number;
    Color: null | string;
    IsManaged: boolean;
    ExternalValue: null | string;
    ParentValues: any[];
    Tag: null;
    MetadataId: null;
    HasChanged: null;
    DefaultStatus?: number;
    InvariantName?: string;
    Label: Description;
    Description: Description;
    State?: number;
    TransitionData?: string;
}

export interface Description {
    LocalizedLabels: LocalizedLabel[];
    UserLocalizedLabel: LocalizedLabel | null;
}

export interface LocalizedLabel {
    Label: string;
    LanguageCode: number;
    IsManaged: boolean;
    MetadataId: string;
    HasChanged: null;
}


export function RetrievePicklistValues(entityname: string, type: MSType, fieldname?: string): [{ [attributeLogicalName: string]: PickList }, boolean] {

    const [data, setData] = useState<{ [attributeLogicalName: string]: PickList }>({});
    const [isFetching, setIsFetching] = useState<boolean>(false);

    useEffect(() => {
        debugLog("RetrievePicklistValues");
        if (!entityname || !type) {
            setIsFetching(false);
            return;
        }

        async function fetchData() {
            const _filter = fieldname ? `&$filter=LogicalName eq '${fieldname}'` : '';
            const response = await fetch(
                Xrm.Utility.getGlobalContext().getClientUrl() +
                `/api/data/v9.2/EntityDefinitions(LogicalName='${entityname}')/Attributes/${type}?$select=LogicalName${_filter}&$expand=OptionSet`, {
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


            const values: { [attributeLogicalName: string]: PickList } = results.value?.reduce((previousValue: any, currentValue: any, currentIndex: number, array: any[]) => ({ ...previousValue, [currentValue.LogicalName]: currentValue.OptionSet }), {});

            setIsFetching(false);
            setData(values);
        }
        setIsFetching(true);
        setData({})
        fetchData();

    }, [fieldname, type, entityname]);

    return [data, isFetching];
}