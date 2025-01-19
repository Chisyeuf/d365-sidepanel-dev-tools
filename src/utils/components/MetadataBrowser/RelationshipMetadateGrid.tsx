
import ObjectListGrid from './ObjectListGrid';
import { metadataGrid_cascadeConfigToValue, metadataGrid_valueToBoolean } from './valueGetter';
import { ExploreGrid } from './types';
import { useContext, useEffect } from 'react';
import { MetadataContext } from './MetadataContextProvider';


export function OneToManyRelationshipMetadateGrid(props: ExploreGrid) {

    const { entityName, ...otherProps } = props;

    const { oneToManyRelationshipsMetadata, retrieveOneToManyRelationships, isFetchingComponentMetadata } = useContext(MetadataContext);

    useEffect(() => {
        retrieveOneToManyRelationships(entityName);
    }, [entityName, retrieveOneToManyRelationships]);

    return <RelationshipMetadateGrid data={oneToManyRelationshipsMetadata[entityName] ?? []} loading={isFetchingComponentMetadata} {...otherProps} />
}

export function ManyToOneRelationshipMetadateGrid(props: ExploreGrid) {

    const { entityName, ...otherProps } = props;

    const { manyToOneRelationshipsMetadata, retrieveManyToOneRelationships, isFetchingComponentMetadata } = useContext(MetadataContext);

    useEffect(() => {
        retrieveManyToOneRelationships(entityName);
    }, [entityName, retrieveManyToOneRelationships]);

    return <RelationshipMetadateGrid data={manyToOneRelationshipsMetadata[entityName] ?? []} loading={isFetchingComponentMetadata} {...otherProps} />
}


interface RelationshipMetadateGridProps {
    data: {
        [key: string]: any;
    }[]
    loading: boolean
}
function RelationshipMetadateGrid(props: RelationshipMetadateGridProps & Pick<ExploreGrid, 'explortFileName' | 'openFrom'>) {
    const { data, loading, explortFileName, openFrom } = props;

    return (
        <>
            <ObjectListGrid
                loading={loading}
                dataList={data}
                frontColumns={[
                    "SchemaName",
                    "ReferencingEntity",
                    "ReferencingAttribute",
                    "ReferencedEntity",
                    "ReferencedAttribute",
                    "ReferencingEntityNavigationPropertyName",
                    "ReferencedEntityNavigationPropertyName",
                    "CascadeConfiguration",
                ]}
                columnValueFormatter={{
                    "AssociatedMenuConfiguration": metadataGrid_cascadeConfigToValue,
                    "IsCustomizable": metadataGrid_valueToBoolean,
                    "CascadeConfiguration": (value: any) => Object.entries(value)?.map(([name, config]) => `${name}: ${config}`).join(', '),
                }}
                hideRearColumns
                gridHeight='80vh'
                columnNameText={explortFileName}
                openFrom={openFrom}
            />
        </>
    );
}