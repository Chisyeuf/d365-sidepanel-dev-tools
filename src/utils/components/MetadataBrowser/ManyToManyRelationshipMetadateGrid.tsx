
import ObjectListGrid from './ObjectListGrid';
import { metadataGrid_cascadeConfigToValue, metadataGrid_valueToBoolean } from './valueGetter';
import { ExploreGrid } from './types';
import { useContext, useEffect } from 'react';
import { MetadataContext } from './MetadataContextProvider';


function ManyToManyRelationshipMetadateGrid(props: ExploreGrid) {
    const { entityName, explortFileName, openFrom } = props;

    const { manyToManyRelationshipsMetadata, retrieveManyToManyRelationships, isFetchingComponentMetadata } = useContext(MetadataContext);

    useEffect(() => {
        retrieveManyToManyRelationships(entityName);
    }, [entityName, retrieveManyToManyRelationships]);

    return (
        <>
            <ObjectListGrid
                loading={isFetchingComponentMetadata}
                dataList={manyToManyRelationshipsMetadata[entityName] ?? []}
                frontColumns={[
                    "SchemaName",
                    "IntersectEntityName",
                    "Entity1LogicalName",
                    "Entity1IntersectAttribute",
                    "Entity2LogicalName",
                    "Entity2IntersectAttribute",
                    "Entity1NavigationPropertyName",
                    "Entity2NavigationPropertyName",
                    "Entity1AssociatedMenuConfiguration",
                    "Entity2AssociatedMenuConfiguration",
                ]}
                columnValueFormatter={{
                    "Entity1AssociatedMenuConfiguration": metadataGrid_cascadeConfigToValue,
                    "Entity2AssociatedMenuConfiguration": metadataGrid_cascadeConfigToValue,
                    "IsCustomizable": metadataGrid_valueToBoolean,
                }}
                hideRearColumns
                gridHeight='80vh'
                columnNameText={explortFileName}
                openFrom={openFrom}
            />
        </>
    );
}

export default ManyToManyRelationshipMetadateGrid;