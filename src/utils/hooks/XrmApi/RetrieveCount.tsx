import { useState, useEffect, useMemo } from 'react'

export function RetrieveCount(entityname: string): number {

    const [data, setData] = useState<number>(0);
    const _entityname = entityname;

    useEffect(() => {
        console.log("RetrieveCount");
        if (!_entityname) return;
        async function fetchData() {
            const result = await Xrm.WebApi.retrieveMultipleRecords(_entityname, "?fetchXml=" + "<fetch aggregate=\"true\"> <entity name=\"" + _entityname + "\"> <attribute name=\"" + _entityname + "id\" alias=\"count\" aggregate=\"count\" distinct=\"true\" /> </entity> </fetch>");
            setData(result?.entities?.at(0)?.count ?? -1);
        }
        setData(0)
        fetchData();

    }, [entityname]);

    return data;
}

