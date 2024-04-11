
import { Box, Button, ButtonGroup, CircularProgress, createTheme, List, ListItem, ListSubheader, Paper, Stack, Table, TableBody, TableCell, TableCellBaseProps, TableContainer, TableHead, TableRow, ThemeProvider, Tooltip, Typography } from '@mui/material';
import React, { forwardRef, useEffect, useMemo, useRef, useState, } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../../utils/global/.processClass';


import FilterInput from '../../utils/components/FilterInput';
import { useCurrentRecord } from '../../utils/hooks/use/useCurrentRecord';
import StyleIcon from '@mui/icons-material/Style';
import { MSType } from '../../utils/types/requestsType';
import { PickListOption, RetrievePicklistValues } from '../../utils/hooks/XrmApi/RetrievePicklistValues';
import { TableCellProps } from '@material-ui/core';
import { useCopyToClipboard } from 'usehooks-ts';
import LightTooltip from '../../utils/components/LightTooltip';

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

        const { entityName = '', isEntityRecord, recordId, forceRefresh } = useCurrentRecord();


        const [filter, setFilter] = useState<string>('');

        const [pickList, isFetchingPickList] = RetrievePicklistValues(entityName, MSType.Picklist);
        const [multiPickList, isFetchingMultiPickList] = RetrievePicklistValues(entityName, MSType.MultiSelectPicklist);
        const [stateList, isFetchingStateList] = RetrievePicklistValues(entityName, MSType.State);
        const [statusList, isFetchingStatusList] = RetrievePicklistValues(entityName, MSType.Status);

        const isFetching = useMemo(() => isFetchingPickList || isFetchingMultiPickList || isFetchingStateList || isFetchingStatusList, [isFetchingPickList, isFetchingMultiPickList, isFetchingStateList, isFetchingStatusList]);

        const [optionSetTable, setOptionSetTable] = useState<OptionSetTables>({});

        useEffect(() => {
            const allFieldOptions = { ...pickList, ...multiPickList, ...stateList, ...statusList, };
            const optionSetTable = Object.entries(allFieldOptions).reduce<OptionSetTables>((previousValue: OptionSetTables, [currentLogicalName, currentOptions], currentIndex, array) => {
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


        return (
            <ThemeProvider theme={theme}>
                <Stack spacing={4} width='calc(100% - 10px)' height='calc(100% - 10px)' padding='10px' alignItems='center'>
                    <List
                        sx={{ width: '100%', bgcolor: 'background.paper', overflowY: 'auto' }}
                        component="nav"
                        subheader={
                            <ListSubheader component="div">
                                <ButtonGroup variant="contained" fullWidth size='small'>
                                    <Button onClick={forceRefresh}>Refresh</Button>
                                </ButtonGroup>
                                <FilterInput fullWidth placeholder='Search by name or columns' defaultValue={filter} returnFilterInput={setFilter} />
                            </ListSubheader>
                        }
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
                                        metadata.DisplayName.toLowerCase().includes(lowerFilter) ||
                                        metadata.Fields.join('||').toLowerCase().includes(lowerFilter)
                                    ) {
                                        return (<OptionSetTable logicalName={pickListLogicalName} metadata={metadata} />);
                                    }
                                })
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

    const [tablecopied, setTablecopied] = useState(false);

    const tooltip = useMemo(() => <>
        <Typography><b>DisplayName:</b> {metadata.DisplayName}</Typography>
        <Typography><b>OptionSetType:</b> {metadata.OptionSetType}</Typography>
        <Typography><b>IsCustomOptionSet:</b> {String(metadata.IsCustomOptionSet)}</Typography>
    </>, [metadata]);

    const copyFn = () => {
        if (!tableRef.current) return;

        // const titleHTMLString = titleRef.current.outerHTML;
        // const titleTextString = titleRef.current.innerText;

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

        setTablecopied(true);
        setTimeout(() => {
            setTablecopied(false);
        }, 1500);
    }

    return (
        <ListItem>
            <TableContainer key={`tableContainer${logicalName}`} component={Paper}>
                <Stack direction='row' justifyContent='space-between' alignContent='space-between' ml={1} mr={1} mt={0.5}>
                    <Stack direction='row' spacing={1} maxWidth='75%'>
                        <Tooltip title={tooltip} placement='left'>
                            <Typography variant="h6" overflow='hidden' textOverflow='ellipsis' noWrap>
                                {metadata.DisplayName}
                            </Typography>
                        </Tooltip>
                        {
                            metadata.IsGlobal &&
                            <Typography variant="caption" color={(theme) => theme.palette.grey[600]}>
                                (Global)
                            </Typography>
                        }
                    </Stack>
                    <Button variant='outlined' size='small' onClick={copyFn}>
                        {tablecopied ? "Copied!" : "Copy"}
                    </Button>
                </Stack>
                <Table key={`table_${logicalName}`} ref={tableRef} size='small'>

                    <TableHead>
                        <TableRow sx={{ display: 'none' }}>
                            <TableCell colSpan={100}>
                                <Typography variant="h6" overflow='hidden' textOverflow='ellipsis' noWrap>
                                    <b>{metadata.DisplayName}</b>
                                </Typography>
                                {
                                    metadata.IsGlobal &&
                                    <Typography variant="caption" color={(theme) => theme.palette.grey[600]}>
                                        (Global)
                                    </Typography>
                                }
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell colSpan={100}>
                                Columns involved: <b>{metadata.Fields.join(', ')}</b>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><b>Name</b></TableCell>
                            {metadata.Options.some(o => o.State !== undefined && o.State !== null) && <TableCell align='right'><b>State</b></TableCell>}
                            {metadata.Options.some(o => o.ParentValues && o.ParentValues.length > 0) && <TableCell align='right'><b>ParentValues</b></TableCell>}
                            <TableCell align='right'><b>Value</b></TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {
                            metadata.Options.map(option => {
                                return (
                                    <Tooltip
                                        title={
                                            (option.Color || option.Description.UserLocalizedLabel?.Label || option.ExternalValue) && <>
                                                {option.Color && <Typography display='flex' alignItems='center' gap={0.5}><b>Color:</b> <Box component='div' display='inline-block' bgcolor={option.Color} width={13} height={13} border='1px solid #EEEEEE'></Box> {option.Color}</Typography>}
                                                {option.Description.UserLocalizedLabel?.Label && <Typography><b>Description:</b> {option.Description.UserLocalizedLabel?.Label}</Typography>}
                                                {option.ExternalValue && <Typography><b>ExternalValue:</b> {option.ExternalValue}</Typography>}
                                            </>
                                        }
                                        placement='left'
                                    >
                                        <TableRow>
                                            <CopyTableCell copyText={option.Label.UserLocalizedLabel?.Label ?? ''}>{option.Label.UserLocalizedLabel?.Label}</CopyTableCell>
                                            {option.State !== undefined && option.State !== null && <CopyTableCell align='right' copyText={String(option.State)}>{option.State}</CopyTableCell>}
                                            {option.ParentValues && option.ParentValues.length > 0 && <CopyTableCell align='right' copyText={JSON.stringify(option.ParentValues)}>{JSON.stringify(option.ParentValues)}</CopyTableCell>}
                                            <CopyTableCell align='right' copyText={String(option.Value)}>{option.Value}</CopyTableCell>
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