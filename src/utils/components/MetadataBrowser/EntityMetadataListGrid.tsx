import { GridActionsCellItem, GridActionsCellItemProps } from '@mui/x-data-grid';
import ObjectListGrid from './ObjectListGrid';
import { metadataGrid_valueToBoolean, metadataGrid_valueToLabel } from './valueGetter';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import AttributeMetadataGrid from './AttributeMetadataGrid';
import { useBoolean } from 'usehooks-ts';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import TableRowsIcon from '@mui/icons-material/TableRows';
import ShareIcon from '@mui/icons-material/Share';
import StyleIcon from '@mui/icons-material/Style';
import { useContext, useEffect, useMemo } from 'react';
import { MetadataContext } from './MetadataContextProvider';
import { ManyToOneRelationshipMetadateGrid, OneToManyRelationshipMetadateGrid } from './RelationshipMetadateGrid';
import ManyToManyRelationshipMetadateGrid from './ManyToManyRelationshipMetadateGrid';
import CloseIcon from '@mui/icons-material/Close';
import { Transition } from './StyledDataGrid';
import OptionSetMetadataGridSelector from './OptionSetMetadataGrid';
import { ExploreGrid } from './types';


interface ExploreMenuDialogButtonItemProps {
    entityName: string
    entityDisplayName: string
    dialogComponent: (props: ExploreGrid) => JSX.Element
}
function ExploreMenuDialogItem(props: ExploreMenuDialogButtonItemProps & GridActionsCellItemProps) {

    const { entityName, dialogComponent, entityDisplayName, ...cellItemProps } = props;

    const { value: open, setTrue: setOpen, setFalse: setClose } = useBoolean(false);

    return (
        <>
            <GridActionsCellItem {...cellItemProps} onClick={setOpen} />
            <ExploreBaseDialog {...{ entityName, dialogName: cellItemProps.label, open, setClose, entityDisplayName, dialogComponent }} />
        </>
    )
}

interface ExploreMenuDialogItemProps {
    entityName: string
    entityDisplayName: string
    dialogComponent: (props: ExploreGrid) => JSX.Element

    dialogName: string
    open: boolean
    setClose: () => void
}
function ExploreBaseDialog(props: ExploreMenuDialogItemProps) {

    const { entityName, entityDisplayName, dialogName, open, setClose, dialogComponent } = props;

    const dialogTitleContent = useMemo(() => (
        <Stack direction='row'>
            <Box onClick={setClose} sx={{ cursor: 'pointer' }}>
                <b>{entityDisplayName}</b>
            </Box>
            <NavigateNextIcon sx={{ pl: 0.5 }} />
            {dialogName}
        </Stack>
    ), [dialogName, entityDisplayName, setClose]);

    return (
        <Dialog
            open={open}
            TransitionComponent={Transition}
            fullWidth
            maxWidth={false}
            onClose={setClose}
        >
            <DialogTitle fontSize='1em' pb='0 !important' display='flex' alignItems='center' justifyContent='space-between'>
                {dialogTitleContent}
                <IconButton onClick={setClose}><CloseIcon /></IconButton>
            </DialogTitle>
            <Box overflow='auto'>
                {open && dialogComponent({ entityName, explortFileName: `${entityDisplayName} - ${dialogName}`, openFrom: dialogTitleContent })}
            </Box>
        </Dialog>
    );
}


function ExploreAttributesGrid(props: ExploreGrid) {

    return (
        <AttributeMetadataGrid
            {...props}
        />
    );
}
function ExploreOptionSetsGrid(props: ExploreGrid) {

    return (
        <OptionSetMetadataGridSelector
            {...props}
        />
    );
}
function ExploreOneToManyRelationshipsGrid(props: ExploreGrid) {

    return (
        <OneToManyRelationshipMetadateGrid
            {...props}
        />
    );
}
function ExploreManyToOneRelationshipsGrid(props: ExploreGrid) {

    return (
        <ManyToOneRelationshipMetadateGrid
            {...props}
        />
    );
}
function ExploreManyToManyRelationshipsGrid(props: ExploreGrid) {

    return (
        <ManyToManyRelationshipMetadateGrid
            {...props}
        />
    );
}


interface EntityMetadateGridProps {
}
function EntityMetadataListGrid(props: EntityMetadateGridProps) {

    const { entitiesMetadata, isFetchingEntitiesMetadata } = useContext(MetadataContext);

    return (
        <ObjectListGrid
            loading={isFetchingEntitiesMetadata}
            dataList={entitiesMetadata}
            frontColumns={["Explore", "LogicalName", "SchemaName", "DisplayName", "Description", "PrimaryNameAttribute", "CreatedOn", "ModifiedOn"]}
            columnValueFormatter={{
                "DisplayName": metadataGrid_valueToLabel,
                "Description": metadataGrid_valueToLabel,
                "IsValidForAdvancedFind": metadataGrid_valueToBoolean,
                "DisplayCollectionName": metadataGrid_valueToLabel,
                "IsAuditEnabled": metadataGrid_valueToBoolean,
                "IsValidForQueue": metadataGrid_valueToBoolean,
                "IsConnectionsEnabled": metadataGrid_valueToBoolean,
                "IsCustomizable": metadataGrid_valueToBoolean,
                "IsRenameable": metadataGrid_valueToBoolean,
                "IsMappable": metadataGrid_valueToBoolean,
                "IsDuplicateDetectionEnabled": metadataGrid_valueToBoolean,
                "CanCreateAttributes": metadataGrid_valueToBoolean,
                "CanCreateForms": metadataGrid_valueToBoolean,
                "CanCreateViews": metadataGrid_valueToBoolean,
                "CanCreateCharts": metadataGrid_valueToBoolean,
                "CanBeRelatedEntityInRelationship": metadataGrid_valueToBoolean,
                "CanBePrimaryEntityInRelationship": metadataGrid_valueToBoolean,
                "CanBeInManyToMany": metadataGrid_valueToBoolean,
                "CanBeInCustomEntityAssociation": metadataGrid_valueToBoolean,
                "CanEnableSyncToExternalSearchIndex": metadataGrid_valueToBoolean,
                "CanModifyAdditionalSettings": metadataGrid_valueToBoolean,
                "CanChangeHierarchicalRelationship": metadataGrid_valueToBoolean,
                "CanChangeTrackingBeEnabled": metadataGrid_valueToBoolean,
                "IsMailMergeEnabled": metadataGrid_valueToBoolean,
                "IsVisibleInMobile": metadataGrid_valueToBoolean,
                "IsVisibleInMobileClient": metadataGrid_valueToBoolean,
                "IsReadOnlyInMobileClient": metadataGrid_valueToBoolean,
                "IsOfflineInMobileClient": metadataGrid_valueToBoolean,
                "Privileges": (value: any) => value?.map((privilege: any) => privilege.PrivilegeType).join(', '),
            }}
            rowNameGetter={(row) => row.DisplayName.UserLocalizedLabel?.Label ?? row.SchemaName}
            columnOrder={{ "Explore": 1 }}
            columnWidths={{ "Explore": 70 }}
            moreColumns={[{
                type: 'actions',
                field: "Explore",
                headerName: 'Explore',
                width: 70,
                disableColumnMenu: true,
                disableExport: true,
                sortable: false,
                resizable: false,
                hideable: false,
                getActions: (params) => [
                    <ExploreMenuDialogItem
                        icon={<TableRowsIcon />}
                        label="Attributes"
                        entityName={params.row.LogicalName}
                        entityDisplayName={params.row.DisplayName.UserLocalizedLabel?.Label ?? params.row.SchemaName}
                        dialogComponent={ExploreAttributesGrid}
                        showInMenu
                        closeMenuOnClick={false}
                    />,
                    <ExploreMenuDialogItem
                        icon={<StyleIcon />}
                        label="OptionSets"
                        entityName={params.row.LogicalName}
                        entityDisplayName={params.row.DisplayName.UserLocalizedLabel?.Label ?? params.row.SchemaName}
                        dialogComponent={ExploreOptionSetsGrid}
                        showInMenu
                        closeMenuOnClick={false}
                    />,
                    <GridActionsCellItem
                        label="Relationships"
                        disabled
                        showInMenu
                        sx={(theme) => ({
                            opacity: '1 !important',
                            width: 'calc(100% - 16px)',
                            justifyContent: 'center',
                            height: '1px',
                            background: `linear-gradient(90deg, rgba(255,255,255,1) 0%, ${theme.palette.action.active} 12%, rgba(255,255,255,1) 18%, rgba(255,255,255,1) 82%, ${theme.palette.action.active} 88%, rgba(255,255,255,1) 100%)`,
                            p: 0,
                            m: 1,
                            mt: 2,
                            mb: 1.5
                        })}
                    />,
                    <ExploreMenuDialogItem
                        icon={<ShareIcon />}
                        label="One To Many"
                        entityName={params.row.LogicalName}
                        entityDisplayName={params.row.DisplayName.UserLocalizedLabel?.Label ?? params.row.SchemaName}
                        dialogComponent={ExploreOneToManyRelationshipsGrid}
                        showInMenu
                        closeMenuOnClick={false}
                    />,
                    <ExploreMenuDialogItem
                        icon={<ShareIcon sx={{ transform: 'scaleX(-1)' }} />}
                        label="Many To One"
                        entityName={params.row.LogicalName}
                        entityDisplayName={params.row.DisplayName.UserLocalizedLabel?.Label ?? params.row.SchemaName}
                        dialogComponent={ExploreManyToOneRelationshipsGrid}
                        showInMenu
                        closeMenuOnClick={false}
                    />,
                    <ExploreMenuDialogItem
                        // icon={<><HubIcon /></>}
                        icon={<><ShareIcon /><ShareIcon sx={{ transform: 'scaleX(-1)', position: 'absolute' }} /></>}
                        label="Many To Many"
                        entityName={params.row.LogicalName}
                        entityDisplayName={params.row.DisplayName.UserLocalizedLabel?.Label ?? params.row.SchemaName}
                        dialogComponent={ExploreManyToManyRelationshipsGrid}
                        showInMenu
                        closeMenuOnClick={false}
                    />
                ]
            }]}
            hideRearColumns
            fullHeight
            gridHeight='90vh'
        />
    );
}

export default EntityMetadataListGrid;