import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useXrmUpdated } from "./useXrmUpdated";
import { FormContext, FormDocument } from "../../types/FormContext";
import XrmObserver from "../../global/XrmObserver";
import { debugError, debugLog, waitForElm } from "../../global/common";
import { useDOMUpdated } from "./useDOMUpdated";
import usePrevious from "./usePrevious";


const OBSERVER_SELECTOR = "body";

export function useFormContextDocument() {

    const [formDocument, setFormDocument] = useState<FormDocument>(null);
    const [formContext, setFormContext] = useState<FormContext>(null);

    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

    const { xrmUpdated } = useXrmUpdated();
    const mainDomUpdated = useDOMUpdated(document, 'useFormContextDocument_main', OBSERVER_SELECTOR);
    const iframeDomUpdated = useDOMUpdated(formDocument !== document ? formDocument : null, 'useFormContextDocument_iframe', OBSERVER_SELECTOR);
    const d365MainAndIframeUpdated = mainDomUpdated !== iframeDomUpdated;

    const previousPageId = usePrevious<string>((Xrm as any)?._pageId);

    const waitForElmEntityListPromise = useRef<{ entityName: string, promise: Promise<void> } | null>(null);
    const waitForElmAbortController = useRef<AbortController | null>(new AbortController());
    useEffect(() => {
        return () => {
            waitForElmAbortController.current?.abort();
        };
    }, []);

    const abortWaitForElm = useCallback(() => {
        debugLog("FormContextDocument message: abort previous formContentDocument updating on entityList.");
        waitForElmAbortController.current?.abort();
        waitForElmAbortController.current = null;

        const abortController = new AbortController();
        waitForElmAbortController.current = abortController;
    }, []);

    const setStates = useCallback((_document: FormDocument, _formContext: FormContext) => {
        debugLog("Update FormContextDocument on", _formContext?.data?.entity?.getEntityName() ?? 'unfound', ", document:", _document, ", formContext:", _formContext);
        setFormDocument(_document);
        setFormContext(_formContext);
        setIsRefreshing(false);
    }, []);


    const _refresh = useCallback(async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            // if (XrmObserver.isEntityRecord()) {
            if (Xrm.Page.data) {
                abortWaitForElm();
                setStates(document, Xrm.Page);
            }
            else if (XrmObserver.isEntityList()) {
                if (waitForElmEntityListPromise.current && XrmObserver.getEntityName() === waitForElmEntityListPromise.current.entityName) {
                    debugLog(`FormContextDocument message: existing formContentDocument updating on entityList ${waitForElmEntityListPromise.current.entityName}.`);
                    return;
                }

                const getEntityListContextPromise = (async () => {
                    const iframe = await waitForElm<HTMLIFrameElement>(document, '#FormControlIframe_ID', { signal: waitForElmAbortController.current?.signal });//.then(iframe => {
                    const iframeContentWindow = iframe?.contentWindow;
                    if (iframeContentWindow?.document) {
                        const iframeContainer = await waitForElm(iframeContentWindow.document, "#shell-container", { signal: waitForElmAbortController.current?.signal });//.then(iframeContainer => {
                        if (iframeContainer && iframeContentWindow?.Xrm?.Page) {
                            setStates(iframeContentWindow.document, iframeContentWindow.Xrm.Page);
                        }
                        else {
                            setStates(null, null);
                        }
                    }
                    else {
                        setStates(null, null);
                    }
                })();
                waitForElmEntityListPromise.current = { entityName: XrmObserver.getEntityName() ?? '', promise: getEntityListContextPromise };
                await waitForElmEntityListPromise.current.promise;
                waitForElmEntityListPromise.current = null;
            }
            else {
                abortWaitForElm();
                setStates(null, null);
            }
        }
        catch (e: any) {
            debugError(e.message);
        }
    }, [abortWaitForElm, setStates]);

    const launchRefresh = useCallback(async () => {
        setIsRefreshing(true);
        return _refresh();

    }, [_refresh]);


    const refresh = useCallback(async () => {
        if (!formContext) {
            return launchRefresh();
        }
    }, [formContext, launchRefresh]);

    useEffect(() => {
        // debugLog("FormContextDocument message: refresh by pageId update.");
        launchRefresh();
    }, [xrmUpdated, previousPageId, launchRefresh]);

    const isToRefreshIframe = XrmObserver.isEntityList() && !Xrm.Page.data && d365MainAndIframeUpdated;
    useEffect(() => {
        // debugLog("FormContextDocument message: refresh by DOM update.");
        launchRefresh();
    }, [isToRefreshIframe, launchRefresh]);


    return { formContext, formDocument, isRefreshing, d365MainAndIframeUpdated, refresh };
}