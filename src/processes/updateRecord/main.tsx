
import '../../utils/global/extensions';
import '../../utils/components/ReportComplete';

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

import EntitySelector from '../../utils/components/EntitySelector';
import FilterInput from '../../utils/components/FilterInput';
import MuiCalculator from '../../utils/components/MuiCalculator';
import NumericInput from '../../utils/components/NumericInput';
import RecordSelector from '../../utils/components/RecordSelector';
import { NoMaxWidthTooltip } from '../../utils/components/updateRecordComponents';
import { ProcessButton, ProcessProps, ProcessRef } from '../../utils/global/.processClass';
import { capitalizeFirstLetter, debugLog, formatId, groupBy, isArraysEquals } from '../../utils/global/common';
import {
    AttributeMetadata, getReadableMSType, MSDateFormat, MSType
} from '../../utils/global/requestsType';
import XrmObserver from '../../utils/global/XrmObserver';
import { DictValueType, useDictionnary } from '../../utils/hooks/use/useDictionnary';
import { RetrieveAttributes } from '../../utils/hooks/XrmApi/RetrieveAttributes';
import { RetrieveAttributesMetaData } from '../../utils/hooks/XrmApi/RetrieveAttributesMetaData';
import {
    PickListOption, RetrievePicklistValues
} from '../../utils/hooks/XrmApi/RetrievePicklistValues';
import { RetrieveSetName } from '../../utils/hooks/XrmApi/RetrieveSetName';
import ErrorFileSnackbar from '../../utils/components/ReportComplete';
import { AttributeProps, BigIntNode, BooleanNode, DateTimeNode, DecimalNode, DoubleNode, GroupedPicklistNode, ImageNode, IntegerNode, LookupNode, MemoNode, MoneyNode, MultiplePicklistNode, PicklistNode, StringNode } from './nodes';


// import { useWorker, WORKER_STATUS } from "@koale/useworker";

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
            debugLog("Launch Update for", entityname, recordsIds, "on", attributesValues)

            recordsIds.forEach((recordid) => {
                Xrm.Utility.showProgressIndicator("Updating " + capitalizeFirstLetter(entityname) + ": " + recordid)
                Xrm.WebApi.online.updateRecord(entityname, recordid, attributesValues).then(
                    function success(result) {
                        Xrm.Utility.closeProgressIndicator()
                        enqueueSnackbar(
                            capitalizeFirstLetter(entityname) + " " + recordid + " updated.",
                            { variant: 'success' }
                        )
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

    // const [attributesMetadataVisible, setAttributesMetadataVisible] = useState<{ isVisible: boolean, metadata: AttributeMetadata }[]>([])
    // const [filteredBy, setFilteredBy] = useState<string | null>(null)
    const [attributesMetadataRetrieved, fetchingMetadata] = RetrieveAttributesMetaData(entityname)
    const [attributesRetrieved, fetchingValues] = RetrieveAttributes(entityname, recordid, attributesMetadataRetrieved?.map((value) => {
        if (value.MStype !== MSType.Lookup) return value.LogicalName
        else return "_" + value.LogicalName + "_value"
    }) ?? [])

    // const [
    //     visibleWorker,
    //     { status: visibleWorkerStatus, kill: killWorker }
    // ] = useWorker((attributesMetadataList: AttributeMetadata[], filter: string) => {
    //     return attributesMetadataList.map((a) => {
    //         return {
    //             isVisible: (a.DisplayName.toLowerCase().indexOf(filter) !== -1 ||
    //                 a.LogicalName.indexOf(filter) !== -1 ||
    //                 a.SchemaName.toLowerCase().indexOf(filter) !== -1),
    //             metadata: a
    //         }
    //     })
    // }, {
    //     autoTerminate: false
    // });

    // useEffect(() => {
    //     if (attributesMetadataRetrieved.length === 0) {
    //         setFilteredBy(null)
    //     }
    //     if (filter != filteredBy && attributesMetadataRetrieved.length > 0 && visibleWorkerStatus != WORKER_STATUS.RUNNING) {
    //         visibleWorker(attributesMetadataRetrieved, filter).then((result) => {
    //             setAttributesMetadataVisible(result)
    //             setFilteredBy(filter)
    //         })
    //     }
    // }, [attributesMetadataRetrieved, filter, visibleWorkerStatus])



    return (<>{
        !fetchingMetadata
            ?

            <Stack spacing={"2px"} height="100%" sx={{ overflowY: 'scroll', overflowX: 'hidden' }} >
                {
                    !fetchingValues
                        ?
                        attributesMetadataRetrieved?.map((metadata) => {
                            // const { isVisible, metadata } = attribute
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
    filter: string,
    resetTotal: boolean,
    attributeToUpdateManager: { setAttributesValue: (key: string, value: DictValueType) => void, removeAttributesValue: (key: string) => void }
}
function AttributeNode(props: AttributeNodeProps) {
    const { value: isDirty, setTrue, setFalse } = useBoolean(false)
    const manageDirty = { setTrue, setFalse }

    const { value: valueChanged, toggle: triggerValueChange } = useBoolean(false)
    const { value: isToUpdate, setTrue: setToUpdate, setFalse: removeToUpdate } = useBoolean(false)
    const { value: toReset, setTrue: setToReset, setFalse: resetToReset } = useBoolean(false)
    const { value: loading, setTrue: isLoading, setFalse: doneLoading } = useBoolean(true)
    const [isVisible, setIsVisible] = useState<boolean>(true)

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

    useEffect(() => {
        (async () => {
            return (props.attribute.DisplayName.toLowerCase().indexOf(props.filter) !== -1 ||
                props.attribute.LogicalName.indexOf(props.filter) !== -1 ||
                props.attribute.SchemaName.toLowerCase().indexOf(props.filter) !== -1)
        })().then(result => {
            setIsVisible(result);
        });
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
                theme={theme}
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
