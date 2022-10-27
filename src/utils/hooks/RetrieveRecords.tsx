import { useState, useEffect } from 'react'

export function RetrieveRecordsByPrimaryAttributeOrGuid(entityname: string, input: string | null, top: number = 50) {

    const [data, setData] = useState<{ entities: any[] }>();
    const filter = input;

    useEffect(() => {
        // if (!entityname || !filter) return;

        async function fetchData() {
            if (entityname && filter) {
                const primaryNameLogicalName = (await Xrm.Utility.getEntityMetadata(entityname)).PrimaryNameAttribute;
                const guidregex = /^[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?$/;
                const result = await Xrm.WebApi.online
                    .retrieveMultipleRecords(
                        entityname,
                        "?$select=" +
                        primaryNameLogicalName +
                        "," +
                        entityname +
                        "id&$filter=" +
                        (guidregex.test(filter) ? entityname + "id eq " + filter + " or " : "") +
                        "contains(" +
                        primaryNameLogicalName +
                        ",'" +
                        filter +
                        "')&$top=" + top
                    );
                setData(result);
            } else {
                setData({entities:[]})
            }
        }

        fetchData();

    }, [entityname, filter, top]);

    return data;
}