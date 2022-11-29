
import { MouseEvent, Dispatch, ReactNode, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ProcessButton, ProcessProps } from '../utils/global/.processClass'
import { Entity, AttributeMetadata, MSType, MSDateFormat, getReadableMSType } from '../utils/global/requestsType'
import { RetrieveEntities } from '../utils/hooks/XrmApi/RetrieveEntities'
import { RetrievePrimaryAttribute } from '../utils/hooks/XrmApi/RetrievePrimaryAttribute'
import { formatId, isArraysEquals } from '../utils/global/common'
import React from 'react'
import { RetrieveAttributesMetaData } from '../utils/hooks/XrmApi/RetrieveAttributesMetaData'
import { RetrieveAttributes } from '../utils/hooks/XrmApi/RetrieveAttributes'
import { RetrievePicklistValues } from '../utils/hooks/XrmApi/RetrievePicklistValues'
import SyncIcon from '@mui/icons-material/Sync';
import { useBoolean, useHover, useUpdateEffect } from 'usehooks-ts'
import { Stack, Autocomplete, Button, Checkbox, createTheme, Dialog, DialogContent, DialogTitle, Divider, FormControl, IconButton, InputAdornment, MenuItem, Select, SelectChangeEvent, TextField, Typography, ThemeProvider, Pagination, Skeleton, Tooltip, Chip, Box, Paper, ListItem, Container, createSvgIcon, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { DatePicker, DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers'
import dayjs, { Dayjs } from 'dayjs';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import SearchIcon from '@mui/icons-material/Search';
import { DataGrid, GridColDef, gridPageCountSelector, gridPageSelector, gridPageSizeSelector, gridPaginatedVisibleSortedGridRowIdsSelector, GridRowCount, gridRowCountSelector, GridSelectionModel, GridToolbar, GridValidRowModel, useGridApiContext, useGridSelector } from '@mui/x-data-grid';
import { DialogActions, LinearProgress } from '@material-ui/core'
import { RecordsDisplayNamesResponse, RetrieveRecordsDisplayNames } from '../utils/hooks/XrmApi/RetrieveRecordsDisplayNames';
import { RetrieveAllRecords } from '../utils/hooks/XrmApi/RetrieveAllRecords'
import ClearIcon from '@mui/icons-material/Clear';
import { NoMaxWidthTooltip } from '../utils/components/updateRecordComponents'
import ShortTextIcon from '@material-ui/icons/ShortText'
import NotesIcon from '@mui/icons-material/Notes';
import NumbersIcon from '@mui/icons-material/Numbers';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ListIcon from '@mui/icons-material/List';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import CheckBoxOutlineBlankOutlinedIcon from '@mui/icons-material/CheckBoxOutlineBlankOutlined';
import { DictValueType, useDictionnary } from '../utils/hooks/use/useDictionnary'
import NumericInput from '../utils/components/NumericInput'
import '../utils/global/extensions';
import CircularProgressOverflow from '../utils/components/CircularProgressOverflow'
import { loadavg } from 'os'
import { RetrieveSetName } from '../utils/hooks/XrmApi/RetrieveSetName'


class UpdateRecordButton extends ProcessButton {
    constructor() {
        super(
            'updaterecord',
            'Update Record',
            <SyncIcon />,
            500
        )
        this.process = UpdateRecordProcess
    }
}



// declare module '@mui/material/Checkbox' {
//     interface CheckboxPropsColorOverrides {
//         contrastChecked: true
//     }
// }
const defaultTheme = createTheme()
const theme = createTheme({
    components: {
        MuiStack: {
            variants: [
                {
                    props: { className: "disabled" },
                    style: {
                        backgroundColor: defaultTheme.palette.grey[200],
                    }
                }, {
                    props: { className: "dirty" },
                    style: {
                        backgroundColor: defaultTheme.palette.secondary.main
                    }
                },
                {
                    props: { className: "toupdate" },
                    style: {
                        backgroundColor: defaultTheme.palette.primary.dark
                    }
                },
            ]
        },
        MuiTypography: {
            variants: [
                {
                    props: { className: "disabled" },
                    style: {
                        color: defaultTheme.palette.text.disabled
                    }
                },
                {
                    props: { className: "dirty" },
                    style: {
                        color: defaultTheme.palette.secondary.contrastText
                    }
                },
                {
                    props: { className: "toupdate" },
                    style: {
                        color: defaultTheme.palette.primary.contrastText
                    }
                },
            ]
        },
        MuiInputBase: {
            styleOverrides: {
                root: {
                    backgroundColor: "white"
                }
            },
            variants: [
                {
                    props: { disabled: true },
                    style: {
                        backgroundColor: defaultTheme.palette.grey[100]
                    }
                }
            ]
        }
    }
})

const DecimalIcon = createSvgIcon(
    <path
        d="M10 7A3 3 0 0 0 7 10V13A3 3 0 0 0 13 13V10A3 3 0 0 0 10 7M11 13A1 1 0 0 1 9 13V10A1 1 0 0 1 11 10M17 7A3 3 0 0 0 14 10V13A3 3 0 0 0 20 13V10A3 3 0 0 0 17 7M18 13A1 1 0 0 1 16 13V10A1 1 0 0 1 18 10M6 15A1 1 0 1 1 5 14A1 1 0 0 1 6 15Z"
    />,
    'Decimal',
);

function UpdateRecordProcess(props: ProcessProps) {
    const [entityname, _setEntityname] = useState(Xrm.Page.data?.entity.getEntityName())
    const [recordsIds, setRecordsIds] = useState<string[]>(formatId(Xrm.Page.data?.entity.getId().toLowerCase()) ? [formatId(Xrm.Page.data?.entity.getId().toLowerCase())] : [])
    const [filterAttribute, setFilterAttribute] = useState("")
    const { dict: attributesValues, setValue: setAttributesValue, removeValue: removeAttributesValue } = useDictionnary({})
    const { value: resetTotal, toggle: toggleResetTotal } = useBoolean(false)

    const setEntityname = (entityname: string) => {
        setRecordsIds([])
        _setEntityname(entityname)
    }

    const setCurrentRecord = useCallback(() => {
        setEntityname(Xrm.Page.data?.entity.getEntityName())
        const recordid = formatId(Xrm.Page.data?.entity.getId().toLowerCase())
        setRecordsIds(recordid ? [recordid] : [])
    }, [])

    useUpdateEffect(() => {
        toggleResetTotal()
    }, [entityname, recordsIds])



    const launchUpdate = () => {
        console.log("Launch Update for " + entityname + " " + recordsIds + " on")
        console.log(attributesValues)
    }


    return (
        <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Stack spacing={"4px"} width="100%" padding="10px">
                    <NavTopBar
                        setEntityname={setEntityname}
                        setRecordsIds={setRecordsIds}
                        setCurrentRecord={setCurrentRecord}
                        launchUpdate={launchUpdate}
                        setFilterAttribute={setFilterAttribute}
                        entityname={entityname}
                        recordsIds={recordsIds} />
                    <Divider />
                    <AttributesList
                        entityname={entityname}
                        recordsIds={recordsIds}
                        filter={filterAttribute}
                        resetTotal={resetTotal}
                        attributeToUpdateManager={{ setAttributesValue, removeAttributesValue }}
                    />
                    <Divider />
                    {entityname + " / " + recordsIds}
                </Stack>
            </LocalizationProvider>
        </ThemeProvider>
    )
}

type AttributesListProps = {
    entityname: string,
    recordsIds: string[],
    filter: string,
    resetTotal: boolean,
    attributeToUpdateManager: { setAttributesValue: (key: string, value: DictValueType) => void, removeAttributesValue: (key: string) => void }
}
function AttributesList(props: AttributesListProps) {
    const entityname = props.entityname
    const recordid = props.recordsIds?.length == 1 ? props.recordsIds?.at(0) : undefined
    const filter = props.filter

    const [attributesMetadataRetrieved, fetchingMetadata] = RetrieveAttributesMetaData(entityname)
    const [attributesRetrieved, fetchingValues] = RetrieveAttributes(entityname, recordid, attributesMetadataRetrieved?.map((value) => {
        if (value.MStype !== MSType.Lookup) return value.LogicalName
        else return "_" + value.LogicalName + "_value"
    }) ?? [])

    return (<>{
        !fetchingMetadata
            ?

            <Stack spacing={"2px"} height="100%" sx={{ overflowY: 'scroll', overflowX: 'hidden' }} >
                {
                    !fetchingValues
                        ?
                        attributesMetadataRetrieved?.map((metadata) => {
                            const attributeName = metadata.MStype !== MSType.Lookup ? metadata.LogicalName : "_" + metadata.LogicalName + "_value"
                            return (
                                <AttributeNode
                                    disabled={!metadata.IsValidForUpdate}
                                    attribute={metadata}
                                    entityname={props.entityname}
                                    value={attributesRetrieved[attributeName]}
                                    filter={filter}
                                    resetTotal={props.resetTotal}
                                    attributeToUpdateManager={props.attributeToUpdateManager}
                                />
                            )
                        })
                        :
                        [...Array(15)].map(() => <Skeleton variant='rounded' height='46.625px' />)
                }
            </Stack>
            :
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress size={100} thickness={4.5} />
            </div>
    }
    </>)
}

type AttributeNodeProps = {
    attribute: AttributeMetadata,
    entityname: string,
    value: any,
    disabled: boolean,
    filter: string,
    resetTotal: boolean,
    attributeToUpdateManager: { setAttributesValue: (key: string, value: DictValueType) => void, removeAttributesValue: (key: string) => void }
}
type AttributeProps = {
    attribute: AttributeMetadata,
    entityname: string,
    value: any,
    setToUpdate: () => void,
    reset: boolean,
    manageDirty: { set: () => void, remove: () => void },
    disabled: boolean,
    attributeToUpdateManager: { setAttributesValue: (key: string, value: DictValueType) => void, removeAttributesValue: (key: string) => void, isToUpdate: boolean, valueChanged: boolean }
}
function AttributeNode(props: AttributeNodeProps) {
    const { value: isDirty, setTrue, setFalse } = useBoolean(false)
    const manageDirty = { setTrue, setFalse }

    const { value: valueChanged, toggle: triggerValueChange } = useBoolean(false)
    const { value: isToUpdate, setTrue: setToUpdate, setFalse: removeToUpdate } = useBoolean(false)
    const { value: toReset, setTrue: setToReset, setFalse: resetToReset } = useBoolean(false)
    const { value: loading, setTrue: isLoading, setFalse: doneLoading } = useBoolean(true)

    const tooltipText = useMemo(() =>
        <>
            <Typography variant="button"><strong>{props.attribute.DisplayName}</strong></Typography>
            <Typography variant="body2"><strong>LogicalName:</strong> {props.attribute.LogicalName}</Typography>
            <Typography variant="body2"><strong>Type:</strong> {getReadableMSType(props.attribute.MStype)}</Typography>
            {props.attribute.Parameters.Format && props.attribute.Parameters.Format != MSDateFormat.None && <Typography variant="body2"><strong>Format:</strong> {props.attribute.Parameters.Format}</Typography>}
            {(props.attribute.Parameters.MaxLength || props.attribute.Parameters.MaxLength === 0) && <Typography variant="body2"><strong>MaxLength:</strong> {props.attribute.Parameters.MaxLength}</Typography>}
            {(props.attribute.Parameters.MaxValue || props.attribute.Parameters.MaxValue === 0) && <Typography variant="body2"><strong>MaxValue:</strong> {props.attribute.Parameters.MaxValue}</Typography>}
            {(props.attribute.Parameters.MinValue || props.attribute.Parameters.MinValue === 0) && <Typography variant="body2"><strong>MinValue:</strong> {props.attribute.Parameters.MinValue}</Typography>}
            {(props.attribute.Parameters.Precision || props.attribute.Parameters.Precision === 0) && <Typography variant="body2"><strong>Precision:</strong> {props.attribute.Parameters.Precision}</Typography>}
            {props.attribute.Parameters.Target && <Typography variant="body2"><strong>Target:</strong> {props.attribute.Parameters.Target}</Typography>}
        </>
        , [props.attribute])

    const isVisible = useMemo(() => {
        return (props.attribute.DisplayName.indexOf(props.filter) !== -1 ||
            props.attribute.LogicalName.indexOf(props.filter) !== -1 ||
            props.attribute.SchemaName.indexOf(props.filter) !== -1)
    }, [props.filter, props.attribute])

    useEffect(() => {
        if (isToUpdate === false) {
            setToReset();
        }
    }, [isToUpdate, setToReset])
    useEffect(() => {
        if (toReset === true) {
            resetToReset()
        }
    }, [toReset, resetToReset])

    useUpdateEffect(() => {
        removeToUpdate()
    }, [props.resetTotal])

    useEffect(() => {
        if (props.value !== undefined)
            doneLoading()
    }, props.value)

    const NodeContent: JSX.Element =
        <Stack
            borderRadius={theme.shape.borderRadius + "px"}
            direction="row"
            width="100%"
            alignItems="center"
            spacing="2px"
            className={props.disabled ? "disabled" : (isDirty ? "dirty" : (isToUpdate ? "toupdate" : ""))}
            style={{ display: isVisible ? '' : 'none' }}
        >
            <NoMaxWidthTooltip title={tooltipText} arrow placement='left' disableFocusListener>
                <Stack
                    height='100%'
                    justifyContent='center'
                    width='80%'
                    overflow='hidden'
                    onDoubleClick={() => { navigator.clipboard.writeText(props.attribute.LogicalName); setToUpdate(); triggerValueChange() }}
                >
                    <Typography
                        key={props.attribute.LogicalName + "_label"}
                        title={props.attribute.DisplayName + "(" + props.attribute.LogicalName + ")"}
                        // width="80%"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                        overflow="hidden"
                        className={props.disabled ? "disabled" : (isDirty ? "dirty" : (isToUpdate ? "toupdate" : ""))}
                        paddingLeft='5px'
                    >
                        {props.attribute.DisplayName}
                    </Typography>
                </Stack>
            </NoMaxWidthTooltip>

            <AttributeFactory
                key={props.attribute.LogicalName}
                attribute={props.attribute}
                entityname={props.entityname}
                value={props.value}
                setToUpdate={() => { if (props.disabled) return; setToUpdate(); triggerValueChange(); }}
                manageDirty={{ set: manageDirty.setTrue, remove: manageDirty.setFalse }}
                reset={toReset}
                disabled={props.disabled}
                attributeToUpdateManager={{ ...props.attributeToUpdateManager, isToUpdate: isToUpdate, valueChanged: valueChanged }}
            />
            <IconButton aria-label="delete" onClick={removeToUpdate} style={{ visibility: isToUpdate ? "visible" : "hidden" }}>
                <DeleteIcon fontSize='large' htmlColor='ghostwhite' />
            </IconButton>
        </Stack >


    return NodeContent
    // <>{
    //     loading ?
    //         <Skeleton animation='wave' variant='rounded' width='100%'>
    //             {NodeContent}
    //         </Skeleton>
    //         :
    //         NodeContent
    // }</>

}

function AttributeFactory(props: AttributeProps) {

    switch (props.attribute.MStype) {
        case MSType.Lookup:
            return (<LookupNode
                attribute={props.attribute}
                entityname={props.entityname}
                value={props.value}
                setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
            />)
        case MSType.String:
            return (<StringNode
                attribute={props.attribute}
                entityname={props.entityname}
                value={props.value}
                setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
            />)
        case MSType.Memo:
            return (<MemoNode
                attribute={props.attribute}
                entityname={props.entityname}
                value={props.value}
                setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
            />)
        case MSType.Decimal:
            return (<DecimalNode
                attribute={props.attribute}
                entityname={props.entityname}
                value={props.value}
                setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
            />)
        case MSType.Double:
            return (<DoubleNode
                attribute={props.attribute}
                entityname={props.entityname}
                value={props.value}
                setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
            />)
        case MSType.Money:
            return (<MoneyNode
                attribute={props.attribute}
                entityname={props.entityname}
                value={props.value}
                setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
            />)
        case MSType.Integer:
            return (<IntegerNode
                attribute={props.attribute}
                entityname={props.entityname}
                value={props.value}
                setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
            />)
        case MSType.BigInt:
            return (<BigIntNode
                attribute={props.attribute}
                entityname={props.entityname}
                value={props.value}
                setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
            />)
        case MSType.Boolean:
            return (<BooleanNode
                attribute={props.attribute}
                entityname={props.entityname}
                value={props.value}
                setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
            />)
        case MSType.DateTime:
            return (<DateTimeNode
                attribute={props.attribute}
                entityname={props.entityname}
                value={props.value}
                setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
            />)
        case MSType.Status:
            return (<PicklistNode
                attribute={props.attribute}
                entityname={props.entityname}
                value={props.value}
                setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
            />)
        case MSType.State:
            return (<PicklistNode
                attribute={props.attribute}
                entityname={props.entityname}
                value={props.value}
                setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
            />)
        case MSType.Picklist:
            return (<PicklistNode
                nullable
                attribute={props.attribute}
                entityname={props.entityname}
                value={props.value}
                setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
            />)
        case MSType.MultiSelectPicklist:
            return (<MultiplePicklistNode
                attribute={props.attribute}
                entityname={props.entityname}
                value={props.value}
                setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
            />)
        case MSType.Image:
            return (<ImageNode
                attribute={props.attribute}
                entityname={props.entityname}
                value={props.value}
                setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
            />)
        default:
            return (<></>)
    }
}

function LookupNode(props: AttributeProps) {
    const [oldValue, setOldValue] = useState<string[]>(props.value ? [props.value] : [])
    const [value, setValue] = useState<string[]>(props.value ? [props.value] : [])
    const [updatingValue, setUpdatingValue] = useState<string[]>([])

    const pluralName = RetrieveSetName(props.entityname)

    useEffect(() => {
        if (props.attributeToUpdateManager.isToUpdate) {
            var val
            if (value.length)
                val = "/" + pluralName + "(" + value?.at(0) + ")"
            else
                val = null
            props.attributeToUpdateManager.setAttributesValue(props.attribute.LogicalName + "@odata.bind", val)
        }
        else {
            props.attributeToUpdateManager.removeAttributesValue(props.attribute.LogicalName + "@odata.bind")
        }
    }, [props.attributeToUpdateManager.isToUpdate, props.attributeToUpdateManager.valueChanged])


    const setDirty = (newValue: string[]) => {
        if (!isArraysEquals(oldValue, newValue)) {
            props.manageDirty.set()
        }
        else {
            props.manageDirty.remove()
        }
    }

    useEffect(() => {
        setOldValue(props.value ? [props.value] : [])
        setValue(props.value ? [props.value] : [])
        setUpdatingValue(props.value ? [props.value] : [])
    }, [props.value])

    useEffect(() => {
        if (props.reset) {
            setValue(oldValue)
            setUpdatingValue(oldValue)
            props.manageDirty.remove()
        }
    }, [oldValue, props.manageDirty, props.reset])

    useUpdateEffect(() => {
        if (isArraysEquals(value, updatingValue)) return;
        props.setToUpdate()
        setValue(updatingValue ? updatingValue : [])
        setDirty(updatingValue ? updatingValue : [])
    }, [updatingValue])


    return <RecordSelector
        entityname={props.attribute.Parameters.Target}
        recordsIds={value}
        setRecordsIds={setUpdatingValue}
        disabled={props.disabled}
    />
}
function StringNode(props: AttributeProps) {
    const [oldValue, setOldValue] = useState<string | null>(props.value ? props.value : null)
    const [value, setValue] = useState<string | null>(props.value ? props.value : null)

    useEffect(() => {
        if (props.attributeToUpdateManager.isToUpdate) {
            props.attributeToUpdateManager.setAttributesValue(props.attribute.LogicalName, value)
        }
        else {
            props.attributeToUpdateManager.removeAttributesValue(props.attribute.LogicalName)
        }
    }, [props.attributeToUpdateManager.isToUpdate, props.attributeToUpdateManager.valueChanged])

    const setDirty = (newValue: string | null) => {
        if (oldValue !== newValue) {
            props.manageDirty.set()
        }
        else {
            props.manageDirty.remove()
        }
    }

    useEffect(() => {
        setOldValue(props.value ? props.value : null)
        setValue(props.value ? props.value : null)
    }, [props.value])

    useEffect(() => {
        if (props.reset) {
            setValue(oldValue)
            props.manageDirty.remove()
        }
    }, [oldValue, props.manageDirty, props.reset])

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = event.target.value
        props.setToUpdate()
        setValue(newValue ? newValue : null)
        setDirty(newValue ? newValue : null)
    }

    return (<TextField
        placeholder='Enter a string'
        size={"small"}
        fullWidth
        inputProps={{ maxLength: props.attribute.Parameters.MaxLength }}
        value={value ?? ''}
        onFocus={props.setToUpdate}
        onChange={onChange}
        disabled={props.disabled}
        InputProps={{
            startAdornment: (
                <InputAdornment position="start">
                    <ShortTextIcon />
                </InputAdornment>
            )
        }}
    />)
}
function MemoNode(props: AttributeProps) {
    const [oldValue, setOldValue] = useState<string | null>(props.value ? props.value : null)
    const [value, setValue] = useState<string | null>(props.value ? props.value : null)

    useEffect(() => {
        if (props.attributeToUpdateManager.isToUpdate) {
            props.attributeToUpdateManager.setAttributesValue(props.attribute.LogicalName, value)
        }
        else {
            props.attributeToUpdateManager.removeAttributesValue(props.attribute.LogicalName)
        }
    }, [props.attributeToUpdateManager.isToUpdate, props.attributeToUpdateManager.valueChanged])

    const setDirty = (newValue?: string | null) => {
        if (oldValue !== newValue) {
            props.manageDirty.set()
        }
        else {
            props.manageDirty.remove()
        }
    }

    useEffect(() => {
        setOldValue(props.value ? props.value : null)
        setValue(props.value ? props.value : null)
    }, [props.value])

    useEffect(() => {
        if (props.reset) {
            setValue(oldValue)
            props.manageDirty.remove()
        }
    }, [oldValue, props.manageDirty, props.reset])

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = event.target.value
        props.setToUpdate()
        setValue(newValue ? newValue : null)
        setDirty(newValue ? newValue : null)
    }


    return (<TextField
        placeholder='Enter a multipleline string'
        size={"small"}
        fullWidth
        multiline
        rows={1}
        inputProps={{ maxLength: props.attribute.Parameters.MaxLength }}
        value={value ?? ''}
        onFocus={props.setToUpdate}
        onChange={onChange}
        disabled={props.disabled}
        InputProps={{
            startAdornment: (
                <InputAdornment position="start">
                    <NotesIcon />
                </InputAdornment>
            )
        }}
    />)
}
function DecimalNode(props: AttributeProps) {
    const [oldValue, setOldValue] = useState<number | null>(props.value ? Number(props.value) : null);
    const [value, setValue] = useState<number | null>(props.value ? Number(props.value) : null)

    useEffect(() => {
        if (props.attributeToUpdateManager.isToUpdate) {
            props.attributeToUpdateManager.setAttributesValue(props.attribute.LogicalName, value)
        }
        else {
            props.attributeToUpdateManager.removeAttributesValue(props.attribute.LogicalName)
        }
    }, [props.attributeToUpdateManager.isToUpdate, props.attributeToUpdateManager.valueChanged])

    const setDirty = (newValue?: number | null) => {
        if (oldValue !== newValue) {
            props.manageDirty.set()
        }
        else {
            props.manageDirty.remove()
        }
    }

    useEffect(() => {
        setOldValue(props.value ? Number(props.value) : null)
        setValue(props.value ? Number(props.value) : null)
    }, [props.value])

    useEffect(() => {
        if (props.reset) {
            setValue(oldValue)
            props.manageDirty.remove()
        }
    }, [oldValue, props.manageDirty, props.reset])

    const onChange = (newValue: number | null) => {
        props.setToUpdate()
        setValue(newValue)
        setDirty(newValue)
    }

    return (<NumericInput
        fullWidth
        placeholder={"Decimal by " + props.attribute.Parameters.Precision}
        value={value}
        onFocus={props.setToUpdate}
        onChange={onChange}
        variant='outlined'
        size='small'
        disabled={props.disabled}
        InputProps={{
            startAdornment: (
                <InputAdornment position="start">
                    <DecimalIcon />
                </InputAdornment>
            )
        }}
        numericOptions={{
            allowDecimalPadding: 'floats',
            decimalCharacter: '.',
            decimalPlaces: props.attribute.Parameters.Precision,
            decimalPlacesRawValue: props.attribute.Parameters.Precision,
            digitGroupSeparator: ',',
            modifyValueOnWheel: false,
            readOnly: props.disabled,
            minimumValue: props.attribute.Parameters.MinValue.noExponents(),
            maximumValue: props.attribute.Parameters.MaxValue.noExponents(),
            selectOnFocus: false,
            onInvalidPaste: 'clamp',
        }}
    />)
}
function DoubleNode(props: AttributeProps) {
    const [oldValue, setOldValue] = useState<number | null>(props.value ? Number(props.value) : null);
    const [value, setValue] = useState<number | null>(props.value ? Number(props.value) : null)

    useEffect(() => {
        if (props.attributeToUpdateManager.isToUpdate) {
            props.attributeToUpdateManager.setAttributesValue(props.attribute.LogicalName, value)
        }
        else {
            props.attributeToUpdateManager.removeAttributesValue(props.attribute.LogicalName)
        }
    }, [props.attributeToUpdateManager.isToUpdate, props.attributeToUpdateManager.valueChanged])

    const setDirty = (newValue?: number | null) => {
        if (oldValue !== newValue) {
            props.manageDirty.set()
        }
        else {
            props.manageDirty.remove()
        }
    }

    useEffect(() => {
        setOldValue(props.value ? Number(props.value) : null)
        setValue(props.value ? Number(props.value) : null)
    }, [props.value])

    useEffect(() => {
        if (props.reset) {
            setValue(oldValue)
            props.manageDirty.remove()
        }
    }, [oldValue, props.manageDirty, props.reset])

    const onChange = (newValue: number | null) => {
        props.setToUpdate()
        setValue(newValue)
        setDirty(newValue)
    }

    return (<NumericInput
        fullWidth
        placeholder={"Double by " + props.attribute.Parameters.Precision}
        value={value}
        onFocus={props.setToUpdate}
        onChange={onChange}
        variant='outlined'
        size='small'
        disabled={props.disabled}
        InputProps={{
            startAdornment: (
                <InputAdornment position="start">
                    <DecimalIcon />
                </InputAdornment>
            )
        }}
        numericOptions={{
            allowDecimalPadding: 'floats',
            decimalCharacter: '.',
            decimalPlaces: props.attribute.Parameters.Precision,
            decimalPlacesRawValue: props.attribute.Parameters.Precision,
            digitGroupSeparator: ',',
            modifyValueOnWheel: false,
            readOnly: props.disabled,
            minimumValue: props.attribute.Parameters.MinValue.noExponents(),
            maximumValue: props.attribute.Parameters.MaxValue.noExponents(),
            selectOnFocus: false,
            onInvalidPaste: 'clamp',
        }}
    />)
}
function MoneyNode(props: AttributeProps) {
    const [oldValue, setOldValue] = useState<number | null>(props.value ? props.value : null);
    const [value, setValue] = useState<number | null>(props.value ? props.value : null)

    useEffect(() => {
        if (props.attributeToUpdateManager.isToUpdate) {
            props.attributeToUpdateManager.setAttributesValue(props.attribute.LogicalName, value)
        }
        else {
            props.attributeToUpdateManager.removeAttributesValue(props.attribute.LogicalName)
        }
    }, [props.attributeToUpdateManager.isToUpdate, props.attributeToUpdateManager.valueChanged])

    const setDirty = (newValue?: number | null) => {
        if (oldValue !== newValue) {
            props.manageDirty.set()
        }
        else {
            props.manageDirty.remove()
        }
    }

    useEffect(() => {
        setOldValue(props.value ? props.value : null)
        setValue(props.value ? props.value : null)
    }, [props.value])

    useEffect(() => {
        if (props.reset) {
            setValue(oldValue)
            props.manageDirty.remove()
        }
    }, [oldValue, props.manageDirty, props.reset])

    const onChange = (newValue: number | null) => {
        props.setToUpdate()
        setValue(newValue)
        setDirty(newValue)
    }

    return (
        <NumericInput
            fullWidth
            placeholder={"Money by " + props.attribute.Parameters.Precision}
            value={value}
            onFocus={props.setToUpdate}
            onChange={onChange}
            variant='outlined'
            size='small'
            disabled={props.disabled}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <AttachMoneyIcon />
                    </InputAdornment>
                )
            }}
            numericOptions={{
                allowDecimalPadding: 'floats',
                decimalCharacter: '.',
                decimalPlaces: props.attribute.Parameters.Precision,
                decimalPlacesRawValue: props.attribute.Parameters.Precision,
                digitGroupSeparator: ',',
                modifyValueOnWheel: false,
                readOnly: props.disabled,
                minimumValue: props.attribute.Parameters.MinValue.noExponents(),
                maximumValue: props.attribute.Parameters.MaxValue.noExponents(),
                selectOnFocus: false,
                onInvalidPaste: 'clamp',
            }}
        />
    )
}
function IntegerNode(props: AttributeProps) {
    const [oldValue, setOldValue] = useState<number | null>(props.value ? Number(props.value) : null);
    const [value, setValue] = useState<number | null>(props.value ? Number(props.value) : null)

    useEffect(() => {
        if (props.attributeToUpdateManager.isToUpdate) {
            props.attributeToUpdateManager.setAttributesValue(props.attribute.LogicalName, value)
        }
        else {
            props.attributeToUpdateManager.removeAttributesValue(props.attribute.LogicalName)
        }
    }, [props.attributeToUpdateManager.isToUpdate, props.attributeToUpdateManager.valueChanged])

    const setDirty = (newValue?: number | null) => {
        if (oldValue !== newValue) {
            props.manageDirty.set()
        }
        else {
            props.manageDirty.remove()
        }
    }

    useEffect(() => {
        setOldValue(props.value ? Number(props.value) : null)
        setValue(props.value ? Number(props.value) : null)
    }, [props.value])

    useEffect(() => {
        if (props.reset) {
            setValue(oldValue)
            props.manageDirty.remove()
        }
    }, [oldValue, props.manageDirty, props.reset])

    const onChange = (newValue: number | null) => {
        props.setToUpdate()
        setValue(newValue)
        setDirty(newValue)
    }

    return (<NumericInput
        fullWidth
        placeholder={"Integer"}
        value={value}
        onFocus={props.setToUpdate}
        onChange={onChange}
        variant='outlined'
        size='small'
        disabled={props.disabled}
        InputProps={{
            startAdornment: (
                <InputAdornment position="start">
                    <NumbersIcon />
                </InputAdornment>
            )
        }}
        numericOptions={{
            decimalCharacter: '.',
            decimalPlaces: 0,
            decimalPlacesRawValue: 0,
            digitGroupSeparator: ',',
            modifyValueOnWheel: false,
            readOnly: props.disabled,
            minimumValue: props.attribute.Parameters.MinValue.noExponents(),
            maximumValue: props.attribute.Parameters.MaxValue.noExponents(),
            selectOnFocus: false,
            onInvalidPaste: 'clamp',
        }}
    />)
}
function BigIntNode(props: AttributeProps) {
    const [oldValue, setOldValue] = useState<number | null>(props.value ? Number(props.value) : null)
    const [value, setValue] = useState<number | null>(props.value ? Number(props.value) : null)

    useEffect(() => {
        if (props.attributeToUpdateManager.isToUpdate) {
            props.attributeToUpdateManager.setAttributesValue(props.attribute.LogicalName, value)
        }
        else {
            props.attributeToUpdateManager.removeAttributesValue(props.attribute.LogicalName)
        }
    }, [props.attributeToUpdateManager.isToUpdate, props.attributeToUpdateManager.valueChanged])

    const setDirty = (newValue?: number | null) => {
        if (oldValue !== newValue) {
            props.manageDirty.set()
        }
        else {
            props.manageDirty.remove()
        }
    }

    useEffect(() => {
        setOldValue(props.value ? Number(props.value) : null)
        setValue(props.value ? Number(props.value) : null)
    }, [props.value])

    useEffect(() => {
        if (props.reset) {
            setValue(oldValue)
            props.manageDirty.remove()
        }
    }, [oldValue, props.manageDirty, props.reset])

    const onChange = (newValue: number | null) => {
        props.setToUpdate()
        setValue(newValue)
        setDirty(newValue)
    }

    return (<NumericInput
        fullWidth
        placeholder={"BigInt"}
        value={value}
        onFocus={props.setToUpdate}
        onChange={onChange}
        variant='outlined'
        size='small'
        disabled={props.disabled}
        InputProps={{
            startAdornment: (
                <InputAdornment position="start">
                    <NumbersIcon />
                </InputAdornment>
            )
        }}
        numericOptions={{
            decimalCharacter: '.',
            decimalPlaces: 0,
            decimalPlacesRawValue: 0,
            digitGroupSeparator: ',',
            modifyValueOnWheel: false,
            readOnly: props.disabled,
            minimumValue: props.attribute.Parameters.MinValue.noExponents(),
            maximumValue: props.attribute.Parameters.MaxValue.noExponents(),
            selectOnFocus: false,
            onInvalidPaste: 'clamp',
        }}
    />)
}
function BooleanNode(props: AttributeProps) {
    const [oldValue, setOldValue] = useState<boolean | null>(props.value);
    const [value, setValue] = useState<boolean | null>(props.value)

    useEffect(() => {
        if (props.attributeToUpdateManager.isToUpdate) {
            props.attributeToUpdateManager.setAttributesValue(props.attribute.LogicalName, value)
        }
        else {
            props.attributeToUpdateManager.removeAttributesValue(props.attribute.LogicalName)
        }
    }, [props.attributeToUpdateManager.isToUpdate, props.attributeToUpdateManager.valueChanged])

    const setDirty = (checked: boolean | null) => {
        if (oldValue !== checked) {
            props.manageDirty.set()
        }
        else {
            props.manageDirty.remove()
        }
    }

    useEffect(() => {
        setOldValue(props.value)
        setValue(props.value)
    }, [props.value])

    useEffect(() => {
        if (props.reset) {
            setValue(oldValue)
            props.manageDirty.remove()
        }
    }, [oldValue, props.manageDirty, props.reset])

    const onChange = (event: SelectChangeEvent<number>, checked: ReactNode) => {
        const result = event.target.value == 1 ? true : event.target.value == 0 ? false : null
        props.setToUpdate()
        setValue(result)
        setDirty(result)
    }

    return (
        <FormControl fullWidth>
            {/* <Checkbox
                size={"small"}
                checked={value}
                onFocus={props.setToUpdate}
                onChange={onChange}
                disabled={props.disabled}
                sx={value && {
                    color: "white",
                    '&.Mui-checked': {
                        color: "white",
                    },
                }}
            /> */}
            <Select
                value={value == true ? 1 : value == false ? 0 : -1}
                onFocus={props.setToUpdate}
                onChange={onChange}
                size={"small"}
                fullWidth
                disabled={props.disabled}
                startAdornment={(
                    <InputAdornment
                        position='start'
                        onClick={() => {
                            setValue(old => {
                                props.setToUpdate()
                                setDirty(!old)
                                return !old
                            })
                        }} sx={{ cursor: 'pointer' }}>
                        {value ? <CheckBoxOutlinedIcon /> : <CheckBoxOutlineBlankOutlinedIcon />}
                    </InputAdornment>
                )}
            >
                <MenuItem value={-1}>- - -</MenuItem>
                <MenuItem value={1}>Yes</MenuItem>
                <MenuItem value={0}>No</MenuItem>
            </Select>
        </FormControl>
    )
}
function DateTimeNode(props: AttributeProps) {
    const [oldValue, setOldValue] = useState<Dayjs | null>(props.value ? dayjs(props.value) : null)
    const [value, setValue] = useState<Dayjs | null>(props.value ? dayjs(props.value) : null)
    const [isHover, setIsHover] = useState<boolean>(false)

    useEffect(() => {
        if (props.attributeToUpdateManager.isToUpdate) {
            props.attributeToUpdateManager.setAttributesValue(props.attribute.LogicalName, value?.format("YYYY-MM-DDTHH:mm:ssZ[Z]") ?? null)
        }
        else {
            props.attributeToUpdateManager.removeAttributesValue(props.attribute.LogicalName)
        }
    }, [props.attributeToUpdateManager.isToUpdate, props.attributeToUpdateManager.valueChanged])

    const setDirty = (date: Dayjs | null) => {
        if ((oldValue != null || date != null) && !oldValue?.isSame(date)) {
            props.manageDirty.set()
        }
        else {
            props.manageDirty.remove()
        }
    }

    useEffect(() => {
        setOldValue(props.value ? dayjs(props.value) : null)
        setValue(props.value ? dayjs(props.value) : null)
    }, [props.value])

    useEffect(() => {
        if (props.reset) {
            setValue(oldValue)
            props.manageDirty.remove()
        }
    }, [oldValue, props.manageDirty, props.reset])

    const onChange = (date: Dayjs | null) => {
        props.setToUpdate()
        setValue(date ? dayjs(date) : null)
        setDirty(date ? dayjs(date) : null)
    }

    return (<>{props.attribute.Parameters.Format === MSDateFormat.DateOnly ?
        <DatePicker
            value={value}
            onChange={onChange}
            renderInput={(params) => (
                <TextField
                    {...params}
                    size={"small"}
                    fullWidth
                    onMouseEnter={() => setIsHover(true)}
                    onMouseLeave={() => setIsHover(false)}
                />
            )}
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end"
                        sx={{ visibility: value && !props.disabled ? "visible" : "hidden" }}
                    >
                        {isHover && !props.disabled && <IconButton
                            onClick={() => {
                                onChange(null)
                            }}
                        >
                            <ClearIcon />
                        </IconButton>}
                    </InputAdornment>
                )
            }}
            InputAdornmentProps={{
                position: "start",
                sx: { marginRight: '0px', marginLeft: '4px' }
            }}
            disabled={props.disabled}
        />
        :
        <DateTimePicker
            ampm={false}
            onChange={onChange}
            value={value}
            renderInput={(params) => (
                <TextField
                    {...params}
                    size={"small"}
                    fullWidth
                    onMouseEnter={() => setIsHover(true)}
                    onMouseLeave={() => setIsHover(false)}
                />
            )}
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end"
                        sx={{ visibility: value && !props.disabled ? "visible" : "hidden" }}
                    >
                        {isHover && !props.disabled && <IconButton
                            onClick={() => {
                                setValue(null)
                            }}
                        >
                            <ClearIcon />
                        </IconButton>}
                    </InputAdornment>
                )
            }}
            InputAdornmentProps={{
                position: "start",
                sx: { marginRight: '0px', marginLeft: '4px' }
            }}
            disabled={props.disabled}
        />}
    </>)
}
function PicklistNode(props: AttributeProps & { nullable?: boolean }) {
    const [oldValue, setOldValue] = useState<number>(props.value ?? -1)
    const [value, setValue] = useState<number>(props.value ?? -1)

    useEffect(() => {
        if (props.attributeToUpdateManager.isToUpdate) {
            props.attributeToUpdateManager.setAttributesValue(props.attribute.LogicalName, value != -1 ? value : null)
        }
        else {
            props.attributeToUpdateManager.removeAttributesValue(props.attribute.LogicalName)
        }
    }, [props.attributeToUpdateManager.isToUpdate, props.attributeToUpdateManager.valueChanged])

    const setDirty = (newOption: typeof value) => {
        if (oldValue !== newOption) {
            props.manageDirty.set()
        }
        else {
            props.manageDirty.remove()
        }
    }

    useEffect(() => {
        setOldValue(props.value ?? -1)
        setValue(props.value ?? -1)
    }, [props.value])

    useEffect(() => {
        if (props.reset) {
            setValue(oldValue)
            props.manageDirty.remove()
        }
    }, [oldValue, props.manageDirty, props.reset])

    const onChange = (event: SelectChangeEvent<number>) => {
        props.setToUpdate()
        const newValue = typeof event.target.value == 'string' ? -1 : event.target.value
        setValue(newValue)
        setDirty(newValue)
    }

    const stateOptions = RetrievePicklistValues(props.entityname, props.attribute.MStype, props.attribute.LogicalName)

    return (
        <FormControl fullWidth>
            <Select
                value={value}
                onFocus={props.setToUpdate}
                onChange={onChange}
                size={"small"}
                fullWidth
                disabled={props.disabled}
                startAdornment={
                    <InputAdornment position="start">
                        <ListIcon />
                    </InputAdornment>
                }
            >
                {props.nullable && <MenuItem value={-1}>- - -</MenuItem>}
                {
                    stateOptions?.map((option) => {
                        return <MenuItem value={option.value}>{option.text}</MenuItem>
                    })
                }
            </Select>
        </FormControl>
    )
}
function MultiplePicklistNode(props: AttributeProps) {
    const defaultValues = useMemo(() => {
        let values: string = props.value
        return values?.split(",").map<number>((v: string) => {
            return parseInt(v)
        }) ?? []
    }, [props.value])

    const [oldValue, setOldValue] = useState<number[]>(defaultValues)
    const [value, setValue] = useState<number[]>(defaultValues)

    useEffect(() => {
        if (props.attributeToUpdateManager.isToUpdate) {
            props.attributeToUpdateManager.setAttributesValue(props.attribute.LogicalName, value.join(","))
        }
        else {
            props.attributeToUpdateManager.removeAttributesValue(props.attribute.LogicalName)
        }
    }, [props.attributeToUpdateManager.isToUpdate, props.attributeToUpdateManager.valueChanged])

    const setDirty = (newOption: typeof value) => {
        if (!isArraysEquals(oldValue, newOption)) {
            props.manageDirty.set()
        }
        else {
            props.manageDirty.remove()
        }
    }

    useEffect(() => {
        setOldValue(defaultValues)
        setValue(defaultValues)
    }, [defaultValues])

    useEffect(() => {
        if (props.reset) {
            setValue(oldValue)
            props.manageDirty.remove()
        }
    }, [oldValue, props.manageDirty, props.reset])

    const onChange = (event: SelectChangeEvent<number[]>) => {
        props.setToUpdate()
        const newValue = typeof event.target.value == 'string' ? [] : event.target.value
        setValue(newValue)
        setDirty(newValue)
    }

    const stateOptions = RetrievePicklistValues(props.entityname, props.attribute.MStype, props.attribute.LogicalName)

    return (
        <FormControl fullWidth>
            <Select
                multiple
                value={value}
                onFocus={props.setToUpdate}
                onChange={onChange}
                size={"small"}
                fullWidth
                disabled={props.disabled}
                startAdornment={
                    <InputAdornment position="start">
                        <ListIcon />
                    </InputAdornment>
                }
            >
                {
                    stateOptions?.map((option) => {
                        return <MenuItem value={option.value}>{option.text}</MenuItem>
                    })
                }
            </Select>
        </FormControl>
    )
}
function ImageNode(props: AttributeProps) {
    return (<img />)
}

type NavBarProps = {
    setEntityname: (str: string) => void,
    setRecordsIds: Dispatch<SetStateAction<string[]>>,
    setCurrentRecord: () => void,
    launchUpdate: () => void,
    setFilterAttribute: (str: string) => void,
    entityname: string,
    recordsIds: string[]
}
function NavTopBar(props: NavBarProps) {

    return (<Stack key="topbar" spacing={0.5} width="100%">
        <Stack direction={"row"} key="entityrecordselectors" spacing={0.5} width="100%">
            <EntitySelector setEntityname={props.setEntityname} entityname={props.entityname} />
            <RecordSelector setRecordsIds={props.setRecordsIds} entityname={props.entityname} recordsIds={props.recordsIds} multiple />
            <Button onClick={props.setCurrentRecord} >Refresh</Button>
        </Stack>
        <Stack direction={"row"} key="attributesselector" spacing={0.5} width="100%">
            <FilterInput fullWidth returnFilterInput={props.setFilterAttribute} key='attributefilterinput' placeholder='Filter attributes' />
            <Button variant='contained' key='updatebutton' onClick={props.launchUpdate} ><SyncIcon /></Button>
        </Stack>
    </Stack>)
}

type AttributeFilterInputProps = {
    returnFilterInput: (str: string) => void,
    placeholder?: string,
    fullWidth?: boolean
}
export const FilterInput: React.FunctionComponent<AttributeFilterInputProps> = (props: AttributeFilterInputProps) => {
    const [value, setValue] = useState("")

    return (<FormControl size='small' fullWidth={props.fullWidth}>
        <TextField
            size='small'
            inputMode='search'
            value={value}
            onChange={(e) => {
                setValue(e?.target.value ?? "")
                props.returnFilterInput(e?.target.value ?? "")
            }}
            placeholder={props.placeholder}
            fullWidth={props.fullWidth}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <FilterAltIcon />
                    </InputAdornment>
                ),
                endAdornment: (
                    <IconButton
                        sx={{ visibility: value ? "visible" : "hidden" }}
                        onClick={() => {
                            setValue("")
                            props.returnFilterInput("")
                        }}
                    >
                        <ClearIcon />
                    </IconButton>
                )
            }}

        />
    </FormControl>)
}

type EntitySelectorProps = {
    setEntityname: (str: string) => void,
    entityname: string
}
type EntityOption = {
    id: string,
    label: string
}
const EntitySelector: React.FunctionComponent<EntitySelectorProps> = (props) => {
    const entitiesRetrieved = RetrieveEntities()
    const [entities, setEntities] = useState<Entity[]>()
    const [value, setValue] = useState<EntityOption>({ id: props.entityname, label: "Loading..." })
    const [options, setOptions] = useState<EntityOption[]>([])

    const entityname = props.entityname

    useEffect(() => {
        setEntities(entitiesRetrieved)
    }, [entitiesRetrieved])

    useEffect(() => {
        setOptions(entities?.map((value, index, array) => {
            return { id: value.logicalname, label: value.name }
        }) ?? [])
    }, [entities])

    useEffect(() => {
        setValue(options.find((o) => { return o.id === entityname }) ?? { id: entityname, label: "" })
    }, [entityname, options])

    return (<FormControl size='small' fullWidth>
        <Autocomplete
            size='small'
            options={options}
            getOptionLabel={(option: typeof options[0]) => option.label}
            // styles={comboBoxStyles}
            // Force re-creating the component when the toggles change (for demo purposes)
            key='entityselector'
            placeholder='Search entity'
            onChange={(event, option, index) => { props.setEntityname(option?.id.toString() ?? "") }}
            value={value}
            renderInput={(params) => <TextField {...params} />}
            fullWidth
        />
    </FormControl>)
}

type RecordSelectorProps = {
    setRecordsIds: Dispatch<SetStateAction<string[]>>,
    entityname: string,
    recordsIds: string[],
    disabled?: boolean,
    multiple?: boolean
}
const RecordSelector: React.FunctionComponent<RecordSelectorProps> = (props) => {
    const { setRecordsIds, entityname, recordsIds, disabled, multiple } = props;

    const [recordsDisplayNames, fetchingDisplayName] = RetrieveRecordsDisplayNames(entityname, recordsIds)
    const { value: isDialogOpen, setValue: setDialogOpen, setTrue: openDialog, setFalse: closeDialog, toggle: toggleDialog } = useBoolean(false)
    const [isGridLoading, setGridIsLoading] = useState<boolean>(false)
    const [isHover, setIsHover] = useState<boolean>(false)

    const ClearButton: JSX.Element =
        <IconButton
            onClick={(e: MouseEvent<HTMLButtonElement>) => {
                setRecordsIds([])
                e.stopPropagation()
            }}>
            <ClearIcon />
        </IconButton>

    return (<>
        <CircularProgressOverflow
            onClick={openDialog}
            loading={isGridLoading || fetchingDisplayName}
            style={{ cursor: !disabled ? "pointer" : "auto" }}
            disableShrink
            theme={theme}
            onHover={setIsHover}
        >
            <TextField
                size='small'
                fullWidth
                placeholder={'Search ' + entityname}
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
                value={recordsDisplayNames.at(0)?.displayName ?? ""}
                // value={recordsDisplayNames.map(r => r.displayName).join(", ")}
                disabled={disabled}
            />
        </CircularProgressOverflow>
        {!disabled && <RecordSelectorDialog
            closeDialog={closeDialog}
            entityname={entityname}
            open={isDialogOpen}
            recordsIds={recordsIds}
            records={recordsDisplayNames}
            setRecordsIds={setRecordsIds}
            multiple={multiple}
            setIsLoading={setGridIsLoading}
        />}
    </>
    )
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

    const primaryNameLogicalName = RetrievePrimaryAttribute(entityname)
    const [entityMetadata, fetchingMetadata] = RetrieveAttributesMetaData(entityname)
    const [filter, setFilter] = useState<string>("")
    const [recordsFiltered, setRecordsFiltered] = useState<any[]>([])
    var click: NodeJS.Timeout

    const { data: allRecords, isFetching } = RetrieveAllRecords(
        entityname,
        entityMetadata?.map((value) => {
            if (value.MStype !== MSType.Lookup) return value.LogicalName
            else return "_" + value.LogicalName + "_value"
        }) ?? []
        // ,
        // filter ? entityMetadata.filter((value) => value.MStype === MSType.String || value.MStype === MSType.Memo)?.map((value) => {
        //     return "contains(" + value.LogicalName + ",'" + filter + "')"
        // }).join(" or ") : ""
    )

    useEffect(() => {
        const notSelectedRecords = allRecords?.filter((record) => {
            return !recordsIds.includes(record[entityname + "id"])
        })?.filter((record) => {
            return Object.values(record).some((att: any) => {
                return att != null && ("" + att).indexOf(filter) != -1
            }) ?? []
        })

        setRecordsFiltered(notSelectedRecords)
    }, [allRecords, filter, recordsIds])

    useEffect(() => {
        props.setIsLoading(fetchingMetadata || isFetching)
    }, [fetchingMetadata, isFetching])


    const onClose = () => {
        closeDialog();
    }

    const addRecord = (id: string) => {
        if (multiple)
            registerRecordIds((old) => [id, ...old])
        else
            registerRecordIds([id])
    }

    const columns: GridColDef[] = useMemo(() => {
        const firstColumnsMetadata = entityMetadata.find(meta => meta.LogicalName == primaryNameLogicalName) ?? {} as AttributeMetadata
        const primaryIdColumnsMetadata = entityMetadata.find(meta => meta.MStype == MSType.Uniqueidentifier) ?? {} as AttributeMetadata
        return [{
            field: firstColumnsMetadata.LogicalName,
            headerName: firstColumnsMetadata.DisplayName,
            resizable: true,
            hideable: false,
            hide: false,
            minWidth: 200
        }, {
            field: primaryIdColumnsMetadata.LogicalName,
            headerName: primaryIdColumnsMetadata.DisplayName,
            resizable: true,
            hideable: false,
            hide: false,
            minWidth: 200
        },
        ...entityMetadata.filter(meta => meta.LogicalName != primaryNameLogicalName && meta.MStype != MSType.Uniqueidentifier).map<GridColDef>(meta => {
            return {
                field: meta.LogicalName,
                headerName: meta.DisplayName,
                resizable: true,
                hideable: true,
                hide: true,
                minWidth: 100
            }
        })]
    }, [entityMetadata, primaryNameLogicalName])

    return (<Dialog onClose={onClose} open={open} maxWidth={false} PaperProps={{ sx: { overflowY: 'inherit' } }}>
        <DialogTitle>
            <Stack direction={"row"} spacing={"5px"} justifyContent="space-between">
            </Stack>
        </DialogTitle>
        <DialogContent sx={{ height: "55vh", width: "55vw", overflowY: "inherit" }}>
            <DataGrid
                rows={recordsFiltered}
                columns={columns}
                loading={isFetching}
                pageSize={25}
                // checkboxSelection={multiple ?? false}
                onRowClick={(params) => {
                    click = setTimeout(() => {
                        addRecord(params.id as string)
                    }, 200)
                }}
                onRowDoubleClick={(params) => {
                    clearTimeout(click)
                    addRecord(params.id as string)
                    onClose()
                }}
                components={{
                    Toolbar: CustomToolBar,
                    // Pagination: CustomPagination,
                    LoadingOverlay: LinearProgress,
                    Footer: CustomFooter
                }}
                componentsProps={{
                    toolbar: {
                        value: filter,
                        setFilter: setFilter
                    },
                    footer: {
                        onClose: onClose,
                        selectedRecordIds: records,
                        registerRecordIds: registerRecordIds
                    }
                }}
                getRowId={(row) => row[entityname + "id"]}
            // onSelectionModelChange={(newSelectionModel) => {
            //     setSelectedRecordIds(newSelectionModel);
            //     registerRecordIds(selectedRecordIds as string[])
            // }}
            // selectionModel={selectedRecordIds}
            />
        </DialogContent>
        {/* <DialogActions>
            <Button onClick={() => registerRecordIds(selectedRecordIds as string[])} variant='contained' >Validate</Button>
            <Button onClick={onClose} variant='contained' >Close</Button>
        </DialogActions> */}
    </Dialog>)
}
type CustomToolBarProps = {
    setFilter: (str: string) => void
    value: string
}
function CustomToolBar(props: CustomToolBarProps) {
    return <Stack direction='row' spacing={0.5} justifyContent="space-between">
        <Box sx={{ width: '100%' }}><GridToolbar /></Box>
        <FilterInput returnFilterInput={props.setFilter} placeholder='Search Records' fullWidth />
    </Stack>
}
function CustomPagination() {
    const apiRef = useGridApiContext();
    const page = useGridSelector(apiRef, gridPageSelector);
    const pageCount = useGridSelector(apiRef, gridPageCountSelector);
    const numberRows = useGridSelector(apiRef, gridRowCountSelector);
    const pageSize = useGridSelector(apiRef, gridPageSizeSelector);
    const rowsDisplayed = useGridSelector(apiRef, gridPaginatedVisibleSortedGridRowIdsSelector);
    // const numberRows = useGridSelector(apiRef, GridRowCount);

    return (<Stack direction='row' alignItems="center" spacing={0.5}>
        <div>{pageSize * page}-{pageSize * page + rowsDisplayed.length} of {numberRows}</div>
        <Pagination
            color="primary"
            count={pageCount}
            page={page + 1}
            onChange={(event, value) => apiRef.current.setPage(value - 1)}
        />
    </Stack>
    );
}
type CustomFooterProps = {
    onClose: () => void
    selectedRecordIds: RecordsDisplayNamesResponse[],
    registerRecordIds: Dispatch<SetStateAction<string[]>>
}
function CustomFooter(props: CustomFooterProps) {
    const handleDelete = (chipToDelete: RecordsDisplayNamesResponse) => {
        const newSelectedRecords = props.selectedRecordIds.filter(r => r.id != chipToDelete.id)
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

let updateRecord = new UpdateRecordButton()
export default updateRecord