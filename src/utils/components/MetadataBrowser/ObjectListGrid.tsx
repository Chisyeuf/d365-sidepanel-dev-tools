import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import PaginationItem from '@mui/material/PaginationItem';
import { DataGrid, GridColDef, GridColumnMenu, GridColumnMenuItemProps, GridColumnMenuProps, gridPageCountSelector, gridPageSelector, GridRenderCellParams, GridRowSelectionModel, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton, GridToolbarQuickFilter, useGridApiContext, useGridSelector } from '@mui/x-data-grid';
import { DataGridProps, GridBaseColDef } from '@mui/x-data-grid/internals';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ZoomSlider from '../ZoomSlider';
import HeightIcon from '@mui/icons-material/Height';
import ReadMoreIcon from '@mui/icons-material/ReadMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useCopyToClipboard } from 'usehooks-ts';
import { CustomLoadingOverlay, CustomNoResultsOverlay, CustomNoRowsOverlay } from './StyledDataGrid';
import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { MetadataGridContext } from './MetadataContextProvider';
import { noOperation } from '../../global/common';
import { useSnackbar } from 'notistack';


function CustomPagination(props: any) {
    const apiRef = useGridApiContext();
    const page = useGridSelector(apiRef, gridPageSelector);
    const pageCount = useGridSelector(apiRef, gridPageCountSelector);

    return (
        <Pagination
            color="primary"
            variant="outlined"
            shape="rounded"
            page={page + 1}
            count={pageCount}
            renderItem={(props) => <PaginationItem {...props} />}
            onChange={(event: React.ChangeEvent<unknown>, value: number) =>
                apiRef.current?.setPage(value - 1)
            }
            {...props}
        />
    );
}

function CustomToolbar(props: any & { zoom: number, setZoom?: (zoom: number) => void, exportFileName: string }) {
    const { zoom, setZoom, exportFileName, ...gridToolbarProps } = props;
    const apiRef = useGridApiContext();

    const resizeColumns = useCallback(() => {
        apiRef.current?.autosizeColumns(autoSizeOption);
    }, [apiRef]);

    return (
        <GridToolbarContainer {...gridToolbarProps}>
            <GridToolbarColumnsButton />
            <GridToolbarFilterButton />
            <GridToolbarDensitySelector slotProps={{ tooltip: { title: 'Change density' } }} />
            <Button onClick={resizeColumns} startIcon={<HeightIcon sx={{ rotate: '90deg' }} />} size='small'>Auto Size Columns</Button>
            <Box sx={{ flexGrow: 1 }} />
            <GridToolbarQuickFilter sx={{ width: "25%", minWidth: 250 }} />
            <Box sx={{ flexGrow: 1 }} />
            <ZoomSlider zoom={zoom} onChange={setZoom} width={200} max={2} min={0.5} step={0.1} />
            <GridToolbarExport slotProps={{ tooltip: { title: 'Export data' }, button: { variant: 'outlined' } }} csvOptions={{ fileName: exportFileName }} />
        </GridToolbarContainer>
    );
}

function CustomUserItem(props: GridColumnMenuItemProps) {
    const { myCustomHandler, myCustomValue } = props;
    return (
        <MenuItem onClick={myCustomHandler}>
            <ListItemIcon>
                <ContentCopyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{myCustomValue}</ListItemText>
        </MenuItem>
    );
}
function CustomColumnMenu(props: GridColumnMenuProps) {
    const [, copy] = useCopyToClipboard();

    return (
        <GridColumnMenu
            {...props}
            slots={{ columnMenuCopyLabel: CustomUserItem }}
            slotProps={{
                columnMenuCopyLabel: {
                    displayOrder: 15,
                    myCustomValue: 'Copy column label',
                    myCustomHandler: (e: any) => { copy(props.colDef.headerName ?? props.colDef.field); props.hideMenu(e) },
                },
            }}
        />
    );
}



type ObjectListDataGridProps = Omit<DataGridProps, 'columns' | 'rows'>;

interface IGridButtonsContext {
    openedGridId: string
    openGrid: React.Dispatch<React.SetStateAction<string>>
}
const GridButtonsContext = createContext<IGridButtonsContext>({
    openedGridId: '',
    openGrid: noOperation
});

function GridSubGridCell(props: GridRenderCellParams & ObjectListDataGridProps & { dataList: { [key: string]: any }[], parentId: string, formatedValue?: any, type: string, columnName: ReactNode, columnNameText: string }) {

    const { dataList, parentId, id, formatedValue, type, columnName, columnNameText, ...datagridProps } = props;

    const { openGrid, openedGridId } = useContext(GridButtonsContext);

    const uuid = useMemo(() => `${parentId};${uuidv4()}`, [parentId]);
    const depth = useMemo(() => uuid.split(';').length, [uuid]);

    const anchorEl = useRef(null);

    const handleClick = (e: React.MouseEvent) => {
        openGrid((old: string) => {
            if (old.includes(uuid)) {
                return parentId;
            }
            return uuid;
        });
        e.stopPropagation();
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            openGrid('');
        }
    };

    const isOpen = useMemo(() => openedGridId.includes(uuid), [openedGridId, uuid]);
    const label = useMemo(() => {
        if (formatedValue === '') {
            return <i>empty string</i>;
        }
        return formatedValue;
    }, [formatedValue]);


    return (
        dataList ?
            <>
                <Stack direction='row' spacing={0.5} justifyContent='space-between' onDoubleClick={handleClick} height='100%'>
                    <Box title={formatedValue ?? type} flex={1} minWidth={0} overflow='hidden' textOverflow='ellipsis'>{label ?? <i>{type}</i>}</Box>
                    <Tooltip title={<>Show details of {type}</>} placement='right' arrow disableInteractive>
                        <IconButton ref={anchorEl} size='small' onClick={handleClick} color={isOpen ? 'error' : 'primary'} sx={{ height: '100%', maxHeight: 38, aspectRatio: '1/1', mb: 'auto !important' }}>
                            <ReadMoreIcon fontSize='small' />
                        </IconButton>
                    </Tooltip>
                </Stack>

                <Dialog
                    open={isOpen}
                    fullWidth
                    maxWidth={'lg'}
                    hideBackdrop={depth > 2}
                    PaperProps={(depth > 2 ? { elevation: 0 } : undefined)}
                    onKeyDown={handleKeyDown}
                >
                    <DialogTitle onClick={(e) => e.stopPropagation()} fontSize='1em' pb='0 !important' display='flex' alignItems='center' justifyContent='space-between'>
                        <Stack direction='row'>
                            {columnName}
                        </Stack>
                        <IconButton onClick={handleClick}><CloseIcon /></IconButton>
                    </DialogTitle>
                    <InnerObjectListGrid
                        id={uuid}
                        parentId={parentId}
                        openFrom={columnName}
                        columnNameText={columnNameText}
                        dataList={dataList}
                        gridHeight={'60vh'}
                        {...datagridProps}
                    />
                </Dialog >
            </>
            : null
    )
}


const autoSizeOption = {
    expand: true,
    includeHeaders: true,
    includeOutliers: true,
    outliersFactor: 1.5
};

export interface ObjectListGridProps {
    id?: string;
    parentId?: string;
    openFrom?: ReactNode;
    columnNameText?: string;
    rowNameGetter?: (row: any) => string;
    dataList: { [key: string]: any }[];
    frontColumns?: string[];
    excludeColumns?: (string | ((name: string) => boolean))[];
    columnLabels?: { [columnName: string]: string };
    columnWidths?: { [columnName: string]: number };
    columnValueGetter?: { [columnName: string]: GridBaseColDef['valueGetter'] };
    columnValueFormatter?: { [columnName: string]: GridBaseColDef['valueFormatter'] };
    columnRenderCell?: { [columnName: string]: GridBaseColDef['renderCell'] };
    hideRearColumns?: boolean;
    columnsMinWidth?: number;
    fullHeight?: boolean;
    gridHeight?: number | string;
    rowHeight?: number;
    moreColumns?: GridColDef[];
    columnOrder?: { [key: string]: number };
    loading?: boolean;
    autoRowHeight?: boolean;
    defaultRenderCell?: GridColDef['renderCell'];
}

function InnerObjectListGrid(props: ObjectListGridProps & ObjectListDataGridProps) {
    const {
        id = '',
        parentId = '',
        openFrom = '',
        columnNameText = '',
        rowNameGetter,
        dataList,
        moreColumns,
        frontColumns,
        excludeColumns,
        columnLabels,
        columnWidths,
        columnValueGetter,
        columnValueFormatter,
        columnRenderCell,
        hideRearColumns = false,
        columnsMinWidth = 100,
        fullHeight = false,
        gridHeight,
        rowHeight,
        columnOrder,
        loading = false,
        defaultRenderCell,
        autoRowHeight,
        ...gridProps
    } = props;

    const { openGrid } = useContext(GridButtonsContext);
    const { setZoom, zoom } = useContext(MetadataGridContext);

    const {enqueueSnackbar} = useSnackbar();

    const [rowSelectionModel, setRowSelectionModel] = React.useState<GridRowSelectionModel>([]);

    const handleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        openGrid(id);
    }, [id, openGrid]);
    
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (e.button === 3) {
            openGrid(parentId);
            return;
        }
    }, [parentId, openGrid]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            openGrid('');
        }
        else if (e.ctrlKey && e.key === 'c') {
            if (rowSelectionModel.length > 0) {
                enqueueSnackbar(`Selected row copied.`, { variant: 'default' });
            }
            e.preventDefault();
            e.stopPropagation();
        }
    };

    const columnsFromData: { [key: string]: GridColDef } = useMemo(() => (
        dataList.reduce((previousValue, currentValue) => {
            const isArray = Array.isArray(currentValue);
            const isNull = currentValue === null;
            const isObject = !isArray && typeof currentValue === 'object' && !isNull;
            if (isObject) {
                Object.entries(currentValue).forEach(([columnName, value]) => {

                    if (!previousValue[columnName]) {
                        const col: GridColDef = {
                            field: columnName,
                            filterable: true,
                            pinnable: true,
                            headerName: columnLabels?.[columnName],
                            flex: !columnWidths?.[columnName] ? 1 : undefined,
                            minWidth: columnsMinWidth,
                            width: columnWidths?.[columnName],
                            valueGetter: columnValueGetter?.[columnName],
                            valueFormatter: columnValueFormatter?.[columnName],
                            renderCell: (
                                (params) => {

                                    const { value, formattedValue } = params;

                                    const customRender = columnRenderCell?.[columnName];
                                    const trueFormatedValue = columnValueFormatter?.[columnName] ? formattedValue : undefined;

                                    const isArray = Array.isArray(value);
                                    const isNull = value === null;
                                    const isObject = !isArray && typeof value === 'object' && !isNull;


                                    if (isObject) {
                                        return <GridSubGridCell
                                            {...params}
                                            dataList={value ? [value] : []}
                                            parentId={id}
                                            formatedValue={customRender?.(params) ?? trueFormatedValue}
                                            type={"Object"}
                                            columnNameText={`${columnNameText ? columnNameText : rowNameGetter?.(params.row) ?? 'Selected array'} - ${columnLabels?.[columnName] ?? columnName}`}
                                            columnName={
                                                <>
                                                    <Stack direction='row' display='flex' alignItems='center' onClick={handleClick}>
                                                        <Stack direction='row' sx={{ cursor: 'pointer' }}>{openFrom ? openFrom : <b>{rowNameGetter?.(params.row) ?? 'Selected object'}</b>}</Stack>
                                                        <NavigateNextIcon sx={{ pl: 0.5, cursor: 'auto' }} />
                                                    </Stack>
                                                    {columnLabels?.[columnName] ?? columnName}
                                                </>
                                            }
                                        />;
                                    }
                                    if (isArray) {
                                        if (value?.length) {
                                            return <GridSubGridCell
                                                {...params}
                                                dataList={value}
                                                parentId={id}
                                                formatedValue={customRender?.(params) ?? trueFormatedValue}
                                                type={`Array of ${value.length}`}
                                                columnNameText={`${columnNameText ? columnNameText : rowNameGetter?.(params.row) ?? 'Selected array'} - ${columnLabels?.[columnName] ?? columnName}`}
                                                columnName={
                                                    <>
                                                        <Stack direction='row' alignItems='center' onClick={handleClick}>
                                                            <Stack direction='row' component='span' sx={{ cursor: 'pointer' }}>{openFrom ? openFrom : <b>{rowNameGetter?.(params.row) ?? 'Selected array'}</b>}</Stack>
                                                            <NavigateNextIcon sx={{ pl: 0.5, cursor: 'auto' }} />
                                                        </Stack>
                                                        {columnLabels?.[columnName] ?? columnName}
                                                    </>
                                                }
                                            />;
                                        }
                                        return <Box title={'Empty array'}>[ ]</Box>;
                                    }
                                    if (customRender) {
                                        return customRender(params);
                                    }
                                    if (isNull) {
                                        return <i>null</i>;
                                    }
                                    if (value === '') {
                                        return <i>empty string</i>;
                                    }
                                    if (value === true) {
                                        return 'true';
                                    }
                                    if (value === false) {
                                        return 'false';
                                    }

                                    return trueFormatedValue;
                                }
                            )
                        };
                        previousValue[columnName] = col;
                    }
                });
            }
            else {
                if (!previousValue['Index'] || !previousValue['Value']) {
                    previousValue['Index'] = {
                        field: 'Index',
                        filterable: true,
                        pinnable: true,
                        width: 50,
                        minWidth: columnsMinWidth,
                    }
                    previousValue['Value'] = {
                        field: 'Value',
                        filterable: true,
                        pinnable: true,
                        flex: 1,
                        minWidth: columnsMinWidth,
                    }
                }
            }
            return previousValue;
        }, {})
    ), [columnLabels, columnNameText, columnRenderCell, columnValueFormatter, columnValueGetter, columnWidths, columnsMinWidth, dataList, handleClick, id, openFrom, rowNameGetter]);


    const defaultColumns: GridColDef[] = useMemo(() => (
        frontColumns?.map(c => ({
            field: c,
            filterable: true,
            pinnable: true,
            headerName: columnLabels?.[c],
            flex: !columnWidths?.[c] ? 1 : undefined,
            minWidth: columnsMinWidth,
            width: columnWidths?.[c],
        })).filter(c => c) ?? []
    ), [columnLabels, columnWidths, columnsMinWidth, frontColumns]);

    const { columns, columnVisibilityModelCalculated } = useMemo(() => {

        const allColumns = { ...columnsFromData };
        moreColumns?.forEach(c => { allColumns[c.field] = c });

        const _frontColumns: GridColDef[] = frontColumns?.map(c => allColumns[c]).filter(c => c) ?? [];

        const excludeColumnsString: string[] = (excludeColumns?.filter(e => typeof e === 'string') ?? []) as string[];
        const excludeColumnsFn: ((name: string) => boolean)[] = (excludeColumns?.filter(e => typeof e !== 'string') ?? []) as ((name: string) => boolean)[];

        const rearColumns: GridColDef[] = Object.values(allColumns).filter(c =>
            !frontColumns?.includes(c.field) &&
            !(
                excludeColumnsString.includes(c.field) ||
                excludeColumnsFn.some(fn => fn(c.field))
            )
        );

        const allColumnsList = [..._frontColumns, ...rearColumns];

        const orderedColumns: [GridColDef, number][] = Object.entries(columnOrder ?? [])
            .sort(([, order1], [, order2]) => order1 - order2)
            .map(([field, order]) => [allColumns[field], order]);

        const positiveOrderedColumns = orderedColumns.filter(([, order]) => order >= 0).map(([field,]) => field);
        const negativeOrderedColumns = orderedColumns.filter(([, order]) => order < 0).map(([field,]) => field);
        const notOrderedColumns = allColumnsList.filter(c => !Object.keys(columnOrder ?? []).includes(c.field));

        const returnColumns = [...positiveOrderedColumns, ...notOrderedColumns, ...negativeOrderedColumns];


        return { columns: returnColumns, columnVisibilityModelCalculated: hideRearColumns ? Object.fromEntries(rearColumns.map(c => ([c.field, false]))) : undefined };
    }, [columnOrder, columnsFromData, excludeColumns, frontColumns, hideRearColumns, moreColumns]);

    const [columnVisibilityModel, setColumnVisibilityModel] = useState<DataGridProps['columnVisibilityModel']>({});

    useEffect(() => {
        setColumnVisibilityModel(columnVisibilityModelCalculated);
    }, [columnVisibilityModelCalculated]);

    const rows = useMemo(() => dataList.map((data, index) => {
        const isArray = Array.isArray(data);
        const isNull = data === null;
        const isObject = !isArray && typeof data === 'object' && !isNull;

        return { id: index, ...(isObject ? data : { Index: index, Value: data }) };
    }), [dataList]);


    return (
        <Box maxHeight='100vh' maxWidth='100vw' height={"100%"} onClick={handleClick} onKeyDown={handleKeyDown} onMouseDown={handleMouseDown}>
            <Paper elevation={0} sx={{ p: 1, cursor: 'auto', height: 'calc(100% - 16px)' }}>
                <DataGrid
                    columns={columns.length > (moreColumns?.length ?? 0) ? columns : defaultColumns}
                    rows={rows}
                    rowHeight={rowHeight ?? 32}
                    autosizeOptions={autoSizeOption}
                    loading={loading}
                    slots={{
                        noResultsOverlay: CustomNoResultsOverlay,
                        noRowsOverlay: CustomNoRowsOverlay,
                        toolbar: CustomToolbar,
                        pagination: CustomPagination,
                        columnMenu: CustomColumnMenu,
                        loadingOverlay: CustomLoadingOverlay,
                    }}
                    slotProps={{
                        toolbar: { sx: { zoom: 1 / zoom }, zoom, setZoom, exportFileName: columnNameText } as any,
                        footer: { sx: { zoom: 1 / zoom } },
                        loadingOverlay: { variant: 'circular-progress', noRowsVariant: 'circular-progress', whatIsLoading: 'Metadatas' } as any,
                        columnsManagement: { toggleAllMode: 'filteredOnly' },
                    }}
                    initialState={{
                        pagination: { paginationModel: { pageSize: -1 } },
                    }}
                    sx={(theme) => (
                        {
                            height: fullHeight ? "100%" : (typeof gridHeight === 'string' && gridHeight.endsWith('%') ? gridHeight : `calc(${gridHeight} / ${zoom})`),
                            zoom: zoom,
                            ...(autoRowHeight ? {
                                '&.MuiDataGrid-root--densityCompact .MuiDataGrid-cell': {
                                    py: 1,
                                },
                                '&.MuiDataGrid-root--densityStandard .MuiDataGrid-cell': {
                                    py: '15px',
                                },
                                '&.MuiDataGrid-root--densityComfortable .MuiDataGrid-cell': {
                                    py: '22px',
                                },
                            } : {}),

                            border: 0,
                            color: 'rgba(255,255,255,0.85)',
                            fontFamily: [
                                '-apple-system',
                                'BlinkMacSystemFont',
                                '"Segoe UI"',
                                'Roboto',
                                '"Helvetica Neue"',
                                'Arial',
                                'sans-serif',
                                '"Apple Color Emoji"',
                                '"Segoe UI Emoji"',
                                '"Segoe UI Symbol"',
                            ].join(','),
                            WebkitFontSmoothing: 'auto',
                            letterSpacing: 'normal',
                            '& .MuiDataGrid-columnsContainer': {
                                backgroundColor: '#1d1d1d',
                                ...theme.applyStyles('light', {
                                    backgroundColor: '#fafafa',
                                }),
                            },
                            '& .MuiDataGrid-iconSeparator': {
                                transform: 'scaleY(2)'
                            },
                            '& .MuiDataGrid-columnHeader, .MuiDataGrid-cell': {
                                borderRight: '1px solid #303030',
                                ...theme.applyStyles('light', {
                                    borderRightColor: '#f0f0f0',
                                }),
                            },
                            '& .MuiDataGrid-columnsContainer, .MuiDataGrid-cell': {
                                borderBottom: '1px solid #303030',
                                ...theme.applyStyles('light', {
                                    borderBottomColor: '#f0f0f0',
                                }),
                            },
                            '& .MuiDataGrid-cell': {
                                color: 'rgba(255,255,255,0.65)',
                                ...theme.applyStyles('light', {
                                    color: 'rgba(0,0,0,.85)',
                                }),
                            },
                            '& .MuiPaginationItem-root': {
                                borderRadius: 0,
                            },
                            ...theme.applyStyles('light', {
                                color: 'rgba(0,0,0,.85)',
                            }),
                        }
                    )}
                    pageSizeOptions={[{ value: -1, label: 'All' }]}
                    columnVisibilityModel={columnVisibilityModel}
                    onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
                    getRowHeight={autoRowHeight ? (() => 'auto') : props.getRowHeight}
                    getEstimatedRowHeight={autoRowHeight ? (() => 100) : props.getEstimatedRowHeight}

                    onRowSelectionModelChange={(newRowSelectionModel) => {
                        setRowSelectionModel(newRowSelectionModel);
                    }}
                    rowSelectionModel={rowSelectionModel}

                    {...gridProps}
                />
            </Paper>
        </Box>
    );
}

function ObjectListGrid(props: ObjectListGridProps & ObjectListDataGridProps) {
    const [openedGridId, setOpenedGridId] = useState('');

    return (
        <GridButtonsContext.Provider value={{ openedGridId, openGrid: setOpenedGridId }}>
            <InnerObjectListGrid {...props} />
        </GridButtonsContext.Provider>
    );
}

export default ObjectListGrid;
