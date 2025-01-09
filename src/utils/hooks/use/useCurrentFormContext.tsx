import { useEffect, useState } from "react";
import { useXrmUpdated } from "./useXrmUpdated";
import { FormContext } from "../../types/FormContext";
import { debugLog, waitForElm } from "../../global/common";

export function useCurrentFormContext() {

    const [currentFormContext, setCurrentFormContext] = useState<FormContext>(null);

    const xrmUpdated = useXrmUpdated();

    useEffect(() => {
        setTimeout(() => {
            let iframe: HTMLIFrameElement | null;

            debugLog("useCurrentFormContext");
            debugLog("Xrm.Utility.getPageContext()?.input?.pageType === 'entityrecord'", Xrm.Utility.getPageContext()?.input?.pageType === 'entityrecord');
            debugLog("document.querySelector('#FormControlIframe_ID')", document.querySelector('#FormControlIframe_ID'));

            if (Xrm.Utility.getPageContext()?.input?.pageType === 'entityrecord') {
                setCurrentFormContext(Xrm.Page);
                debugLog("set entityrecord");

            }
            else {
                setCurrentFormContext(null);
            }
            // else if (iframe = document.querySelector('#FormControlIframe_ID')) {
            //     setCurrentFormContext(iframe.contentWindow?.Xrm.Page ?? null);
            // }
            // else {
            //     debugLog("useCurrentFormContext waitForElm");
            //     waitForElm<HTMLIFrameElement>(document, '#FormControlIframe_ID').then(iframe => {
            //         const iframeContentWindow = iframe?.contentWindow;
            //         if (iframeContentWindow?.document) {
            //             waitForElm(iframeContentWindow.document, "#shell-container").then(iframeContainer => {
            //                 if (iframeContainer) {
            //                     setCurrentFormContext(iframeContentWindow?.Xrm.Page ?? null);
            //                     debugLog("set iframe");
            //                 }
            //             });
            //         }
            //         else {
            //             setCurrentFormContext(null);
            //             debugLog("set null");
            //         }
            //     })
            // }
        }, 1000);

    }, [xrmUpdated]);


    return currentFormContext;
}