import { createContext, PropsWithChildren, SetStateAction, useContext, useEffect } from "react";
import { useBoolean } from "usehooks-ts";
import { noOperation } from "./common";
import { Env } from "./var";
import { useSnackbar } from "notistack";


interface IspDevToolsContext {
    isDebug: ReturnType<typeof useBoolean>;
}
const defaultspDevToolsContext: IspDevToolsContext = {
    isDebug: {
        value: false,
        setValue: noOperation,
        setTrue: noOperation,
        setFalse: noOperation,
        toggle: noOperation
    },
}
const spDevToolsContext = createContext<IspDevToolsContext>(defaultspDevToolsContext);

export const useSpDevTools = function () {
    return useContext(spDevToolsContext);
}

export default function SpDevToolsContextProvider(props: PropsWithChildren) {

    const isDebug = useBoolean();

    useEffect(() => {
        Env.DEBUG = isDebug.value;
    }, [isDebug.value]);


    return (
        <spDevToolsContext.Provider
            value={{
                isDebug,
            }}
            {...props}
        />
    );
}