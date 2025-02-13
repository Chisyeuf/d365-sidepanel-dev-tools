import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import createTheme from '@mui/material/styles/createTheme';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../../utils/global/.processClass';

import FilterInput from '../../utils/components/FilterInput';
import { useCurrentRecord } from '../../utils/hooks/use/useCurrentRecord';
import StyleIcon from '@mui/icons-material/Style';
import { MSType } from '../../utils/types/requestsType';
import { PickListOption, RetrievePicklistValues } from '../../utils/hooks/XrmApi/RetrievePicklistValues';
import { TableCellProps } from '@material-ui/core';
import { useCopyToClipboard } from 'usehooks-ts';
import LightTooltip from '../../utils/components/LightTooltip';
import EntitySelector from '../../utils/components/EntitySelector';
import MuiVirtuoso from '../../utils/components/MuiVirtuoso';

class OptionSetTableButton extends ProcessButton {
    constructor() {
        super(
            'optionsettable',
            'Option Set Tables',
            <StyleIcon />,
            400
        );
        this.process = OptionSetTableProcess;
    }
}

declare module '@mui/material/Divider' {
    interface DividerPropsVariantOverrides {
        bold: true;
    }
}

let theme = createTheme({});

theme = createTheme(theme, {
    components: {
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    '& hr': {
                        mx: 1,
                    },
                }
            }
        },
        MuiListItemText: {
            styleOverrides: {
                root: {
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                },
                primary: {
                    display: "inline-block",

                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    width: 'fit-content',
                }
            }
        },
        MuiDivider: {
            variants: [
                {
                    props: { variant: 'bold' },
                    style: {
                        backgroundColor: theme.palette.divider,
                        border: "none",
                        height: 2,
                        margin: 0,
                    }
                }
            ]
        }
    }
});


const TABLE_CLASS = "spdt_optionsettable";

type OptionSetMetadata = {
    Options: PickListOption[],
    Fields: string[],
    DisplayName: string,
    IsGlobal: boolean,
    IsCustomOptionSet: boolean,
    OptionSetType: string,
}
type OptionSetTables = {
    [key: string]: OptionSetMetadata
}

const OptionSetTableProcess = forwardRef<ProcessRef, ProcessProps>(
    function OptionSetTableProcess(props: ProcessProps, ref) {

        const listRef = useRef<HTMLUListElement | null>(null);

        const { entityName: currentEntityName, forceRefresh } = useCurrentRecord();
        const [entityName, setEntityName] = useState<string>(currentEntityName ?? '');

        useEffect(() => {
            if (currentEntityName)
                setEntityName(currentEntityName);
        }, [currentEntityName]);

        const [filter, setFilter] = useState<string>('');

        const [pickList, isFetchingPickList] = RetrievePicklistValues(entityName, MSType.Picklist);
        const [multiPickList, isFetchingMultiPickList] = RetrievePicklistValues(entityName, MSType.MultiSelectPicklist);
        const [stateList, isFetchingStateList] = RetrievePicklistValues(entityName, MSType.State);
        const [statusList, isFetchingStatusList] = RetrievePicklistValues(entityName, MSType.Status);

        const isFetching = useMemo(() => isFetchingPickList || isFetchingMultiPickList || isFetchingStateList || isFetchingStatusList, [isFetchingPickList, isFetchingMultiPickList, isFetchingStateList, isFetchingStatusList]);

        const [optionSetTable, setOptionSetTable] = useState<OptionSetTables>({});

        useEffect(() => {
            const allFieldOptions = { ...stateList, ...statusList, ...pickList, ...multiPickList, };
            const optionSetTable = Object.entries(allFieldOptions).reduce<OptionSetTables>((previousValue: OptionSetTables, [currentLogicalName, currentOptions]) => {
                return {
                    ...previousValue,
                    [currentOptions.Name]: {
                        Options: currentOptions.Options,
                        Fields: [...(previousValue[currentOptions.Name]?.Fields ?? []), currentLogicalName],
                        DisplayName: currentOptions.DisplayName.UserLocalizedLabel?.Label ?? currentOptions.Name,
                        IsGlobal: currentOptions.IsGlobal,
                        IsCustomOptionSet: currentOptions.IsCustomOptionSet,
                        OptionSetType: currentOptions.OptionSetType
                    }
                }
            }, {});
            setOptionSetTable(optionSetTable);
        }, [pickList, multiPickList, stateList, statusList]);

        const [tablesCopied, setTablesCopied] = useState(false);

        const copyAll = useCallback(() => {
            const tableElements = Array.from(listRef.current?.querySelectorAll<HTMLTableElement>(`.${TABLE_CLASS}`) ?? []);

            navigator.clipboard.write([
                new ClipboardItem({
                    'text/html': new Blob(tableElements.flatMap((tableElement) => [tableElement.outerHTML, "<p></p>"]), {
                        type: 'text/html',
                    }),
                    'text/plain': new Blob(tableElements.flatMap((tableElement) => [tableElement.innerText, '\r\n']), {
                        type: 'text/plain',
                    }),
                }),
            ]);

            setTablesCopied(true);
            setTimeout(() => {
                setTablesCopied(false);
            }, 1200);
        }, []);


        return (
            <ThemeProvider theme={theme}>
                <Stack spacing={1} height='calc(100% - 10px)' padding='10px' pr={0} pt={0} alignItems='center'>

                    <Stack direction='column' width='95%' spacing={0.5}>
                        <Stack direction='row' spacing={1} mt={1} mb={1} alignItems='center'>
                            <EntitySelector fullWidth entityname={entityName} setEntityname={setEntityName} sx={{ lineHeight: 0 }} />
                            <Button variant='contained' onClick={forceRefresh} sx={{ whiteSpace: 'nowrap', width: '25%' }}>Refresh</Button>
                        </Stack>
                        <Stack direction='row' spacing={1} mt={1} mb={1} alignItems='center'>
                            <FilterInput fullWidth placeholder='Search by name or columns' defaultValue={filter} returnFilterInput={setFilter} />
                            <Button variant='outlined' onClick={copyAll} sx={{ whiteSpace: 'nowrap', width: '25%' }}>{tablesCopied ? "Copied!" : "Copy All"}</Button>
                        </Stack>
                    </Stack>

                    <List
                        ref={listRef}
                        sx={{ height: '100%', width: '100%', bgcolor: 'background.paper', overflowY: 'auto' }}
                    >
                        {
                            isFetching ?
                                <Stack width='100%' height='50vh' justifyContent='center' alignItems='center'>
                                    <CircularProgress sx={{ zoom: '2' }} />
                                </Stack>
                                :
                                Object.entries(optionSetTable).map(([pickListLogicalName, metadata]) => {
                                    const lowerFilter = filter.toLowerCase();
                                    if (
                                        pickListLogicalName.toLowerCase().includes(lowerFilter) ||
                                        metadata.DisplayName?.toLowerCase().includes(lowerFilter) ||
                                        metadata.Fields?.join('||').toLowerCase().includes(lowerFilter)
                                    ) {
                                        return (<OptionSetTable logicalName={pickListLogicalName} metadata={metadata} />);
                                    }
                                    return null;
                                })
                            // <MuiVirtuoso
                            //     data={Object.entries(optionSetTable)}
                            //     itemContent={(index, [pickListLogicalName, metadata]) => {
                            //         const lowerFilter = filter.toLowerCase();
                            //         if (
                            //             pickListLogicalName.toLowerCase().includes(lowerFilter) ||
                            //             metadata.DisplayName.toLowerCase().includes(lowerFilter) ||
                            //             metadata.Fields.join('||').toLowerCase().includes(lowerFilter)
                            //         ) {
                            //             return (<OptionSetTable logicalName={pickListLogicalName} metadata={metadata} />);
                            //         }
                            //     }}
                            // />
                        }
                    </List>

                </Stack>
            </ThemeProvider>
        );
    }
);

interface OptionSetTableProps {
    logicalName: string
    metadata: OptionSetMetadata
}
function OptionSetTable(props: OptionSetTableProps) {
    const { logicalName, metadata } = props;

    const tableRef = useRef<HTMLTableElement | null>(null);

    const tooltip = useMemo(() => <>
        <Typography><b>DisplayName:</b> {metadata.DisplayName}</Typography>
        <Typography><b>OptionSetType:</b> {metadata.OptionSetType}</Typography>
        <Typography><b>IsCustomOptionSet:</b> {String(metadata.IsCustomOptionSet)}</Typography>
    </>, [metadata]);

    const [tableCopied, setTableCopied] = useState(false);

    const copyFn = () => {
        if (!tableRef.current) return;

        const tableHTMLString = tableRef.current.outerHTML;
        const tableTextString = tableRef.current.innerText;

        navigator.clipboard.write([
            new ClipboardItem({
                'text/html': new Blob([tableHTMLString], {
                    type: 'text/html',
                }),
                'text/plain': new Blob([tableTextString], {
                    type: 'text/plain',
                }),
            }),
        ]);

        setTableCopied(true);
        setTimeout(() => {
            setTableCopied(false);
        }, 1200);
    }

    const isExistingStateColumn = useMemo(() => metadata.Options.some(o => o.State !== undefined && o.State !== null), [metadata.Options]);
    const isExistingDefaultStatusColumn = useMemo(() => metadata.Options.some(o => o.DefaultStatus !== undefined && o.DefaultStatus !== null), [metadata.Options]);
    const isExistingParentValuesColumn = useMemo(() => metadata.Options.some(o => o.ParentValues && o.ParentValues.length > 0), [metadata.Options]);


    return (
        <ListItem>
            <TableContainer key={`tableContainer${logicalName}`} component={Paper} elevation={3}>
                <Stack direction='column' alignItems='center'>

                    <Stack direction='row' justifyContent='space-between' alignContent='space-between' mt={0.5} width='95%'>
                        <Stack direction='row' spacing={1} maxWidth='75%'>
                            <Tooltip title={tooltip} placement='left' arrow>
                                <Typography variant="h6" overflow='hidden' textOverflow='ellipsis' noWrap>
                                    {metadata.DisplayName}
                                </Typography>
                            </Tooltip>
                            {
                                metadata.IsGlobal &&
                                <Typography variant="caption" color='grey.600'>
                                    (Global)
                                </Typography>
                            }
                        </Stack>
                        <Button variant='outlined' size='small' onClick={copyFn}>
                            {tableCopied ? "Copied!" : "Copy"}
                        </Button>
                    </Stack>

                    <Typography variant="caption" width='95%'>
                        Columns involved: <b>{metadata.Fields.join(', ')}</b>
                    </Typography>

                </Stack>
                <Table key={`table_${logicalName}`} className={TABLE_CLASS} ref={tableRef} size='small'>

                    <TableHead>
                        <TableRow sx={{ display: 'none' }}>
                            <TableCell>
                                <Typography>
                                    <b>{metadata.DisplayName}</b>
                                </Typography>
                            </TableCell>
                            {
                                metadata.IsGlobal &&
                                <TableCell>
                                    <Typography>
                                        (Global)
                                    </Typography>
                                </TableCell>
                            }
                            <TableCell>
                                <Typography>
                                    Columns involved: {metadata.Fields.join(', ')}
                                </Typography>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><b>Name</b></TableCell>
                            {isExistingStateColumn && <TableCell align='right'><b>State</b></TableCell>}
                            {isExistingDefaultStatusColumn && <TableCell align='right'><b>DefaultStatus</b></TableCell>}
                            {isExistingParentValuesColumn && <TableCell align='right'><b>ParentValues</b></TableCell>}
                            <TableCell align='right'><b>Value</b></TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {
                            metadata.Options.map(o => {
                                return (
                                    <Tooltip
                                        title={
                                            (o.Color || o.Description.UserLocalizedLabel?.Label || o.ExternalValue) && <>
                                                {o.Color && <Typography display='flex' alignItems='center' gap={0.5}><b>Color:</b> <Box component='div' display='inline-block' bgcolor={o.Color} width={13} height={13} border='1px solid #EEEEEE'></Box> {o.Color}</Typography>}
                                                {o.Description.UserLocalizedLabel?.Label && <Typography><b>Description:</b> {o.Description.UserLocalizedLabel?.Label}</Typography>}
                                                {o.ExternalValue && <Typography><b>ExternalValue:</b> {o.ExternalValue}</Typography>}
                                            </>
                                        }
                                        placement='left'
                                    >
                                        <TableRow>
                                            <CopyTableCell copyText={o.Label.UserLocalizedLabel?.Label ?? ''}>{o.Label.UserLocalizedLabel?.Label}</CopyTableCell>
                                            {isExistingStateColumn && <CopyTableCell align='right' copyText={String(o.State)}>{o.State}</CopyTableCell>}
                                            {isExistingDefaultStatusColumn && <CopyTableCell align='right' copyText={String(o.DefaultStatus)}>{o.DefaultStatus}</CopyTableCell>}
                                            {isExistingParentValuesColumn && <CopyTableCell align='right' copyText={JSON.stringify(o.ParentValues)}>{JSON.stringify(o.ParentValues)}</CopyTableCell>}
                                            <CopyTableCell align='right' copyText={String(o.Value)}>{o.Value}</CopyTableCell>
                                        </TableRow>
                                    </Tooltip>
                                )
                            })
                        }
                    </TableBody>



                </Table>
            </TableContainer>
        </ListItem>
    )
}

interface CopyTableCellProps {
    copyText: string
}
function CopyTableCell(props: CopyTableCellProps & TableCellProps) {
    const { copyText, ...tableCellProps } = props;

    const [clicked, setClicked] = useState<boolean>(false);

    const [, copyFn] = useCopyToClipboard();
    const copy = () => {
        copyFn(copyText);
        setClicked(true);
        setTimeout(() => {
            setClicked(false);
        }, 500);
    }

    return (
        <LightTooltip title='Copied!' open={clicked}>
            <TableCell
                align={tableCellProps.align}
                children={tableCellProps.children}
                onClick={copy}
                sx={(theme) => ({
                    cursor: 'pointer',
                    transition: 'color 200ms ease 0s',
                    color: clicked ? theme.palette.primary.light : 'inherit'
                })}
            />
        </LightTooltip>
    )
}

const optionSetTable = new OptionSetTableButton();
export default optionSetTable;