import { useCallback, useEffect, useState } from "react";
import XrmObserver, { XrmObserverSelector } from "../../global/XrmObserver";
import { debugLog } from "../../global/common";


export function useXrmUpdated() {

    const [xrmUpdated, setXrmUpdated] = useState<boolean>(false);
    const [currentRoute, setCurrentRoute] = useState<string>('');
    const [previousRoute, setPreviousRoute] = useState<string>('');

    const xrmObserverCallback = useCallback(() => {
        debugLog("XrmObserver route updated");
        setXrmUpdated(prev => !prev);
        setCurrentRoute(previousRoute => {
            setPreviousRoute(previousRoute);
            return document.querySelector(XrmObserverSelector)?.getAttribute('route') ?? '';
        });
    }, []);

    useEffect(() => {
        XrmObserver.addListener(xrmObserverCallback);
        return () => {
            XrmObserver.removeListener(xrmObserverCallback);
        }
    }, [xrmObserverCallback]);

    return { xrmUpdated, xrmRoute: { current: currentRoute, previous: previousRoute } };
}