import { useCallback, useEffect, useMemo, useState } from "react";
import { useXrmUpdated } from "./useXrmUpdated";
import { FormContext, FormDocument } from "../../types/FormContext";
import XrmObserver from "../../global/XrmObserver";
import { debugLog, waitForElm } from "../../global/common";
import { useDOMUpdated } from "./useDOMUpdated";
import usePrevious from "./usePrevious";

// const MAX_DEPTH = 4;
const OBSERVER_SELECTOR = "body";

export function useFormContextDocument() {

    const [formDocument, setFormDocument] = useState<FormDocument>(null);
    const [formContext, setFormContext] = useState<FormContext>(null);

    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

    const { xrmRoute } = useXrmUpdated();
    const mainDomUpdated = useDOMUpdated(document, 'useFormContextDocument_main', OBSERVER_SELECTOR);
    const iframeDomUpdated = useDOMUpdated(formDocument !== document ? formDocument : null, 'useFormContextDocument_iframe', OBSERVER_SELECTOR);
    const d365MainAndIframeUpdated = mainDomUpdated !== iframeDomUpdated;

    const previousPageId = usePrevious<string>((Xrm as any)?._pageId);


    useEffect(() => {
        console.log("previous pageId", previousPageId)
    }, [previousPageId]);


    const setStates = useCallback((_document: FormDocument, _formContext: FormContext) => {
        // const formContextAny: any = _formContext;
        // const currentPageId: string = formContextAny?.pageId ?? formContextAny?._pageId ?? '-1';

        // if (previousPageId !== currentPageId) {
        debugLog("Update FormContextDocument on", _formContext?.data?.entity.getEntityName(), ", document:", _document, ", formContext:", _formContext);
        setFormDocument(_document);
        setFormContext(_formContext);
        setIsRefreshing(false);
        // setPreviousPageId(currentPageId);
        // }
    }, []);


    const forceRefresh = useCallback(async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (XrmObserver.isEntityRecord()) {
            setStates(document, Xrm.Page);
        }
        else if (XrmObserver.isEntityList()) {
            waitForElm<HTMLIFrameElement>(document, '#FormControlIframe_ID').then(iframe => {
                const iframeContentWindow = iframe?.contentWindow;
                if (iframeContentWindow?.document) {
                    waitForElm(iframeContentWindow.document, "#shell-container").then(iframeContainer => {
                        if (iframeContainer && iframeContentWindow?.Xrm?.Page) {
                            // debugLog("useFormContextDocument", "iframe found", iframe);
                            setStates(iframeContentWindow.document, iframeContentWindow.Xrm.Page);
                        }
                        else {
                            setStates(null, null);
                        }
                    }).catch(() => {
                        setStates(null, null);
                    });
                }
                else {
                    setStates(null, null);
                }
            }).catch(() => {
                setStates(null, null);
            });
        }
        else {
            setStates(null, null);
        }
    }, [setStates]);

    const launchRefresh = useCallback(async () => {
        setIsRefreshing(true);
        return forceRefresh();

    }, [forceRefresh]);


    const refresh = useCallback(async () => {
        if (!formContext) {
            return launchRefresh();
        }
    }, [formContext, launchRefresh]);

    useEffect(() => {
        if (XrmObserver.isEntityRecord()) {
            console.log("Refresh formContext on enittyRECORD");
            launchRefresh();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [xrmRoute.current, previousPageId, launchRefresh]);

    const isToRefreshIframe = XrmObserver.isEntityList() && d365MainAndIframeUpdated;
    useEffect(() => {
        // if (XrmObserver.isEntityList()) {
        console.log("Refresh formContext on entityList");
        launchRefresh();
        // }
    }, [isToRefreshIframe, launchRefresh]);


    return { formContext, formDocument, isRefreshing, d365MainAndIframeUpdated, refresh };
}