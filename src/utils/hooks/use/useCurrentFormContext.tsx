import { useEffect, useState } from "react";
import { useXrmUpdated } from "./useXrmUpdated";
import { FormContext } from "../../types/FormContext";

export function useCurrentFormContext() {

    const [currentFormContext, setCurrentFormContext] = useState<FormContext>(null);

    const xrmUpdated = useXrmUpdated();

    useEffect(() => {
        setTimeout(() => {
            if (Xrm.Utility.getPageContext()?.input?.pageType === 'entityrecord') {
                setCurrentFormContext(Xrm.Page);
            }
            else {
                setCurrentFormContext(null);
            }
        }, 1000);

    }, [xrmUpdated]);


    return currentFormContext;
}