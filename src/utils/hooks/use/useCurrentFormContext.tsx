import { useCallback, useEffect, useState } from "react";
import { debugLog, formatId } from "../../global/common";
import { useXrmUpdated } from "./useXrmUpdated";

type FormContext = Xrm.Page | null;

export function useCurrentFormContext() {

    const [currentFormContext, setCurrentFormContext] = useState<FormContext>(null);

    const xrmUpdated = useXrmUpdated();

    useEffect(() => {
        debugLog("_pageId")
        // debugLog("useCurrentFormContext",
        //     "Is entity record:", Xrm.Utility.getPageContext()?.input?.pageType === 'entityrecord',
        //     "with",
        //     Xrm.Page.data?.entity?.getEntityName(),
        //     Xrm.Page.data?.entity?.getId());

        setTimeout(() => {
            if (Xrm.Utility.getPageContext()?.input?.pageType === 'entityrecord') {
                setCurrentFormContext(Xrm.Page);
            }
            else {
                setCurrentFormContext(null);
            }
        }, 1000);

    // }, [xrmUpdated]);
    }, [xrmUpdated]);


    return currentFormContext;
}