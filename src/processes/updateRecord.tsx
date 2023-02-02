
import '../utils/global/extensions';
import '../utils/components/ReportComplete';

import dayjs, { Dayjs } from 'dayjs';
import { SnackbarProvider, useSnackbar } from 'notistack';
import React, {
    Dispatch, forwardRef, ReactNode, SetStateAction, useCallback, useEffect, useImperativeHandle,
    useMemo, useState
} from 'react';
import { useBoolean, useUpdateEffect } from 'usehooks-ts';

import ShortTextIcon from '@material-ui/icons/ShortText';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckBoxOutlineBlankOutlinedIcon from '@mui/icons-material/CheckBoxOutlineBlankOutlined';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import ListIcon from '@mui/icons-material/List';
import NotesIcon from '@mui/icons-material/Notes';
import NumbersIcon from '@mui/icons-material/Numbers';
import SyncIcon from '@mui/icons-material/Sync';
import { createSvgIcon, createTheme, ThemeProvider } from '@mui/material';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import ListSubheader from '@mui/material/ListSubheader';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { DatePicker, DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import EntitySelector from '../utils/components/EntitySelector';
import FilterInput from '../utils/components/FilterInput';
import MuiCalculator from '../utils/components/MuiCalculator';
import NumericInput from '../utils/components/NumericInput';
import RecordSelector from '../utils/components/RecordSelector';
import { NoMaxWidthTooltip } from '../utils/components/updateRecordComponents';
import { ProcessButton, ProcessProps, ProcessRef } from '../utils/global/.processClass';
import { capitalizeFirstLetter, formatId, groupBy, isArraysEquals } from '../utils/global/common';
import {
    AttributeMetadata, getReadableMSType, MSDateFormat, MSType
} from '../utils/global/requestsType';
import XrmObserver from '../utils/global/XrmObserver';
import { DictValueType, useDictionnary } from '../utils/hooks/use/useDictionnary';
import { RetrieveAttributes } from '../utils/hooks/XrmApi/RetrieveAttributes';
import { RetrieveAttributesMetaData } from '../utils/hooks/XrmApi/RetrieveAttributesMetaData';
import {
    PickListOption, RetrievePicklistValues
} from '../utils/hooks/XrmApi/RetrievePicklistValues';
import { RetrieveSetName } from '../utils/hooks/XrmApi/RetrieveSetName';
import ErrorFileSnackbar from '../utils/components/ReportComplete';


import { useWorker, WORKER_STATUS } from "@koale/useworker";

// import { createContext, useContextSelector } from 'use-context-selector';

class UpdateRecordButton extends ProcessButton {
    constructor() {
        super(
            'updaterecord',
            'Update Record',
            <SyncIcon />,
            500
        )
        this.process = UpdateRecordProcess
        this.processContainer = (props) => {
            return (
                <ThemeProvider theme={theme}>
                    <SnackbarProvider Components={{
                        errorFile: ErrorFileSnackbar
                    }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            {props.children}
                        </LocalizationProvider>
                    </SnackbarProvider>
                </ThemeProvider>
            )
        }
    }
}

const rowHeight = 42.625

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

// type ContextType = {
//     attributesMetadata: AttributeMetadata[],
//     attributes: { [key: string]: any },
//     recordsId: string[],
//     entityName: string
// }
// const updateContext = createContext<ContextType>({ attributesMetadata: [], attributes: {}, recordsId: [], entityName: '' });

const UpdateRecordProcess = forwardRef<ProcessRef, ProcessProps>(
    function UpdateRecordProcess(props: ProcessProps, ref) {

        useImperativeHandle(ref, () => ({
            onClose() {
                XrmObserver.removeListener(xrmObserverCallback)
            }
        }))

        const [entityname, _setEntityname] = useState<string>(Xrm.Page.data?.entity.getEntityName())
        const [recordsIds, setRecordsIds] = useState<string[]>(Xrm.Page.data ? [formatId(Xrm.Page.data?.entity.getId().toLowerCase())] : [])
        const [filterAttribute, setFilterAttribute] = useState<string>("")
        const { dict: attributesValues, setValue: setAttributesValue, removeValue: removeAttributesValue } = useDictionnary({})
        const { value: resetTotal, toggle: toggleResetTotal } = useBoolean(false)

        const { enqueueSnackbar, closeSnackbar } = useSnackbar()

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

        const xrmObserverCallback = () => {
            if (!Xrm.Page.data || entityname) return
            setCurrentRecord()
        }

        useEffect(() => {
            XrmObserver.addListener(xrmObserverCallback)
        }, [])

        const launchUpdate = () => {
            console.log("Launch Update for", entityname, recordsIds, "on", attributesValues)

            recordsIds.forEach((recordid) => {
                Xrm.Utility.showProgressIndicator("Updating " + capitalizeFirstLetter(entityname) + ": " + recordid)
                Xrm.WebApi.online.updateRecord(entityname, recordid, attributesValues).then(
                    function success(result) {
                        Xrm.Utility.closeProgressIndicator()
                        enqueueSnackbar(
                            capitalizeFirstLetter(entityname) + " " + recordid + " updated.",
                            { variant: 'success' }
                        )
                        // console.log("Update done for", entityname, recordid)
                    },
                    function (error) {
                        Xrm.Utility.closeProgressIndicator()
                        enqueueSnackbar(
                            capitalizeFirstLetter(entityname) + " " + recordid + " has encountered an error.",
                            {
                                variant: 'errorFile',
                                persist: true,
                                allowDownload: true,
                                errorMessage: error.message,
                                downloadButtonLabel: "Download log file",
                                errorCode: '0x' + error.errorCode.toString(16),
                                fileContent: error.raw,
                                fileName: "ErrorDetails.txt"
                            }
                        )

                        console.log(error.message)
                    }
                );
            })
        }


        return (
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
                <span>{entityname + " / " + recordsIds}</span>
            </Stack>
        )
    }
)

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

    const [attributesMetadataVisible, setAttributesMetadataVisible] = useState<{ isVisible: boolean, metadata: AttributeMetadata }[]>([])
    const [filteredBy, setFilteredBy] = useState<string | null>(null)
    const [attributesMetadataRetrieved, fetchingMetadata] = RetrieveAttributesMetaData(entityname)
    const [attributesRetrieved, fetchingValues] = RetrieveAttributes(entityname, recordid, attributesMetadataRetrieved?.map((value) => {
        if (value.MStype !== MSType.Lookup) return value.LogicalName
        else return "_" + value.LogicalName + "_value"
    }) ?? [])

    const [
        visibleWorker,
        { status: visibleWorkerStatus, kill: killWorker }
    ] = useWorker((attributesMetadataList: AttributeMetadata[], filter: string) => {
        return attributesMetadataList.map((a) => {
            return {
                isVisible: (a.DisplayName.toLowerCase().indexOf(filter) !== -1 ||
                    a.LogicalName.indexOf(filter) !== -1 ||
                    a.SchemaName.toLowerCase().indexOf(filter) !== -1),
                metadata: a
            }
        })
    }, {
        autoTerminate: false
    });

    useEffect(() => {
        // console.log('visibleWorker', attributesMetadataRetrieved, filteredBy, visibleWorkerStatus)
        if (filter != filteredBy && visibleWorkerStatus != WORKER_STATUS.RUNNING) {
            visibleWorker(attributesMetadataRetrieved, filter).then((result) => {
                // console.log('result', result)
                setAttributesMetadataVisible(result)
                setFilteredBy(filter)
            })
        }
    }, [attributesMetadataRetrieved, filter, visibleWorkerStatus])



    return (<>{
        !fetchingMetadata
            ?

            <Stack spacing={"2px"} height="100%" sx={{ overflowY: 'scroll', overflowX: 'hidden' }} >
                {
                    !fetchingValues
                        ?
                        attributesMetadataVisible?.map((attribute) => {
                            const { isVisible, metadata } = attribute
                            const attributeName = metadata.MStype !== MSType.Lookup ? metadata.LogicalName : "_" + metadata.LogicalName + "_value"
                            return (
                                <AttributeNode
                                    disabled={!metadata.IsValidForUpdate}
                                    attribute={metadata}
                                    entityname={props.entityname}
                                    value={attributesRetrieved[attributeName]}
                                    isVisible={isVisible}
                                    resetTotal={props.resetTotal}
                                    attributeToUpdateManager={props.attributeToUpdateManager}
                                />
                            )
                        })
                        :
                        [...Array(16)].map(() => <Skeleton variant='rounded' height={rowHeight + 'px'} />)
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
    isVisible: boolean,
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

    // useEffect(() => {
    //     (async () => {
    //         return (props.attribute.DisplayName.toLowerCase().indexOf(props.filter) !== -1 ||
    //             props.attribute.LogicalName.indexOf(props.filter) !== -1 ||
    //             props.attribute.SchemaName.toLowerCase().indexOf(props.filter) !== -1)
    //     })().then(result => {
    //         setisVisible(result);
    //     });
    // }, [props.filter, props.attribute])

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
            style={{ display: props.isVisible ? '' : 'none' }}
        >
            <NoMaxWidthTooltip enterDelay={500} title={tooltipText} arrow placement='left' disableFocusListener>
                <Stack
                    height='100%'
                    justifyContent='center'
                    width='80%'
                    overflow='hidden'
                    onDoubleClick={() => { if (props.disabled) return; navigator.clipboard.writeText(props.attribute.LogicalName); setToUpdate(); triggerValueChange() }}
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
            <IconButton aria-label="delete" onClick={removeToUpdate} style={{ visibility: isToUpdate ? "visible" : "hidden" }} sx={{ padding: '6px' }}>
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
            return (<GroupedPicklistNode
                attribute={props.attribute}
                entityname={props.entityname}
                value={props.value}
                setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
                groupBy='State'
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
        theme={theme}
    />
}
function StringNode(props: AttributeProps) {
    const [oldValue, setOldValue] = useState<string | null>(props.value ? props.value : null)
    const [value, setValue] = useState<string | null>(props.value ? props.value : null)
    const [openDialog, setOpenDialog] = useState<boolean>(false)

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

    return (
        <>
            <TextField
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
                        <InputAdornment
                            position="start"
                            onClick={() => { !props.disabled && setOpenDialog(true) }}
                            sx={{ cursor: props.disabled ? 'auto' : 'pointer' }}
                        >
                            <ShortTextIcon />
                        </InputAdornment>
                    )
                }}
            />
            {
                !props.disabled &&
                <Dialog onClose={() => { setOpenDialog(false) }} open={openDialog} maxWidth={false} >
                    <DialogTitle>
                        Text Editor
                    </DialogTitle>
                    <DialogContent sx={{ height: "55vh", width: "50vw" }}>
                        <TextField
                            multiline
                            value={value ?? ''}
                            onChange={onChange}
                            rows={25}
                            fullWidth
                            inputProps={{ maxLength: props.attribute.Parameters.MaxLength }}
                            onFocus={props.setToUpdate}
                        />
                    </DialogContent>
                    <Stack direction='row' justifyContent='space-between' margin='10px' marginTop='0' marginLeft='25px'>
                        <span>{value?.length ?? 0} / {props.attribute.Parameters.MaxLength}</span>
                        <Button variant='contained' onClick={() => { setOpenDialog(false) }}>
                            Close
                        </Button>
                    </Stack>
                </Dialog>
            }
        </>
    )
}
function MemoNode(props: AttributeProps) {
    const [oldValue, setOldValue] = useState<string | null>(props.value ? props.value : null)
    const [value, setValue] = useState<string | null>(props.value ? props.value : null)
    const [openDialog, setOpenDialog] = useState<boolean>(false)

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


    return (
        <>
            <TextField
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
                        <InputAdornment
                            position="start"
                            onClick={() => { !props.disabled && setOpenDialog(true) }}
                            sx={{ cursor: props.disabled ? 'auto' : 'pointer' }}
                        >
                            <NotesIcon />
                        </InputAdornment>
                    )
                }}
            />
            {
                !props.disabled &&
                <Dialog onClose={() => { setOpenDialog(false) }} open={openDialog} maxWidth={false} >
                    <DialogTitle>
                        Text Editor
                    </DialogTitle>
                    <DialogContent sx={{ height: "55vh", width: "50vw" }}>
                        <TextField
                            multiline
                            value={value ?? ''}
                            onChange={onChange}
                            rows={25}
                            fullWidth
                            inputProps={{ maxLength: props.attribute.Parameters.MaxLength }}
                            onFocus={props.setToUpdate}
                        />
                    </DialogContent>
                    <Stack direction='row' justifyContent='space-between' margin='10px' marginTop='0' marginLeft='25px'>
                        <span>{value?.length ?? 0} / {props.attribute.Parameters.MaxLength}</span>
                        <Button variant='contained' onClick={() => { setOpenDialog(false) }}>
                            Close
                        </Button>
                    </Stack>
                </Dialog>
            }
        </>
    )
}
function DecimalNode(props: AttributeProps) {
    const [oldValue, setOldValue] = useState<number | null>(props.value ? Number(props.value) : null)
    const [value, setValue] = useState<number | null>(props.value ? Number(props.value) : null)
    const [calculatorOpen, setCalculatorOpen] = useState<boolean>(false)

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

    return (
        <>
            <NumericInput
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
                        <InputAdornment
                            position="start"
                            onClick={() => { !props.disabled && setCalculatorOpen(true) }}
                            sx={{ cursor: props.disabled ? 'auto' : 'pointer' }}
                        >
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
            />
            {
                calculatorOpen &&
                <MuiCalculator
                    value={value}
                    open={calculatorOpen}
                    onClose={() => { setCalculatorOpen(false) }}
                    integer={false}
                    onChange={onChange}
                    minimumValue={Number(props.attribute.Parameters.MinValue.noExponents())}
                    maximumValue={Number(props.attribute.Parameters.MaxValue.noExponents())}
                />
            }
        </>
    )
}
function DoubleNode(props: AttributeProps) {
    const [oldValue, setOldValue] = useState<number | null>(props.value ? Number(props.value) : null)
    const [value, setValue] = useState<number | null>(props.value ? Number(props.value) : null)
    const [calculatorOpen, setCalculatorOpen] = useState<boolean>(false)

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

    return (
        <>
            <NumericInput
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
                        <InputAdornment
                            position="start"
                            onClick={() => { !props.disabled && setCalculatorOpen(true) }}
                            sx={{ cursor: props.disabled ? 'auto' : 'pointer' }}
                        >
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
            />
            {
                calculatorOpen &&
                <MuiCalculator
                    value={value}
                    open={calculatorOpen}
                    onClose={() => { setCalculatorOpen(false) }}
                    integer={false}
                    onChange={onChange}
                    minimumValue={Number(props.attribute.Parameters.MinValue.noExponents())}
                    maximumValue={Number(props.attribute.Parameters.MaxValue.noExponents())}
                />
            }
        </>
    )
}
function MoneyNode(props: AttributeProps) {
    const [oldValue, setOldValue] = useState<number | null>(props.value ? props.value : null)
    const [value, setValue] = useState<number | null>(props.value ? props.value : null)
    const [calculatorOpen, setCalculatorOpen] = useState<boolean>(false)

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
        <>
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
                        <InputAdornment
                            position="start"
                            onClick={() => { !props.disabled && setCalculatorOpen(true) }}
                            sx={{ cursor: props.disabled ? 'auto' : 'pointer' }}
                        >
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
            {
                calculatorOpen &&
                <MuiCalculator
                    value={value}
                    open={calculatorOpen}
                    onClose={() => { setCalculatorOpen(false) }}
                    integer={false}
                    onChange={onChange}
                    minimumValue={Number(props.attribute.Parameters.MinValue.noExponents())}
                    maximumValue={Number(props.attribute.Parameters.MaxValue.noExponents())}
                />
            }
        </>
    )
}
function IntegerNode(props: AttributeProps) {
    const [oldValue, setOldValue] = useState<number | null>(props.value ? Number(props.value) : null)
    const [value, setValue] = useState<number | null>(props.value ? Number(props.value) : null)
    const [calculatorOpen, setCalculatorOpen] = useState<boolean>(false)

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

    return (
        <>
            <NumericInput
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
                        <InputAdornment
                            position="start"
                            onClick={() => { !props.disabled && setCalculatorOpen(true) }}
                            sx={{ cursor: props.disabled ? 'auto' : 'pointer' }}
                        >
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
            />
            {
                calculatorOpen &&
                <MuiCalculator
                    value={value}
                    open={calculatorOpen}
                    onClose={() => { setCalculatorOpen(false) }}
                    integer={true}
                    onChange={onChange}
                    minimumValue={Number(props.attribute.Parameters.MinValue.noExponents())}
                    maximumValue={Number(props.attribute.Parameters.MaxValue.noExponents())}
                />
            }
        </>
    )
}
function BigIntNode(props: AttributeProps) {
    const [oldValue, setOldValue] = useState<number | null>(props.value ? Number(props.value) : null)
    const [value, setValue] = useState<number | null>(props.value ? Number(props.value) : null)
    const [calculatorOpen, setCalculatorOpen] = useState<boolean>(false)

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

    return (
        <>
            <NumericInput
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
                        <InputAdornment
                            position="start"
                            onClick={() => { !props.disabled && setCalculatorOpen(true) }}
                            sx={{ cursor: props.disabled ? 'auto' : 'pointer' }}
                        >
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
            />
            {
                calculatorOpen &&
                <MuiCalculator
                    value={value}
                    open={calculatorOpen}
                    onClose={() => { setCalculatorOpen(false) }}
                    integer={true}
                    onChange={onChange}
                    minimumValue={Number(props.attribute.Parameters.MinValue.noExponents())}
                    maximumValue={Number(props.attribute.Parameters.MaxValue.noExponents())}
                />
            }
        </>
    )
}
function BooleanNode(props: AttributeProps) {
    const [oldValue, setOldValue] = useState<boolean | null>(props.value)
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
                            !props.disabled &&
                                setValue(old => {
                                    props.setToUpdate()
                                    setDirty(!old)
                                    return !old
                                })
                        }}
                        sx={{ cursor: props.disabled ? 'auto' : 'pointer' }}
                    >
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
            if (props.attribute.Parameters.Format === MSDateFormat.DateOnly) {
                props.attributeToUpdateManager.setAttributesValue(props.attribute.LogicalName, value?.format("YYYY-MM-DD") ?? null)
            }
            else {
                props.attributeToUpdateManager.setAttributesValue(props.attribute.LogicalName, value?.toISOString() ?? null)
            }

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
            inputFormat='YYYY/MM/DD'
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
            inputFormat='YYYY/MM/DD'
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
                    stateOptions?.map((optionNode) => {
                        var option: Xrm.OptionSetValue = { text: optionNode.Label.UserLocalizedLabel!.Label, value: optionNode.Value };
                        return <MenuItem value={option.value}>{option.text}</MenuItem>
                    })
                }
            </Select>
        </FormControl>
    )
}
function GroupedPicklistNode(props: AttributeProps & { nullable?: boolean, groupBy: string }) {
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

    const statusCode = RetrievePicklistValues(props.entityname, props.attribute.MStype, props.attribute.LogicalName)
    const stateCode = RetrievePicklistValues(props.entityname, MSType.State, 'statecode')

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
                    statusCode && Object.entries(groupBy(statusCode, props.groupBy))?.map(([group, value]) => {
                        return (
                            [
                                <ListSubheader>{stateCode?.find(state => state.Value === Number(group))?.Label.UserLocalizedLabel!.Label}</ListSubheader>,
                                value.sort((a: PickListOption, b: PickListOption) => {
                                    return a.Label.UserLocalizedLabel!.Label?.localeCompare(b.Label.UserLocalizedLabel!.Label)
                                }).map((optionNode) => {
                                    var option: Xrm.OptionSetValue = { text: optionNode.Label.UserLocalizedLabel!.Label, value: optionNode.Value }
                                    return <MenuItem value={option.value}>{option.text}</MenuItem>
                                })
                            ]
                        )
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
                    stateOptions?.map((optionNode) => {
                        var option: Xrm.OptionSetValue = { text: optionNode.Label.UserLocalizedLabel!.Label, value: optionNode.Value };
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
        <Stack direction={"row"} justifyContent='center' spacing={0.5} width="100%" height='1.8em'>
            <Stack height='100%' justifyContent='center' width='18em'>
                <Typography variant='button' height='1em' >Refresh:</Typography>
            </Stack>
            <Button
                variant='outlined'
                fullWidth
                size='small'
                onClick={() => {
                    Xrm.Page.ui.refreshRibbon(true)
                }}>
                Ribbon
            </Button>
            <Button
                variant='outlined'
                fullWidth
                size='small'
                onClick={() => {
                    Xrm.Page.data.refresh(false)
                }}
            >
                Form
            </Button>
        </Stack>
        <Divider variant='middle' />
        <Stack direction={"row"} key="entityrecordselectors" spacing={0.5} width="100%">
            <EntitySelector setEntityname={props.setEntityname} entityname={props.entityname} />
            <RecordSelector setRecordsIds={props.setRecordsIds} entityname={props.entityname} recordsIds={props.recordsIds} multiple theme={theme} />
            <Button
                onClick={() => {
                    props.setCurrentRecord()
                    // props.setRecordsIds([])
                    // setTimeout(() => {
                    //     props.setCurrentRecord()
                    // }, 100);
                }}
            >
                Reload
            </Button>
        </Stack>
        <Stack direction={"row"} key="attributesselector" spacing={0.5} width="100%">
            <FilterInput fullWidth returnFilterInput={props.setFilterAttribute} key='attributefilterinput' placeholder='Filter attributes' />
            <Button variant='contained' key='updatebutton' onClick={props.launchUpdate} ><SyncIcon /></Button>
        </Stack>
    </Stack>)
}


let updateRecord = new UpdateRecordButton()
export default updateRecord
