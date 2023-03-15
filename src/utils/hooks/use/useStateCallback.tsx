import { useCallback, useEffect, useRef, useState } from "react";

export function useStateCallback<T>(initialState: T): [T, (state: T | ((prevState: T) => T), callback?: (newState: T) => void) => void] {
    const [state, setState] = useState(initialState);
    const callbackRef = useRef<((state: T) => void) | undefined>(undefined); // init mutable ref container for callbacks

    const setStateCallback = useCallback((state: T | ((prevState: T) => T), callback?: (newState: T) => void) => {
        callbackRef.current = callback; // store current, passed callback in ref
        setState(state);
    }, []); // keep object reference stable, exactly like `useState`

    useEffect(() => {
        // cb.current is `undefined` on initial render,
        // so we only invoke callback on state *updates*
        if (callbackRef.current) {
            callbackRef.current(state);
            callbackRef.current = undefined; // reset callback after execution
        }
    }, [state]);

    return [state, setStateCallback];
}
