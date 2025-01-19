
import ObjectListGrid from './ObjectListGrid';
import { metadataGrid_valueToBoolean, metadataGrid_valueToLabel, metadataGrid_valueToValue } from './valueGetter';
import { ExploreGrid } from './types';
import { useContext, useEffect } from 'react';
import { MetadataContext } from './MetadataContextProvider';


function AttributeMetadataGrid(props: ExploreGrid) {
    const { entityName, explortFileName, openFrom, sptSnackbarProvider } = props;

    const { attributesMetadata, retrieveAttributes, isFetchingComponentMetadata } = useContext(MetadataContext);

    useEffect(() => {
        retrieveAttributes(entityName);
    }, [entityName, retrieveAttributes]);

    return (
        <>
            <ObjectListGrid
                loading={isFetchingComponentMetadata}
                dataList={attributesMetadata[entityName] ?? []}
                frontColumns={["ColumnNumber", "LogicalName", "SchemaName", "DisplayName", "AttributeType", "Format", "AttributeOf", "IsCustomAttribute", "IsManaged", "CreatedOn", "ModifiedOn"]}
                excludeColumns={[(name) => name.includes('@')]}
                columnValueFormatter={{
                    "DisplayName": metadataGrid_valueToLabel,
                    "AttributeTypeName": metadataGrid_valueToValue,
                    "Description": metadataGrid_valueToLabel,
                    "IsAuditEnabled": metadataGrid_valueToBoolean,
                    "IsGlobalFilterEnabled": metadataGrid_valueToBoolean,
                    "IsSortableEnabled": metadataGrid_valueToBoolean,
                    "IsCustomizable": metadataGrid_valueToBoolean,
                    "IsRenameable": metadataGrid_valueToBoolean,
                    "IsValidForAdvancedFind": metadataGrid_valueToBoolean,
                    "RequiredLevel": metadataGrid_valueToValue,
                    "CanModifyAdditionalSettings": metadataGrid_valueToBoolean,
                    "FormatName": metadataGrid_valueToValue,
                    "DateTimeBehavior": metadataGrid_valueToValue,
                    "CanChangeDateTimeBehavior": metadataGrid_valueToBoolean,
                    "Targets": (value: any) => value?.join(', '),
                }}
                hideRearColumns
                gridHeight='80vh'
                columnNameText={explortFileName}
                openFrom={openFrom}
                sptSnackbarProvider={sptSnackbarProvider}
            />
        </>
    );
}

export default AttributeMetadataGrid;