import { useCallback, useEffect, useState } from "react";
import XrmObserver, { XrmObserverSelector } from "../../global/XrmObserver";


export function useXrmUpdated() {

    const [xrmUpdated, setXrmUpdated] = useState<boolean>(false);
    const [currentRoute, setCurrentRoute] = useState<string>('');
    const [previousRoute, setPreviousRoute] = useState<string>('');

    
    useEffect(() => {
        const callback = () => {
            setXrmUpdated(prev => !prev);
            setCurrentRoute(previousRoute => {
                setPreviousRoute(previousRoute);
                return document.querySelector(XrmObserverSelector)?.getAttribute('route') ?? '';
            });
        }
        return () => {
            XrmObserver.removeListener(callback);
        }
    }, []);

    return { xrmUpdated, xrmRoute: { current: currentRoute, previous: previousRoute } };
}