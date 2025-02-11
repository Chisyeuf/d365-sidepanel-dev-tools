import { createContext, PropsWithChildren } from "react";
import { noOperation } from "../../utils/global/common";
import { useFormContextDocument } from "../../utils/hooks/use/useFormContextDocument";
import { useXrmUpdated } from "../../utils/hooks/use/useXrmUpdated";
import { FormContext, FormDocument } from "../../utils/types/FormContext";


interface IFormToolContext {
    formContext: FormContext;
    formDocument: FormDocument;
    isRefreshing: boolean;
    refresh: () => Promise<void>;
    domUpdated: boolean;
    xrmRoute: ReturnType<typeof useXrmUpdated>['xrmRoute'];
}
const defaultFormToolContext: IFormToolContext = {
    formContext: null,
    formDocument: null,
    isRefreshing: false,
    refresh: noOperation,
    domUpdated: false,
    xrmRoute: { current: '', previous: '' }
}
export const FormToolContext = createContext<IFormToolContext>(defaultFormToolContext);

export default function FormToolContextProvider(props: PropsWithChildren) {

    const { xrmRoute } = useXrmUpdated();
    const { formContext, formDocument, isRefreshing, d365MainAndIframeUpdated: domUpdated, refresh } = useFormContextDocument();

    return (
        <FormToolContext.Provider
            value={{
                formContext,
                formDocument,
                isRefreshing,
                refresh,
                domUpdated: domUpdated,
                xrmRoute,
            }}
            {...props}
        />
    );
}