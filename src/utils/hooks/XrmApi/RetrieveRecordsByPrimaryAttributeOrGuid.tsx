import { useState, useEffect } from 'react'
import { RetrievePrimaryIdAttribute } from './RetrievePrimaryIdAttribute';

export function RetrieveRecordsByPrimaryAttributeOrGuid(entityname: string, input: string | null, top: number = 50) {

    const [data, setData] = useState<{ entities: any[] }>({ entities: [] });
    const filter = input;

    useEffect(() => {
        console.log("RetrieveRecordsByPrimaryAttributeOrGuid");
        async function fetchData() {
            if (entityname && filter) {
                const primaryNameLogicalName = (await Xrm.Utility.getEntityMetadata(entityname)).PrimaryNameAttribute;
                const idAttribute = (await Xrm.Utility.getEntityMetadata(entityname)).PrimaryIdAttribute;

                const guidregex = /^[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?$/;

                const result = await Xrm.WebApi.online
                    .retrieveMultipleRecords(
                        entityname,
                        "?$select=" +
                        primaryNameLogicalName +
                        "," +
                        idAttribute +
                        "&$filter=" +
                        (guidregex.test(filter) ? idAttribute + " eq " + filter + " or " : "") +
                        "contains(" +
                        primaryNameLogicalName +
                        ",'" +
                        filter +
                        "')&$top=" + top
                    );
                setData(result);
            } else {
                setData({ entities: [] })
            }
        }
        setData({ entities: [] })
        fetchData();

    }, [filter]);

    return data;
}