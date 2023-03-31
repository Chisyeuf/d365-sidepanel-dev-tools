import { useMemo, useState } from "react";

export function useStateArray<T>(length: number, initialState: T): [T[], React.Dispatch<React.SetStateAction<T>>[], (value: T) => void] {

    const [state, setState] = useState<T[]>(new Array(length).fill(initialState));

    const setStateArray: React.Dispatch<React.SetStateAction<T>>[] = useMemo(() => {
        return state.map((s: T, index: number) => {
            return (value: React.SetStateAction<T>) => {
                setState(prev => [
                    ...prev.slice(0, index),
                    value instanceof Function ? value(prev[index]) : value,
                    ...prev.slice(index + 1)
                ]);
            }
        })
    }, []);

    const setAllStates = (value: T) => {
        setState(prev => prev.map(_ => value));
    }

    return [state, setStateArray, setAllStates];
}