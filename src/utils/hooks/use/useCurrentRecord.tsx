import { useCallback, useEffect, useState } from "react";
import { debugLog, formatId } from "../../global/common";
import { useFormContextDocument } from "./useFormContextDocument";
import { useXrmUpdated } from "./useXrmUpdated";


export function useCurrentRecord() {

    const [isEntityRecord, setIsEntityRecord] = useState<boolean>(false);
    const [entityName, setEntityName] = useState<string | undefined>(undefined);
    const [recordId, setRecordId] = useState<string | undefined>(undefined);

    const xrmUpdated = useXrmUpdated();
    const { formContext } = useFormContextDocument();

    useEffect(() => {
        setIsEntityRecord(!!entityName && !!recordId);
    }, [entityName, recordId]);

    const getCurrentRecord = useCallback((): { entityname: string | undefined, recordid: string | undefined } => {
        const entityname: string | undefined = formContext ? formContext.data?.entity?.getEntityName() : Xrm.Utility.getPageContext()?.input?.entityName;
        const recordid: string | undefined = formatId(formContext?.data?.entity?.getId().toLowerCase() ?? '');
        return { entityname, recordid };
    }, [formContext]);

    useEffect(() => {
        const { entityname: currentEntityname, recordid: currentRecordId } = getCurrentRecord();

        if (currentEntityname !== entityName) setEntityName(currentEntityname);
        if (recordId !== currentRecordId) setRecordId(currentRecordId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [xrmUpdated, getCurrentRecord]);

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
        isEntityRecord,
        entityName,
        recordId,
        forceRefresh,
    };
}