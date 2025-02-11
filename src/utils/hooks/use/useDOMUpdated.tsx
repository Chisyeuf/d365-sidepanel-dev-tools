import { useEffect, useState } from "react";
import DOMObserver from "../../global/DOMObserver";
import { debugLog } from "../../global/common";
import { FormDocument } from "../../types/FormContext";

const DELAY = 1500;

export function useDOMUpdated(_document: FormDocument, eventName: string, elementSelector: string) {

    const [observer, setObserver] = useState<DOMObserver | null>(null);
    const [, setTimer] = useState<NodeJS.Timer>();

    const [domUpdated, setDomUpdated] = useState<boolean>(false);


    useEffect(() => {
        debugLog("Refresh DOM Observer", eventName, "document:", _document);

        if (!_document) {
            observer?.disconnect();
            setObserver(null);
            // setTimer((oldtimer) => {
            //     oldtimer && clearInterval(oldtimer);
            //     return undefined;
            // });
        }
        else if (_document !== observer?._document) {
            observer?.disconnect();
            const domObserver = new DOMObserver(eventName, elementSelector, _document);
            setObserver(domObserver);
            debugLog("Set domObserver");

            setTimer((oldtimer) => {
                clearInterval(oldtimer);
                return setInterval(() => {
                    const hasMutate = domObserver.hasMutate();
                    if (hasMutate) {
                        debugLog("useDOMUpdated", eventName, "UPDATED");
                        setDomUpdated(prev => !prev);
                    }
                }, DELAY)
            });
        }
        return () => {
            observer?.disconnect();
        }
    }, [_document, eventName, elementSelector, observer]);

    return domUpdated;
}