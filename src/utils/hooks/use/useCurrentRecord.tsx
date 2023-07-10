import { useCallback, useEffect, useState } from "react";
import { debugLog, formatId } from "../../global/common";
import XrmObserver from "../../global/XrmObserver";


export function useCurrentRecord() {

    const [isEntityRecord, setIsEntityRecord] = useState<boolean>(false);
    // const [isOverrided, setIsOverrided] = useState<boolean>(false);
    const [entityName, setEntityName] = useState<string | undefined>(undefined);
    const [recordId, setRecordId] = useState<string | undefined>(undefined);

    const [xrmUpdated, setXrmUpdated] = useState<boolean>(false);

    useEffect(() => {
        setIsEntityRecord(!!entityName && !!recordId);
        debugLog("isEntityRecord", !!entityName && !!recordId);
    }, [entityName, recordId]);

    // const override = useCallback((entityName: string, recordId: string) => {
    //     setEntityName(entityName);
    //     setRecordId(recordId);
    //     setIsOverrided(true);
    // }, [setIsEntityRecord, setEntityName, setRecordId]);

    const getCurrentRecord = useCallback((): { entityname: string | undefined, recordid: string | undefined } => {
        const entityname: string | undefined = Xrm.Utility.getPageContext()?.input?.entityName;
        const recordid: string | undefined = formatId(Xrm.Page.data?.entity.getId().toLowerCase());
        return { entityname: entityname, recordid: recordid }
    }, []);

    useEffect(() => {
        const { entityname: currentEntityname, recordid: currentRecordId } = getCurrentRecord();
        debugLog("useCurrentRecord", "PageId updated", currentEntityname, entityName, currentRecordId, recordId);
        if (currentEntityname !== entityName) setEntityName(currentEntityname);
        if (recordId !== currentRecordId) setRecordId(currentRecordId);
    }, [xrmUpdated]);

    const xrmObserverCallback = useCallback(() => {
        setXrmUpdated(prev => !prev);
    }, []);

    useEffect(() => {
        XrmObserver.addListener(xrmObserverCallback);
    }, []);

    // const reset = useCallback(() => {
    //     const {entityName, recordid} = getCurrentRecord();
    //     setEntityName(entityName);
    //     setRecordId(recordid);
    //     setIsOverrided(false);
    // }, [getCurrentRecord]);


    return {
        isEntityRecord: isEntityRecord,
        entityName: entityName,
        recordId: recordId,
    };
}