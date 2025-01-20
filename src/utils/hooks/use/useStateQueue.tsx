
import { useState } from "react";

export function useStateQueue<T>(initialState: T[]) {

    const [items, setItems] = useState<T[]>(initialState);

    const shift = (numberOfItem: number) => {
        if (!items.length) {
            return null;
        }

        const copyArray = [...items];
        const shiftedElement = copyArray.splice(0, numberOfItem);
        setItems(copyArray);

        return shiftedElement;
    }

    const pop = (numberOfItem: number) => {
        if (!items.length) {
            return null;
        }
        const copyArray = [...items];
        const popedElement = copyArray.splice(-numberOfItem, numberOfItem);
        setItems(copyArray);
        return popedElement;
    }

    const push = (newItem: T) => {
        setItems(old => [...old, newItem]);
    }

    const unshift = (newItem: T) => {
        setItems(old => [newItem, ...old]);
    }

    return { items, shift, pop, push, unshift, setItems };
}