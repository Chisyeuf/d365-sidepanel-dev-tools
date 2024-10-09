
import { MouseEvent, Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import { AttributeMetadata, MSType, MSDateFormat } from '../types/requestsType'
import { RetrievePrimaryNameAttribute } from '../hooks/XrmApi/RetrievePrimaryNameAttribute'
import React from 'react'
import { RetrieveAttributesMetaData } from '../hooks/XrmApi/RetrieveAttributesMetaData'
import { useBoolean } from 'usehooks-ts'
import { Stack, Button, Dialog, DialogContent, DialogTitle, IconButton, InputAdornment, TextField, Pagination, Chip, Box, Paper, ListItem, Theme, Tooltip, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { DataGrid, FooterPropsOverrides, GridCellCheckboxRenderer, GridColDef, GridColumnHeaderParams, GridColumnVisibilityModel, GridFilterModel, gridPageCountSelector, gridPageSelector, gridPageSizeSelector, gridPaginatedVisibleSortedGridRowEntriesSelector, GridPaginationModel, GridRenderCellParams, gridRowCountSelector, GridSortModel, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton, GridValueGetterParams, GRID_BOOLEAN_COL_DEF, selectedIdsLookupSelector, useGridApiContext, useGridSelector, gridPaginationRowRangeSelector } from '@mui/x-data-grid';
import { DialogActions, LinearProgress } from '@material-ui/core'
import { RecordsDisplayNamesResponse, RetrieveRecordsDisplayNames } from '../hooks/XrmApi/RetrieveRecordsDisplayNames';
import ClearIcon from '@mui/icons-material/Clear';
import '../global/extensions';
import CircularProgressOverflow from './CircularProgressOverflow'
import './DetailsSnackbar'
import { RetrieveCount } from '../hooks/XrmApi/RetrieveCount'
import { RetrieveAllRecordsByPage } from '../hooks/XrmApi/RetrieveAllRecordsByPage'
import { GridToolbarFilterXMLButton } from './GridToolbarFilterXMLButton'
import { RetrieveRecordsByFetchXML } from '../hooks/XrmApi/RetrieveRecordsByFetchXML'
import { CustomGridHeaderCheckbox } from './CustomGridHeaderCheckbox'
import FilterInput from './FilterInput'
import { RetrievePrimaryIdAttribute } from '../hooks/XrmApi/RetrievePrimaryIdAttribute'
import RecordContextualMenu from './RecordContextualMenu'

type RecordSelectorProps = {
    setRecordsIds: Dispatch<SetStateAction<string[]>>,
    entityname: string,
    recordsIds: string[],
    disabled?: boolean,
    multiple?: boolean,
    theme?: Theme
}
const RecordSelector: React.FunctionComponent<RecordSelectorProps> = (props) => {
    const { setRecordsIds, entityname, recordsIds, disabled, multiple } = props;

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [recordsDisplayNames, fetchingDisplayName] = RetrieveRecordsDisplayNames(entityname, recordsIds)
    const { value: isDialogOpen, setTrue: openDialog, setFalse: closeDialog } = useBoolean(false)
    const { value: isContextualMenuOpen, setTrue: openContextualMenuOpen, setFalse: closeContextualMenuOpen } = useBoolean(false)
    const [isGridLoading, setGridIsLoading] = useState<boolean>(false)
    const [isHover, setIsHover] = useState<boolean>(false)

    const handleOpenContextualMenu = (e: MouseEvent<HTMLSpanElement, globalThis.MouseEvent>) => {
        openContextualMenuOpen();
        setAnchorEl(e.currentTarget);
        e.preventDefault();
    }
    const handleCloseContextualMenu = () => {
        closeContextualMenuOpen();
        setAnchorEl(null);
    }
    // const NavigateToUpdate = () => {
    //     const extensionId = GetExtensionId();
    //     chrome.runtime.sendMessage(extensionId, { type: MessageType.CALLMESSAGECALLBACK, data: { toolId: ProcessButton.prefixId + 'updaterecord', data: { entityName: entityname, recordId: recordsIds?.at(0) } } },
    //         function (response) {
    //             if (response.success) {
    //             }
    //         }
    //     );
    // }

    const ClearButton: JSX.Element = useMemo(() =>
        <IconButton
            onClick={(e: MouseEvent<HTMLButtonElement>) => {
                setRecordsIds([])
                e.stopPropagation()
            }}>
            <ClearIcon />
        </IconButton>
        , [setRecordsIds]);

    const renderElement = useMemo(() => {
        return (
            <>
                <Tooltip enterDelay={600} title={<><Typography variant='caption'>Left click: open record selector</Typography><Typography variant='caption'>Right click: open contextual menu</Typography></>}>
                    <CircularProgressOverflow
                        onClick={openDialog}
                        loading={isGridLoading || fetchingDisplayName}
                        sx={{ cursor: !disabled ? "pointer" : "auto" }}
                        disableShrink
                        theme={props.theme}
                        onHover={setIsHover}
                    >
                        <TextField
                            size='small'
                            fullWidth
                            placeholder={entityname ? 'Search ' + entityname : "Select entity first"}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        {
                                            recordsDisplayNames?.length > 0 ?
                                                isHover && !props.disabled ?
                                                    ClearButton
                                                    : recordsDisplayNames?.length > 1 ?
                                                        <Chip label={"+" + (recordsDisplayNames.length - 1)} size='small' />
                                                        : null
                                                : null
                                        }
                                    </InputAdornment>
                                ),
                                readOnly: true,
                                style: { cursor: !disabled ? "pointer" : "auto" }
                            }}
                            inputProps={{
                                style: { cursor: !disabled ? "pointer" : "auto" }
                            }}
                            sx={{ cursor: !disabled ? "pointer" : "auto" }}
                            value={recordsDisplayNames.length > 0 ? (recordsDisplayNames.at(0)?.displayName ?? ("No name " + entityname)) : ''}
                            // value={recordsDisplayNames.map(r => r.displayName).join(", ")}
                            disabled={disabled}
                            onContextMenu={handleOpenContextualMenu}
                        />
                    </CircularProgressOverflow>
                </Tooltip>
                <RecordContextualMenu
                    open={isContextualMenuOpen}
                    anchorElement={anchorEl}
                    onClose={handleCloseContextualMenu}
                    entityName={entityname}
                    recordId={recordsIds?.at(0)}
                />
                {
                    !disabled && isDialogOpen &&
                    <RecordSelectorDialog
                        closeDialog={closeDialog}
                        entityname={entityname}
                        open={isDialogOpen}
                        recordsIds={recordsIds}
                        records={recordsDisplayNames}
                        setRecordsIds={setRecordsIds}
                        multiple={multiple}
                        setIsLoading={setGridIsLoading}
                    />
                }
            </>
        );
    }, [ClearButton, anchorEl, closeDialog, disabled, entityname, fetchingDisplayName, handleCloseContextualMenu, handleOpenContextualMenu, isContextualMenuOpen, isDialogOpen, isGridLoading, isHover, multiple, openDialog, props.disabled, props.theme, recordsDisplayNames, recordsIds, setRecordsIds]);

    return renderElement;
}

type RecordSelectorDialogProps = {
    open: boolean,
    closeDialog: () => void,
    entityname: string,
    recordsIds: string[],
    records: RecordsDisplayNamesResponse[],
    setRecordsIds: Dispatch<SetStateAction<string[]>>,
    multiple?: boolean,
    setIsLoading: Dispatch<SetStateAction<boolean>>
}
const RecordSelectorDialog: React.FunctionComponent<RecordSelectorDialogProps> = (props) => {
    const { closeDialog, open, entityname, records, recordsIds, setRecordsIds: registerRecordIds, multiple } = props;

    const [entityMetadata, fetchingMetadata] = RetrieveAttributesMetaData(entityname)
    const [filterInput, setFilterInput] = useState<string>("")
    const [visibleColumns, setVisibleColumns] = useState<GridColumnVisibilityModel>()
    const [filterModel, setFilterModel] = useState<GridFilterModel>()
    const [filterXml, setFilterXml] = useState<string | null>(null)
    const [sortModel, setSortModel] = useState<GridSortModel>()

    const primaryNameLogicalName = RetrievePrimaryNameAttribute(entityname)
    const idAttribute = RetrievePrimaryIdAttribute(entityname);

    const maxRowCount = RetrieveCount(entityname)
    // const [pageSize, setPageSize] = useState<number>(25)
    // const [page, setPage] = useState<number>(0)
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        pageSize: 25,
        page: 0,
    });

    const [allRecords, isFetchingAllRecords] = RetrieveAllRecordsByPage(
        entityname,
        entityMetadata?.map((value) => {
            if (value.MStype !== MSType.Lookup) return value.LogicalName
            else return "_" + value.LogicalName + "_value"
        }) ?? [],
        paginationModel.page,
        paginationModel.pageSize,
        filterInput,
        sortModel
    );
    const [fetchXmlRecords, isFetchingFetchXML] = RetrieveRecordsByFetchXML(entityname, filterXml ?? '')

    useEffect(() => {
        props.setIsLoading(fetchingMetadata || isFetchingAllRecords || isFetchingFetchXML)
    }, [fetchingMetadata, isFetchingAllRecords, isFetchingFetchXML])


    const onClose = () => {
        closeDialog();
    }

    const addRecord = (id: string) => {
        if (multiple) {
            if (recordsIds.indexOf(id) === -1)
                registerRecordIds((old) => [id, ...old])
        }
        else
            registerRecordIds([id])
    }


    const columns: GridColDef[] = useMemo(() => {
        const firstColumnsMetadata = entityMetadata.find(meta => meta.LogicalName === primaryNameLogicalName) ?? {} as AttributeMetadata
        const primaryIdColumnsMetadata = entityMetadata.find(meta => meta.MStype === MSType.Uniqueidentifier) ?? {} as AttributeMetadata

        const checkboxes: GridColDef = {
            ...GRID_BOOLEAN_COL_DEF,
            field: "__check__",
            type: "checkboxSelection",
            width: 50,
            resizable: false,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            hideable: false,
            disableReorder: true,
            disableExport: true,
            getApplyQuickFilterFn: undefined,
            valueGetter: (params: GridValueGetterParams<Boolean>) => {
                const apiRef = useGridApiContext();
                const selectionLookup = selectedIdsLookupSelector(apiRef.current.state, apiRef.current.instanceId);
                return selectionLookup[params.id] !== undefined;
            },
            renderHeader: (params: GridColumnHeaderParams) => (
                <CustomGridHeaderCheckbox {...params} entityname={entityname} />
            ),
            renderCell: (params: GridRenderCellParams) => (
                <GridCellCheckboxRenderer {...params} />
            )
        }
        return [checkboxes,
            {
                field: firstColumnsMetadata.LogicalName,
                headerName: "GUID",// ?? firstColumnsMetadata.DisplayName,
                resizable: true,
                hideable: false,
                hide: false,
                minWidth: 200,
                type: "string"
            },
            {
                field: primaryIdColumnsMetadata.LogicalName,
                headerName: primaryIdColumnsMetadata.DisplayName,
                resizable: true,
                hideable: false,
                hide: false,
                minWidth: 200,
                type: "string"
            },
            ...entityMetadata.filter(meta => meta.LogicalName !== primaryNameLogicalName && meta.MStype !== MSType.Uniqueidentifier).map<GridColDef>(meta => {
                return GridColDefGenerator(meta)
                // {
                //     field: meta.LogicalName,
                //     headerName: meta.DisplayName,
                //     resizable: true,
                //     hideable: true,
                //     hide: true,
                //     minWidth: 100,
                //     type: ConvertMSTypeToGridColDefType(meta.MStype)
                // }
            })]
    }, [entityMetadata, entityname, primaryNameLogicalName])

    return (
        <Dialog onClose={onClose} open={open} maxWidth={false} PaperProps={{ sx: { overflowY: 'inherit' } }}>
            <DialogTitle>
                <Stack direction={"row"} spacing={"5px"} justifyContent="space-between">
                </Stack>
            </DialogTitle>
            <DialogContent sx={{ height: "55vh", width: "55vw", overflowY: "inherit" }}>
                <DataGrid
                    rows={filterXml ? fetchXmlRecords : allRecords}
                    rowCount={filterXml ? fetchXmlRecords.length : maxRowCount}
                    columns={columns}
                    loading={isFetchingAllRecords || isFetchingFetchXML}
                    // initialState={{
                    //     pagination: {
                    //         paginationModel: {
                    //             page: page,
                    //             pageSize: pageSize
                    //         }
                    //     }
                    // }}
                    // checkboxSelection={multiple ?? false}
                    onRowClick={(params) => {
                        // click = setTimeout(() => {
                        addRecord(params.id as string)
                        // }, 200)
                    }}
                    onRowDoubleClick={(params) => {
                        // clearTimeout(click)
                        addRecord(params.id as string)
                        onClose()
                    }}
                    components={{
                        Toolbar: CustomToolBar,
                        // Pagination: CustomPagination,
                        LoadingOverlay: LinearProgress,
                        Footer: CustomFooter,
                    }}
                    componentsProps={{
                        toolbar: {
                            value: filterInput,
                            setFilter: setFilterInput,
                            filterXMLsetter: setFilterXml
                        },
                        footer: {
                            onClose: onClose,
                            selectedRecordIds: records,
                            registerRecordIds: registerRecordIds,
                        }
                    }}
                    getRowId={(row) => row[idAttribute]}
                    paginationMode={filterXml ? 'client' : 'server'}
                    pagination
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    // onPageChange={(newPage) => setPage(newPage)}
                    // onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                    rowSelectionModel={recordsIds}
                    onRowSelectionModelChange={(newRecordsId) => registerRecordIds(newRecordsId as string[])}
                    checkboxSelection={multiple}
                    keepNonExistentRowsSelected
                    // onStateChange={(state: GridState, event, details) => {
                    //     setVisibleColumns(state.columns.columnVisibilityModel);
                    //     setFilterModel(state.filter.filterModel)
                    //     setSortModel(state.sorting.sortModel)
                    // }}
                    filterModel={filterModel}
                    onFilterModelChange={setFilterModel}

                    sortModel={sortModel}
                    onSortModelChange={setSortModel}

                    columnVisibilityModel={visibleColumns}
                    onColumnVisibilityModelChange={setVisibleColumns}
                />
            </DialogContent>
        </Dialog>
    )
}
type CustomToolBarProps = {
    setFilter: (str: string) => void
    value: string
    filterXMLsetter: (filterXml: string | null) => void
}
function CustomToolBar(props: CustomToolBarProps) {
    return <Stack direction='row' spacing={0.5} justifyContent="space-between">
        <Box sx={{ width: '100%' }}>
            <GridToolbarContainer>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarDensitySelector />
                <GridToolbarExport />
                <GridToolbarFilterXMLButton filterXMLsetter={props.filterXMLsetter} />
            </GridToolbarContainer>
        </Box>
        <FilterInput returnFilterInput={props.setFilter} placeholder='Search Records by Name or ID' fullWidth />
    </Stack>
}
function CustomPagination() {
    const apiRef = useGridApiContext();
    const page = useGridSelector(apiRef, gridPageSelector);
    // const pageCount = useGridSelector(apiRef, gridPageCountSelector);
    const numberRows = useGridSelector(apiRef, gridRowCountSelector);
    const pageSize = useGridSelector(apiRef, gridPageSizeSelector);
    // const rowsDisplayed = useGridSelector(apiRef, gridPaginatedVisibleSortedGridRowEntriesSelector);
    // const rowRange = useGridSelector(apiRef, gridPaginationRowRangeSelector);
    // const numberRows = useGridSelector(apiRef, GridRowCount);

    const countMin = pageSize * page;
    const countMinPlusPageSize = countMin + pageSize;
    const countMax = countMinPlusPageSize < numberRows ? countMinPlusPageSize : numberRows;

    return (
        <Stack direction='row' alignItems="center" spacing={0.5}>
            <div>{countMin}-{countMax} of {numberRows}</div>
            <Pagination
                color="primary"
                count={Math.ceil(numberRows / pageSize)}
                page={page + 1}
                onChange={(event, value) => apiRef.current.setPage(value - 1)}
            />
        </Stack>
    );
}


declare module "@mui/x-data-grid" {
    interface FooterPropsOverrides {
        onClose: () => void
        selectedRecordIds: RecordsDisplayNamesResponse[],
        registerRecordIds: Dispatch<SetStateAction<string[]>>
        recordCount: number
    }
}
// type CustomFooterProps = {
//     onClose: () => void
//     selectedRecordIds: RecordsDisplayNamesResponse[],
//     registerRecordIds: Dispatch<SetStateAction<string[]>>
// }
function CustomFooter(props: FooterPropsOverrides) {
    const handleDelete = (chipToDelete: RecordsDisplayNamesResponse) => {
        const newSelectedRecords = props.selectedRecordIds.filter(r => r.id !== chipToDelete.id)
        props.registerRecordIds(newSelectedRecords.map(r => r.id))
        setChipsSelected(newSelectedRecords)
    };

    const [chipsSelected, setChipsSelected] = useState(props.selectedRecordIds)
    useEffect(() => {
        if (props.selectedRecordIds && props.selectedRecordIds.length > 0)
            setChipsSelected(props.selectedRecordIds)
    }, [props.selectedRecordIds])


    return (
        <Stack direction='row' alignItems="center" justifyContent="space-between" height="55px">
            <Box
                sx={{
                    width: '45%',
                    height: '44px'
                }}
                component='span'
            >
                <Paper
                    sx={{
                        display: 'flex',
                        overflowX: 'hidden',
                        listStyle: 'none',
                        p: 0.5,
                        m: '0 10px',
                        width: '100%',
                        minHeight: '36px',
                        flexWrap: 'nowrap',
                        "&:hover": {
                            flexWrap: 'wrap'
                        }
                    }}
                    component="ul"
                >
                    {
                        chipsSelected.map((value: RecordsDisplayNamesResponse) =>
                            <ListItem key={value.id} sx={{
                                padding: '2px 2px',
                                width: 'auto'
                            }}>
                                <Chip
                                    label={value.displayName}
                                    onDelete={() => { handleDelete(value) }}
                                />
                            </ListItem>
                        )
                    }
                </Paper>
            </Box>
            <DialogActions>
                <CustomPagination />
                <Button onClick={props.onClose} variant='contained' >Close</Button>
            </DialogActions>
        </Stack>
    )
}

function GridColDefGenerator(meta: AttributeMetadata): GridColDef {
    switch (meta.MStype) {
        case MSType.Uniqueidentifier:
            return (
                {
                    field: meta.LogicalName,
                    headerName: meta.DisplayName,
                    resizable: true,
                    hideable: true,
                    minWidth: 100,
                    type: "string"
                }
            );
        case MSType.Lookup:
            return (
                {
                    field: "_" + meta.LogicalName + "_value",
                    headerName: meta.DisplayName,
                    resizable: true,
                    hideable: true,
                    minWidth: 100,
                    type: "string",
                    valueGetter: (params: GridValueGetterParams) => params.row["_" + meta.LogicalName + "_value@OData.Community.Display.V1.FormattedValue"]
                }
            );
        case MSType.String:
            return (
                {
                    field: meta.LogicalName,
                    headerName: meta.DisplayName,
                    resizable: true,
                    hideable: true,
                    minWidth: 100,
                    type: "string"
                }
            );
        case MSType.Memo:
            return (
                {
                    field: meta.LogicalName,
                    headerName: meta.DisplayName,
                    resizable: true,
                    hideable: true,
                    minWidth: 100,
                    type: "string"
                }
            );
        case MSType.Decimal:
            return (
                {
                    field: meta.LogicalName,
                    headerName: meta.DisplayName,
                    resizable: true,
                    hideable: true,
                    minWidth: 100,
                    type: "number",
                }
            );
        case MSType.Double:
            return (
                {
                    field: meta.LogicalName,
                    headerName: meta.DisplayName,
                    resizable: true,
                    hideable: true,
                    minWidth: 100,
                    type: "number"
                }
            );
        case MSType.Money:
            return (
                {
                    field: meta.LogicalName,
                    headerName: meta.DisplayName,
                    resizable: true,
                    hideable: true,
                    minWidth: 100,
                    type: "number"
                }
            );
        case MSType.Integer:
            return (
                {
                    field: meta.LogicalName,
                    headerName: meta.DisplayName,
                    resizable: true,
                    hideable: true,
                    minWidth: 100,
                    type: "number"
                }
            );
        case MSType.BigInt:
            return (
                {
                    field: meta.LogicalName,
                    headerName: meta.DisplayName,
                    resizable: true,
                    hideable: true,
                    minWidth: 100,
                    type: "number"
                }
            );
        case MSType.Boolean:
            return (
                {
                    field: meta.LogicalName,
                    headerName: meta.DisplayName,
                    resizable: true,
                    hideable: true,
                    minWidth: 100,
                    type: "boolean",
                    renderCell: (params: GridRenderCellParams) => <>{params.row[meta.LogicalName + "@OData.Community.Display.V1.FormattedValue"]}</>
                }
            );
        case MSType.DateTime:
            switch (meta.Parameters.Format) {
                case MSDateFormat.DateAndTime:
                    return (
                        {
                            field: meta.LogicalName,
                            headerName: meta.DisplayName,
                            resizable: true,
                            hideable: true,
                            minWidth: 100,
                            type: "dateTime",
                            valueGetter: ({ value }) => value && new Date(value),
                        }
                    );
                case MSDateFormat.DateOnly:
                    return (
                        {
                            field: meta.LogicalName,
                            headerName: meta.DisplayName,
                            resizable: true,
                            hideable: true,
                            minWidth: 100,
                            type: "date",
                            valueGetter: ({ value }) => value && new Date(value),
                        }
                    );
            }
            break;
        case MSType.Status:
            return (
                {
                    field: meta.LogicalName,
                    headerName: meta.DisplayName,
                    resizable: true,
                    hideable: true,
                    minWidth: 100,
                    type: "singleSelect",
                    valueGetter: (params: GridValueGetterParams) => params.row[meta.LogicalName + "@OData.Community.Display.V1.FormattedValue"]
                }
            );
        case MSType.State:
            return (
                {
                    field: meta.LogicalName,
                    headerName: meta.DisplayName,
                    resizable: true,
                    hideable: true,
                    minWidth: 100,
                    type: "singleSelect",
                    valueGetter: (params: GridValueGetterParams) => params.row[meta.LogicalName + "@OData.Community.Display.V1.FormattedValue"]
                }
            );
        case MSType.Picklist:
            return (
                {
                    field: meta.LogicalName,
                    headerName: meta.DisplayName,
                    resizable: true,
                    hideable: true,
                    minWidth: 100,
                    type: "singleSelect",
                    valueGetter: (params: GridValueGetterParams) => params.row[meta.LogicalName + "@OData.Community.Display.V1.FormattedValue"]
                }
            );
        case MSType.MultiSelectPicklist:
            return (
                {
                    field: meta.LogicalName,
                    headerName: meta.DisplayName,
                    resizable: true,
                    hideable: true,
                    minWidth: 100,
                    type: "string",
                    valueGetter: (params: GridValueGetterParams) => params.row[meta.LogicalName + "@OData.Community.Display.V1.FormattedValue"]
                }
            );
        case MSType.Image:
            return (
                {
                    field: meta.LogicalName,
                    headerName: meta.DisplayName,
                    resizable: true,
                    hideable: true,
                    minWidth: 100,
                    type: "string"
                }
            );
        default:
            break;
    }
    return (
        {
            field: meta.LogicalName,
            headerName: meta.DisplayName,
            resizable: true,
            hideable: true,
            minWidth: 100,
            type: "string"
        }
    );
}

export default RecordSelector