import { useState, useEffect } from 'react'
import { debugLog } from '../../global/common';
import { OptionSetValue } from '../../types/OptionSetValue';

export function RetrievePicklistDefaultValue(entityname: string, fieldnames: string[]) {

    const [data, setData] = useState<OptionSetValue[]>([]);

    useEffect(() => {
        debugLog("RetrievePicklistValues");
        if (!entityname) return;
        async function fetchData() {
            const response = await Xrm.Utility.getEntityMetadata('account', fieldnames);

            const attributes = response.Attributes.get();

            const values: OptionSetValue[] = attributes.map((attr) => {
                return attr.OptionSet.find((o: any) => o.value === attr.DefaultFormValue) as any as OptionSetValue;
            })

            setData(values);
        }
        setData([])
        fetchData();

    }, [fieldnames]);

    return data;
}