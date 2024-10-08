import { useCallback, useEffect, useState } from "react";
import XrmObserver from "../../global/XrmObserver";


export function useXrmUpdated() {

    const [xrmUpdated, setXrmUpdated] = useState<boolean>(false);

    const xrmObserverCallback = useCallback(() => {
        setXrmUpdated(prev => !prev);
    }, []);

    useEffect(() => {
        XrmObserver.addListener(xrmObserverCallback);
        return () => {
            XrmObserver.removeListener(xrmObserverCallback);
        }
    }, []);

    return xrmUpdated;
}