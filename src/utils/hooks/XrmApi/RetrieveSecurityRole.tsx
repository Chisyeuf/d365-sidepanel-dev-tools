import { useState, useEffect, useMemo } from 'react'
import { debugLog } from '../../global/common';
import { SecurityRole } from '../../types/SecurityRole';


export function RetrieveSecurityRole(): [SecurityRole[], boolean] {

    const [data, setData] = useState<SecurityRole[]>([]);
    const [isFetching, setFetching] = useState<boolean>(false)

    useEffect(() => {

        async function fetchData() {
            debugLog("RetrieveSecurityRole");

            const result = await Xrm.WebApi.online.retrieveMultipleRecords("role", "?$select=roleid,name,roleidunique&$filter=_parentroleid_value eq null&$orderby=name asc");

            setData(result.entities.map<SecurityRole>(role => {
                return {
                    name: role["name"],
                    roleid: role["roleid"],
                    uniqueid: role["roleidunique"],
                }

            }));
            setFetching(false);
        }
        setData([])
        setFetching(true)
        fetchData();

    }, []);

    return [data, isFetching];
}