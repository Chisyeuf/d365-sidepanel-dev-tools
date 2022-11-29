import { useState, useEffect } from 'react'

export function RetrieveSetName(entityname: string) {

    const [data, setData] = useState<string>();
    const _entityname = entityname;

    useEffect(() => {
        console.log("RetrieveViews");     
        if (!_entityname) {
            setData(undefined)
            return;
        }
        async function fetchData() {
            const result = await Xrm.Utility.getEntityMetadata(_entityname)
            setData(result.EntitySetName);
        }
        fetchData();

    }, [_entityname]);

    return data;
}