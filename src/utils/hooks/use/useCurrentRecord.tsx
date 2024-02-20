import { useCallback, useEffect, useState } from "react";
import { debugLog, formatId } from "../../global/common";
import { useXrmUpdated } from "./useXrmUpdated";


export function useCurrentRecord() {

    const [isEntityRecord, setIsEntityRecord] = useState<boolean>(false);
    const [entityName, setEntityName] = useState<string | undefined>(undefined);
    const [recordId, setRecordId] = useState<string | undefined>(undefined);

    const xrmUpdated = useXrmUpdated();

    useEffect(() => {
        setIsEntityRecord(!!entityName && !!recordId);
        debugLog("isEntityRecord", !!entityName && !!recordId);
    }, [entityName, recordId]);

    const getCurrentRecord = useCallback((): { entityname: string | undefined, recordid: string | undefined } => {
        const entityname: string | undefined = Xrm.Utility.getPageContext()?.input?.entityName;
        const recordid: string | undefined = formatId(Xrm.Page.data?.entity?.getId().toLowerCase());
        return { entityname: entityname, recordid: recordid }
    }, []);

    useEffect(() => {
        const { entityname: currentEntityname, recordid: currentRecordId } = getCurrentRecord();
        debugLog("useCurrentRecord", "PageId updated", currentEntityname, entityName, currentRecordId, recordId);
        if (currentEntityname !== entityName) setEntityName(currentEntityname);
        if (recordId !== currentRecordId) setRecordId(currentRecordId);
    }, [xrmUpdated]);

    const forceRefresh = useCallback(() => {
        setEntityName(undefined);
        setRecordId(undefined);
        setTimeout(() => {
            const { entityname: currentEntityname, recordid: currentRecordId } = getCurrentRecord();
            setEntityName(currentEntityname);
            setRecordId(currentRecordId);
        }, 500);
    }, [setEntityName, setRecordId, getCurrentRecord]);

    return {
        isEntityRecord: isEntityRecord,
        entityName: entityName,
        recordId: recordId,
        forceRefresh: forceRefresh
    };
}