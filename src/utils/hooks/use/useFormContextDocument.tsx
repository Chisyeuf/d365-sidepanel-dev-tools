import { useCallback, useEffect, useMemo, useState } from "react";
import { useXrmUpdated } from "./useXrmUpdated";
import { FormContext, FormDocument } from "../../types/FormContext";
import XrmObserver from "../../global/XrmObserver";
import { debugLog, waitForElm } from "../../global/common";
import { useDOMUpdated } from "./useDOMUpdated";

// const MAX_DEPTH = 4;
const OBSERVER_SELECTOR = "body";

export function useFormContextDocument() {

    const [formDocument, setFormDocument] = useState<FormDocument>(null);
    const [formContext, setFormContext] = useState<FormContext>(null);
    const [previousPageId, setPreviousPageId] = useState<string>();
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

    const { xrmRoute } = useXrmUpdated();
    const mainDomUpdated = useDOMUpdated(document, 'useFormContextDocument_main', OBSERVER_SELECTOR);
    const iframeDomUpdated = useDOMUpdated(formDocument !== document ? formDocument : null, 'useFormContextDocument_iframe', OBSERVER_SELECTOR);
    const d365MainAndIframeUpdated = mainDomUpdated !== iframeDomUpdated;
    

    const setStates = useCallback((_document: FormDocument, _formContext: FormContext) => {
        const formContextAny: any = _formContext;
        const currentPageId: string = formContextAny?.pageId ?? formContextAny?._pageId ?? '-1';

        if (previousPageId !== currentPageId) {
            debugLog("Update FormContextDocument on", _formContext?.data?.entity.getEntityName(), ", document:", _document, ", formContext:", _formContext);
            setFormDocument(_document);
            setFormContext(_formContext);
            setPreviousPageId(currentPageId);
        }
    }, [previousPageId]);


    const forceRefresh = useCallback(() => { //(depth: number = 0) => {
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                if (XrmObserver.isEntityRecord()) {
                    setStates(document, Xrm.Page);
                    resolve();
                    return;
                }
                else if (XrmObserver.isEntityList()) {
                    waitForElm<HTMLIFrameElement>(document, '#FormControlIframe_ID').then(iframe => {
                        const iframeContentWindow = iframe?.contentWindow;
                        if (iframeContentWindow?.document) {
                            waitForElm(iframeContentWindow.document, "#shell-container").then(iframeContainer => {
                                if (iframeContainer && iframeContentWindow?.Xrm?.Page) {
                                    // debugLog("useFormContextDocument", "iframe found", iframe);
                                    setStates(iframeContentWindow.document, iframeContentWindow.Xrm.Page);
                                    resolve();
                                    return;
                                }
                                // else if (depth < MAX_DEPTH) {
                                //     resolve(forceRefresh(depth + 1));
                                //     return;
                                // }
                                else {
                                    setStates(null, null);
                                    resolve();
                                    return;
                                }
                            });
                        }
                        // else if (depth < MAX_DEPTH) {
                        //     resolve(forceRefresh(depth + 1));
                        //     return;
                        // }
                        else {
                            setStates(null, null);
                            resolve();
                            return;
                        }
                    });
                }
                else {
                    setStates(null, null);
                    resolve();
                    return;
                }
            }, 1000);
        }).then(value => {
            setIsRefreshing(false);
            return value;
        });
    }, [setStates]);

    const launchRefresh = useCallback(async () => {
        setIsRefreshing(true);
        return forceRefresh();
    }, [forceRefresh]);


    const refresh = useCallback(async () => {
        if (!formContext) {
            return await launchRefresh();
        }
        return;
    }, [formContext, launchRefresh]);

    useEffect(() => {
        launchRefresh();
    }, [xrmRoute.current, launchRefresh]);

    useEffect(() => {
        if (XrmObserver.isEntityList()) {
            launchRefresh();
        }
    }, [d365MainAndIframeUpdated, launchRefresh]);


    return { formContext, formDocument, isRefreshing, d365MainAndIframeUpdated, refresh };
}