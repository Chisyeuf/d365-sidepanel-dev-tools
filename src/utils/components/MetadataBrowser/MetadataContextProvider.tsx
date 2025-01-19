import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from "react";
import { useDictionnary } from "../../hooks/use/useDictionnary";
import { MSType } from "../../types/requestsType";


const fetchOptions = {
    method: "GET",
    headers: {
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Content-Type": "application/json; charset=utf-8",
        "Accept": "application/json",
        "Prefer": "odata.include-annotations=*"
    }
};

const noOperation = () => {
    return '';
};
type IMetadataObject = { [propertyName: string]: any };
interface IMetadataContext {
    isFetchingEntitiesMetadata: boolean
    entitiesMetadata: IMetadataObject[]

    isFetchingComponentMetadata: boolean
    attributesMetadata: { [entityName: string]: IMetadataObject[] }
    retrieveAttributes: (entityName: string) => void
    optionsSetsMetadata: { [entityName: string]: { [type: string]: IMetadataObject[] } }
    retrieveOptionSets: (entityName: string, type: MSType) => void

    oneToManyRelationshipsMetadata: { [entityName: string]: IMetadataObject[] }
    manyToOneRelationshipsMetadata: { [entityName: string]: IMetadataObject[] }
    manyToManyRelationshipsMetadata: { [entityName: string]: IMetadataObject[] }
    retrieveOneToManyRelationships: (entityName: string) => void
    retrieveManyToOneRelationships: (entityName: string) => void
    retrieveManyToManyRelationships: (entityName: string) => void
}
const defaultMetadataContext: IMetadataContext = {
    isFetchingEntitiesMetadata: false,
    entitiesMetadata: [],

    isFetchingComponentMetadata: false,
    attributesMetadata: {},
    retrieveAttributes: noOperation,
    optionsSetsMetadata: {},
    retrieveOptionSets: noOperation,

    oneToManyRelationshipsMetadata: {},
    manyToOneRelationshipsMetadata: {},
    manyToManyRelationshipsMetadata: {},
    retrieveOneToManyRelationships: noOperation,
    retrieveManyToOneRelationships: noOperation,
    retrieveManyToManyRelationships: noOperation,
};
export const MetadataContext = createContext<IMetadataContext>(defaultMetadataContext);

interface MetadataContextProviderProps {

}
function MetadataContextProvider(props: MetadataContextProviderProps & PropsWithChildren) {
    const { children } = props;

    const [isFetchingEntitiesMetadata, setIsFetchingEntitiesMetadata] = useState<boolean>(true);
    const [entitiesMetadata, setEntitiesMetadata] = useState<IMetadataContext['entitiesMetadata']>([]);
    const [isFetchingComponentMetadata, setIsFetchingComponentMetadata] = useState<boolean>(false);
    const { dict: attributesMetadata, setValue: addAttributeMetadata } = useDictionnary<IMetadataObject[]>({});
    const { dict: optionsSetsMetadata, setValue: addOptionSetMetadata } = useDictionnary<{ [type: string]: IMetadataObject[] }>({});
    const { dict: oneToManyMetadata, setValue: addOneToManyMetadata } = useDictionnary<IMetadataObject[]>({});
    const { dict: manyToOneMetadata, setValue: addManyToOneMetadata } = useDictionnary<IMetadataObject[]>({});
    const { dict: manyToManyMetadata, setValue: addManyToManyMetadata } = useDictionnary<IMetadataObject[]>({});

    useEffect(() => {
        if (entitiesMetadata.length > 0) {
            return;
        }

        async function fetchData() {
            const response = await fetch(
                `${Xrm?.Utility.getGlobalContext().getClientUrl()}/api/data/v9.0/EntityDefinitions`,
                fetchOptions
            );

            const results = await response.json();
            setEntitiesMetadata(results.value);
            setIsFetchingEntitiesMetadata(false);
        }
        fetchData();
        setIsFetchingEntitiesMetadata(true);

    }, [entitiesMetadata.length]);

    const fetchComponents = useCallback(async (entityName: string, componentName: string) => {
        const response = await fetch(
            `${Xrm?.Utility.getGlobalContext().getClientUrl()}/api/data/v9.0/EntityDefinitions(LogicalName='${entityName}')/${componentName}`,
            fetchOptions
        );

        const results = await response.json();

        setIsFetchingComponentMetadata(false);
        return results.value;

    }, []);

    const retrieveEntityComponentMetadata = useCallback(async (entityName: string, componentName: string, dict: IMetadataContext['attributesMetadata'], addFunction: (key: string, value: IMetadataObject[]) => void) => {
        if (dict[entityName]) {
            return;
        }

        setIsFetchingComponentMetadata(true);
        const values = await fetchComponents(entityName, componentName);
        addFunction(entityName, values);
    }, [fetchComponents]);

    const retrieveAttributes = useCallback(async (entityName: string) => {
        retrieveEntityComponentMetadata(entityName, 'Attributes', attributesMetadata, addAttributeMetadata);
    }, [addAttributeMetadata, attributesMetadata, retrieveEntityComponentMetadata]);

    const retrieveOptionSets = useCallback(async (entityName: string, type: MSType) => {
        if (!optionsSetsMetadata[entityName]?.[type]) {
            const componentName = `Attributes/${type}?$select=LogicalName&$expand=OptionSet`;
            setIsFetchingComponentMetadata(true);
            const values = await fetchComponents(entityName, componentName);
            addOptionSetMetadata(entityName, { ...optionsSetsMetadata[entityName], [type]: values });
        }
    }, [addOptionSetMetadata, fetchComponents, optionsSetsMetadata]);

    const retrieveOneToMany = useCallback(async (entityName: string) => {
        retrieveEntityComponentMetadata(entityName, 'OneToManyRelationships', oneToManyMetadata, addOneToManyMetadata);
    }, [addOneToManyMetadata, oneToManyMetadata, retrieveEntityComponentMetadata]);

    const retrieveManyToOne = useCallback(async (entityName: string) => {
        retrieveEntityComponentMetadata(entityName, 'ManyToOneRelationships', manyToOneMetadata, addManyToOneMetadata);
    }, [addManyToOneMetadata, manyToOneMetadata, retrieveEntityComponentMetadata]);

    const retrieveManyToMany = useCallback(async (entityName: string) => {
        retrieveEntityComponentMetadata(entityName, 'ManyToManyRelationships', manyToManyMetadata, addManyToManyMetadata);
    }, [addManyToManyMetadata, manyToManyMetadata, retrieveEntityComponentMetadata]);



    return (
        <MetadataContext.Provider
            value={{
                isFetchingEntitiesMetadata,
                entitiesMetadata,

                isFetchingComponentMetadata,
                attributesMetadata,
                retrieveAttributes,
                optionsSetsMetadata,
                retrieveOptionSets,

                oneToManyRelationshipsMetadata: oneToManyMetadata,
                manyToOneRelationshipsMetadata: manyToOneMetadata,
                manyToManyRelationshipsMetadata: manyToManyMetadata,
                retrieveOneToManyRelationships: retrieveOneToMany,
                retrieveManyToOneRelationships: retrieveManyToOne,
                retrieveManyToManyRelationships: retrieveManyToMany,
            }}
        >
            {children}
        </MetadataContext.Provider>
    );
}

export default MetadataContextProvider;