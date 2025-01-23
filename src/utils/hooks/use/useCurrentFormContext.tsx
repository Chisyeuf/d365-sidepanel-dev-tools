import { useEffect, useState } from "react";
import { useXrmUpdated } from "./useXrmUpdated";
import { FormContext } from "../../types/FormContext";
import { debugLog, waitForElm } from "../../global/common";

export function useCurrentFormContext() {

    const [currentFormContext, setCurrentFormContext] = useState<FormContext>(null);

    const xrmUpdated = useXrmUpdated();

    useEffect(() => {
        setTimeout(() => {
            if (Xrm.Utility.getPageContext()?.input?.pageType === 'entityrecord') {
                setCurrentFormContext(Xrm.Page);
                debugLog("set entityrecord");

            }
            else {
                setCurrentFormContext(null);
            }
        }, 1000);

    }, [xrmUpdated]);


    return currentFormContext;
}