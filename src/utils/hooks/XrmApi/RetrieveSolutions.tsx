import { useState, useEffect, useMemo } from 'react'
import { debugLog } from '../../global/common';
import { SolutionItem } from '../../types/SolutionItem';

export function RetrieveSolutions(): [SolutionItem[], boolean] {

    const [data, setData] = useState<SolutionItem[]>([]);
    const [isFetching, setIsFetching] = useState<boolean>(false);

    useEffect(() => {
        debugLog("RetrieveSolutions");
        async function fetchData() {
            const result = await Xrm.WebApi.online.retrieveMultipleRecords("solution", "?$select=solutionid,friendlyname,uniquename");
            setData(result.entities.map<SolutionItem>(r => {
                return {
                    solutionid: r["solutionid"],
                    displayName: r["friendlyname"],
                    uniqueName: r["uniquename"],
                }
            }));
            setIsFetching(false);
        }
        setIsFetching(true);
        setData([]);
        fetchData();
    }, []);

    return [data, isFetching];
}