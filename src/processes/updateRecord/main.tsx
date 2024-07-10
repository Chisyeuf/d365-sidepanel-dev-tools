

// Import statements
import '../../utils/global/extensions';
import '../../utils/components/ReportComplete';

import { SnackbarProvider, useSnackbar } from 'notistack';
import React, {
    Dispatch, forwardRef, SetStateAction, useCallback, useEffect, useImperativeHandle,
    useMemo, useState
} from 'react';
import { useBoolean, useUpdateEffect } from 'usehooks-ts';

// Date picker imports
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';

// Material UI imports
import { Autocomplete, AutocompleteChangeReason, ButtonGroup, createFilterOptions, createTheme, TextField, ThemeProvider } from '@mui/material';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// Icon imports
import DeleteIcon from '@mui/icons-material/Delete';
import SyncIcon from '@mui/icons-material/Sync';

// Component imports
import { NoMaxWidthTooltip } from '../../utils/components/updateRecordComponents';
import { ProcessButton, ProcessProps, ProcessRef } from '../../utils/global/.processClass';
import ErrorFileSnackbar from '../../utils/components/ReportComplete';
import { AttributeProps, BigIntNode, BooleanNode, DateTimeNode, DecimalNode, DoubleNode, GroupedPicklistNode, ImageNode, IntegerNode, LookupNode, MemoNode, MoneyNode, MultiplePicklistNode, PicklistNode, StringNode } from './nodes';

// Common functions and types
import { capitalizeFirstLetter, debugLog, formatId } from '../../utils/global/common';
import { AttributeMetadata, getReadableMSType, MSDateFormat, MSType } from '../../utils/types/requestsType';

// Xrm API hooks
import XrmObserver from '../../utils/global/XrmObserver';
import { useDictionnary } from '../../utils/hooks/use/useDictionnary';
import { RetrieveAttributes } from '../../utils/hooks/XrmApi/RetrieveAttributes';
import { RetrieveAttributesMetaData } from '../../utils/hooks/XrmApi/RetrieveAttributesMetaData';
import RecordSearchBar from '../../utils/components/RecordSearchBar';
import RestoreIcon from '@mui/icons-material/Restore';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

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
            // styleOverrides: {
            //     root: {
            //         fontSize: '0.85rem',
            //         lineHeight: '1',
            //     }
            // },
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
                XrmObserver.removeListener(xrmObserverCallback);
            },
        }));

        const { enqueueSnackbar, closeSnackbar } = useSnackbar();

        const [entityname, _setEntityname] = useState<string>(Xrm.Page.data?.entity?.getEntityName());
        const [recordsIds, setRecordsIds] = useState<string[]>(Xrm.Page.data?.entity ? [formatId(Xrm.Page.data?.entity?.getId()?.toLowerCase())] : []);
        const [filterAttribute, setFilterAttribute] = useState<string>("");
        const { dict: attributesValues, keys: attributesValueKeys, setValue: setAttributesValue, removeValue: removeAttributesValue, setDict: setAttributes } = useDictionnary({});
        const { value: resetTotal, toggle: toggleResetTotal } = useBoolean(false);


        const setEntityname = (entityname: string) => {
            setRecordsIds([]);
            _setEntityname(entityname);
        }

        const setCurrentRecord = useCallback(() => {
            const entityName = Xrm.Utility.getPageContext().input.entityName;
            const recordid = formatId(Xrm.Page.data?.entity?.getId()?.toLowerCase());
            if (!entityName) return;
            setEntityname(entityName);
            setTimeout(() => {
                setRecordsIds(recordid ? [recordid] : []);
            }, 100);

        }, []);

        useUpdateEffect(() => {
            toggleResetTotal();
        }, [entityname, recordsIds]);

        useUpdateEffect(() => {
            setAttributes({});
        }, [entityname]);


        const xrmObserverCallback = () => {
            if (entityname) return
            // if (!XrmObserver.isEntityRecord() || entityname) return
            setCurrentRecord();
            XrmObserver.removeListener(xrmObserverCallback);
        }

        useEffect(() => {
            XrmObserver.addListener(xrmObserverCallback);
        }, []);

        const launchUpdate = () => {
            debugLog("Launch Update for", entityname, recordsIds, "on", attributesValues);

            if (recordsIds.length === 0 || attributesValueKeys.length === 0) return;

            recordsIds.forEach((recordid) => {
                Xrm.Utility.showProgressIndicator("Updating " + capitalizeFirstLetter(entityname) + ": " + recordid);
                Xrm.WebApi.online.updateRecord(entityname, recordid, attributesValues).then(
                    function success(result) {
                        Xrm.Utility.closeProgressIndicator();
                        enqueueSnackbar(
                            capitalizeFirstLetter(entityname) + " " + recordid + " updated.",
                            { variant: 'success' }
                        );
                    },
                    function (error) {
                        Xrm.Utility.closeProgressIndicator();
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
                        );

                        console.error(error.message);
                    }
                );
            })
        }


        return (
            <Stack spacing={0.5} width="-webkit-fill-available" padding="10px" height='calc(100% - 10px)'>
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
                <Typography maxHeight='19px'>{entityname + " / " + recordsIds}</Typography>
            </Stack>
        );
    }
);



const attributeMetadataTooltipGenerator = (attributeMetadata: AttributeMetadata) => (
    <>
        <Typography variant="button"><strong>{attributeMetadata.DisplayName}</strong></Typography>
        <Typography variant="body2"><strong>LogicalName:</strong> {attributeMetadata.LogicalName}</Typography>
        <Typography variant="body2"><strong>Type:</strong> {getReadableMSType(attributeMetadata.MStype)}</Typography>
        {attributeMetadata.Parameters.Format && attributeMetadata.Parameters.Format !== MSDateFormat.None && <Typography variant="body2"><strong>Format:</strong> {attributeMetadata.Parameters.Format}</Typography>}
        {(attributeMetadata.Parameters.MaxLength || attributeMetadata.Parameters.MaxLength === 0) && <Typography variant="body2"><strong>MaxLength:</strong> {attributeMetadata.Parameters.MaxLength}</Typography>}
        {(attributeMetadata.Parameters.MaxValue || attributeMetadata.Parameters.MaxValue === 0) && <Typography variant="body2"><strong>MaxValue:</strong> {attributeMetadata.Parameters.MaxValue}</Typography>}
        {(attributeMetadata.Parameters.MinValue || attributeMetadata.Parameters.MinValue === 0) && <Typography variant="body2"><strong>MinValue:</strong> {attributeMetadata.Parameters.MinValue}</Typography>}
        {(attributeMetadata.Parameters.Precision || attributeMetadata.Parameters.Precision === 0) && <Typography variant="body2"><strong>Precision:</strong> {attributeMetadata.Parameters.Precision}</Typography>}
        {attributeMetadata.Parameters.Target && <Typography variant="body2"><strong>Target:</strong> {attributeMetadata.Parameters.Target}</Typography>}
    </>
);

type AttributesListProps = {
    entityname: string,
    recordsIds: string[],
    filter: string,
    resetTotal: boolean,
    attributeToUpdateManager: { setAttributesValue: (key: string, value: any) => void, removeAttributesValue: (key: string) => void }
}
function AttributesList(props: AttributesListProps) {
    const entityname = props.entityname;
    const recordid = props.recordsIds?.length === 1 ? props.recordsIds?.at(0) : undefined;
    const filter = props.filter;

    const [selectedAttribute, setSelectedAttribute] = useState<AttributeMetadata[]>([]);
    const [attributesMetadataRetrieved, fetchingMetadata] = RetrieveAttributesMetaData(entityname);
    const [attributesRetrieved, fetchingValues] = RetrieveAttributes(entityname, recordid, attributesMetadataRetrieved?.map((value) => {
        if (value.MStype !== MSType.Lookup) return value.LogicalName
        else return "_" + value.LogicalName + "_value"
    }) ?? []);

    const selectableAttribute = useMemo(() => {
        const selectedAttributesName = selectedAttribute.map((attribute) => attribute.LogicalName);
        return attributesMetadataRetrieved.filter(attribute => !selectedAttributesName.includes(attribute.LogicalName));
    }, [selectedAttribute, attributesMetadataRetrieved]);

    const handleSelectAttribute = (selectedAttribute: AttributeMetadata[]) => {
        setSelectedAttribute(array => [...array, ...selectedAttribute]);
    }

    const handleUnselectAttribute = (selectedAttribute: AttributeMetadata[]) => {
        const attributeNameToRemove = selectedAttribute.map(attribute => attribute.LogicalName);
        setSelectedAttribute(array => array.filter(attribute => !attributeNameToRemove.includes(attribute.LogicalName)));
    }

    useEffect(() => {
        setSelectedAttribute([]);
    }, [props.resetTotal]);


    const nodeContent = useMemo(() =>
        !fetchingMetadata
            ?
            <>
                <SelectAttribute attributesMetadata={selectableAttribute} selectAttribute={handleSelectAttribute} />
                <Stack spacing={"2px"} height="100%" sx={{ overflowY: 'scroll', overflowX: 'hidden' }} >
                    {
                        !fetchingValues
                            ?
                            selectedAttribute?.map((metadata) => {
                                // const { isVisible, metadata } = attribute
                                const attributeName = metadata.MStype !== MSType.Lookup ? metadata.LogicalName : "_" + metadata.LogicalName + "_value"
                                return (
                                    <AttributeNode
                                        key={attributeName}
                                        disabled={!metadata.IsValidForUpdate}
                                        attribute={metadata}
                                        entityname={props.entityname}
                                        value={attributesRetrieved[attributeName]}
                                        filter={filter}
                                        resetTotal={props.resetTotal}
                                        attributeToUpdateManager={props.attributeToUpdateManager}
                                        unselectAttribute={handleUnselectAttribute}
                                    />
                                )
                            })
                            :
                            [...Array(16)].map(() => <Skeleton variant='rounded' height={rowHeight + 'px'} />)
                    }
                </Stack>
            </>
            :
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress size={100} thickness={4.5} />
            </div>
        , [fetchingMetadata, fetchingValues, filter, selectedAttribute, selectableAttribute]
    );

    return (nodeContent);
}

type AttributeNodeProps = {
    attribute: AttributeMetadata,
    entityname: string,
    value: any,
    disabled: boolean,
    filter: string,
    resetTotal: boolean,
    attributeToUpdateManager: { setAttributesValue: (key: string, value: any) => void, removeAttributesValue: (key: string) => void }
    unselectAttribute: (selectedAttribute: AttributeMetadata[]) => void
}
const AttributeNode = React.memo((props: AttributeNodeProps) => {
    const { value: isDirty, setTrue, setFalse } = useBoolean(false);
    const manageDirty = { setTrue, setFalse };

    // const { value: valueChanged, toggle: triggerValueChange } = useBoolean(false);
    // const { value: isToUpdate, setTrue: setToUpdate, setFalse: removeToUpdate } = useBoolean(false);
    const { value: toReset, setTrue: setToReset, setFalse: resetToReset } = useBoolean(false);
    const { value: toRemove, setTrue: setToRemove, setFalse: resetToRemove } = useBoolean(false);
    const { value: loading, setTrue: isLoading, setFalse: doneLoading } = useBoolean(true);
    const [isVisible, setIsVisible] = useState<boolean>(true);

    const tooltipText = useMemo(() => {
        return attributeMetadataTooltipGenerator(props.attribute);
    }, [props.attribute]);

    const className: string = useMemo(() =>
        props.disabled ? "disabled" : (isDirty ? "dirty" : ""),
        [props.disabled, isDirty]);
    // const className: string = useMemo(() =>
    //     props.disabled ? "disabled" : (isDirty ? "dirty" : (isToUpdate ? "toupdate" : "")),
    //     [props.disabled, isDirty, isToUpdate]);

    const isVisibleStyle: string = useMemo(() =>
        isVisible ? '' : 'none',
        [isVisible]);

    const backgroundColorStyle: string = useMemo(() =>
        props.disabled ? defaultTheme.palette.grey[200] : (isDirty ? defaultTheme.palette.primary.main : "")
        , [props.disabled, isDirty]);
    // const backgroundColorStyle: string = useMemo(() =>
    //     props.disabled ? defaultTheme.palette.grey[200] : (isDirty ? defaultTheme.palette.secondary.main : (isToUpdate ? defaultTheme.palette.primary.dark : "")),
    //     [props.disabled, isDirty, isToUpdate]);


    useEffect(() => {
        (async () => {
            return (props.attribute.DisplayName.toLowerCase().indexOf(props.filter) !== -1 ||
                props.attribute.LogicalName.indexOf(props.filter) !== -1 ||
                props.attribute.SchemaName.toLowerCase().indexOf(props.filter) !== -1)
        })().then(result => {
            setIsVisible(result);
        });
    }, [props.filter, props.attribute]);

    // useEffect(() => {
    //     if (isToUpdate === false) {
    //         setToReset();
    //     }
    // }, [isToUpdate, setToReset]);

    useEffect(() => {
        if (toReset === true) {
            resetToReset();
        }
    }, [toReset, resetToReset]);

    useEffect(() => {
        if (toRemove === true) {
            resetToRemove();
            props.unselectAttribute([props.attribute]);
        }
    }, [props.unselectAttribute, toRemove, resetToRemove]);

    useUpdateEffect(() => {
        // removeToUpdate();
        setToReset();
    }, [props.resetTotal]);

    useEffect(() => {
        if (props.value !== undefined)
            doneLoading()
    }, [doneLoading, props.value]);

    // const setToUpdateCallback = useCallback(
    //     () => {
    //         if (props.disabled) return;
    //         // setToUpdate();
    //         triggerValueChange();
    //     },
    //     [props.disabled, triggerValueChange],
    // );

    // const doubleClickCallback = useCallback(
    //     () => {
    //         navigator.clipboard.writeText(props.attribute.LogicalName);
    //         setToUpdateCallback();
    //     },
    //     [props.attribute, setToUpdateCallback],
    // );



    const NodeContent: JSX.Element = useMemo(() =>
        <Stack
            borderRadius={theme.shape.borderRadius + "px"}
            direction="row"
            width="100%"
            alignItems="center"
            spacing="2px"
            className={className}
            style={{
                display: isVisibleStyle,
                backgroundColor: backgroundColorStyle
            }}
        >
            <NoMaxWidthTooltip enterDelay={500} title={tooltipText} arrow placement='left' disableFocusListener>
                <Stack
                    height='100%'
                    justifyContent='center'
                    width='80%'
                    overflow='hidden'
                // onDoubleClick={doubleClickCallback}
                >
                    <Typography
                        key={props.attribute.LogicalName + "_label"}
                        // title={props.attribute.DisplayName + "(" + props.attribute.LogicalName + ")"}
                        // width="80%"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                        overflow="hidden"
                        className={className}
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
                // setToUpdate={setToUpdateCallback}
                manageDirty={{ set: manageDirty.setTrue, remove: manageDirty.setFalse }}
                reset={toReset}
                remove={toRemove}
                disabled={props.disabled}
                attributeToUpdateManager={{ ...props.attributeToUpdateManager }}
            />
            {
                (
                    isDirty ?
                        <IconButton title="Restore to initial value" onClick={setToReset} sx={{ padding: '6px' }}>
                            <RestoreIcon fontSize='large' /*htmlColor='ghostwhite'*/ />
                        </IconButton>
                        :
                        <IconButton title="Remove to update list" onClick={setToRemove} sx={{ padding: '6px' }}>
                            <DeleteIcon fontSize='large' /*htmlColor='ghostwhite'*/ />
                        </IconButton>
                )
            }
        </Stack >
        , [className, isVisibleStyle, backgroundColorStyle, tooltipText, props.attribute, props.entityname, props.value, props.disabled, props.attributeToUpdateManager, manageDirty.setTrue, manageDirty.setFalse, toReset, toRemove, setToReset, setToRemove]
    );

    return NodeContent;
});


function AttributeFactory(props: AttributeProps & { entityname: string }) {

    switch (props.attribute.MStype) {
        case MSType.Lookup:
            return (<LookupNode
                attribute={props.attribute}
                // entityname={props.entityname}
                value={props.value}
                // setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                remove={props.remove}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
                theme={theme}
            />);
        case MSType.String:
            return (<StringNode
                attribute={props.attribute}
                // entityname={props.entityname}
                value={props.value}
                // setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                remove={props.remove}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
            />);
        case MSType.Memo:
            return (<MemoNode
                attribute={props.attribute}
                // entityname={props.entityname}
                value={props.value}
                // setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                remove={props.remove}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
            />);
        case MSType.Decimal:
            return (<DecimalNode
                attribute={props.attribute}
                // entityname={props.entityname}
                value={props.value}
                // setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                remove={props.remove}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
            />);
        case MSType.Double:
            return (<DoubleNode
                attribute={props.attribute}
                // entityname={props.entityname}
                value={props.value}
                // setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                remove={props.remove}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
            />);
        case MSType.Money:
            return (<MoneyNode
                attribute={props.attribute}
                // entityname={props.entityname}
                value={props.value}
                // setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                remove={props.remove}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
            />);
        case MSType.Integer:
            return (<IntegerNode
                attribute={props.attribute}
                // entityname={props.entityname}
                value={props.value}
                // setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                remove={props.remove}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
            />);
        case MSType.BigInt:
            return (<BigIntNode
                attribute={props.attribute}
                // entityname={props.entityname}
                value={props.value}
                // setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                remove={props.remove}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
            />);
        case MSType.Boolean:
            return (<BooleanNode
                attribute={props.attribute}
                entityname={props.entityname}
                value={props.value}
                // setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                remove={props.remove}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
            />);
        case MSType.DateTime:
            return (<DateTimeNode
                attribute={props.attribute}
                // entityname={props.entityname}
                value={props.value}
                // setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                remove={props.remove}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
            />);
        case MSType.Status:
            return (<GroupedPicklistNode
                attribute={props.attribute}
                entityname={props.entityname}
                value={props.value}
                // setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                remove={props.remove}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
                groupBy='State'
            />);
        case MSType.State:
            return (<PicklistNode
                attribute={props.attribute}
                entityname={props.entityname}
                value={props.value}
                // setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                remove={props.remove}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
            />);
        case MSType.Picklist:
            return (<PicklistNode
                nullable
                attribute={props.attribute}
                entityname={props.entityname}
                value={props.value}
                // setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                remove={props.remove}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
            />);
        case MSType.MultiSelectPicklist:
            return (<MultiplePicklistNode
                attribute={props.attribute}
                entityname={props.entityname}
                value={props.value}
                // setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                remove={props.remove}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
            />);
        case MSType.Image:
            return (<ImageNode
                attribute={props.attribute}
                // entityname={props.entityname}
                value={props.value}
                // setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                remove={props.remove}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
            />);
        default:
            return (<></>);
    }
}



type NavBarProps = {
    setEntityname: (str: string) => void,
    setRecordsIds: Dispatch<SetStateAction<string[]>>,
    setCurrentRecord: () => void,
    launchUpdate: () => void,
    setFilterAttribute: (str: string) => void,
    entityname: string,
    recordsIds: string[],
}
function NavTopBar(props: NavBarProps) {

    return (
        <Stack key="topbar" spacing={0.5} width="100%">

            {/* <Divider /> */}
            <RecordSearchBar setEntityName={props.setEntityname} setRecordIds={props.setRecordsIds} reset={() => {
                props.setCurrentRecord();
            }} entityName={props.entityname} recordIds={props.recordsIds} />
            <Stack direction={"row"} key="attributesselector" spacing={0.5} width="100%">
                {/* <FilterInput fullWidth returnFilterInput={props.setFilterAttribute} key='attributefilterinput' placeholder='Filter attributes' /> */}
                <Button
                    variant='outlined'
                    fullWidth
                    size='small'
                    onClick={() => {
                        Xrm.Page.ui.refreshRibbon(true)
                    }}
                >
                    Refresh Ribbon
                </Button>
                <Button
                    variant='outlined'
                    fullWidth
                    size='small'
                    onClick={() => {
                        Xrm.Page.data.refresh(false)
                    }}
                >
                    Refresh Form
                </Button>
                <Button
                    variant='contained'
                    fullWidth
                    key='updatebutton'
                    onClick={props.launchUpdate}
                >
                    <RocketLaunchIcon /> Launch Update
                </Button>
            </Stack>
        </Stack>
    );
}


const filterOptions = createFilterOptions<AttributeMetadata>({
    ignoreAccents: true,
    ignoreCase: true,
    matchFrom: "any",
    stringify: (option) => option.DisplayName + "|" + option.LogicalName,
});
interface SelectAttributeProps {
    attributesMetadata: AttributeMetadata[],
    selectAttribute: (selectedAttribute: AttributeMetadata[]) => void,
}
function SelectAttribute(props: SelectAttributeProps) {

    const { attributesMetadata, selectAttribute } = props;

    const [selectedAttributed, setSelectedAttributed] = useState<AttributeMetadata | null>(null);
    const [groupbyEnabled, setGroupbyEnabled] = useState<boolean>(false);
    
    const attributesMetadataInner = useMemo(() => {
        if (groupbyEnabled) {
            return attributesMetadata.sort((a, b)=> a.MStype.localeCompare(b.MStype));
        }
        return attributesMetadata.sort((a, b)=> a.DisplayName.localeCompare(b.DisplayName));
    }, 
    [attributesMetadata, groupbyEnabled]);

    return (
        <Autocomplete
            fullWidth
            value={selectedAttributed}
            filterOptions={filterOptions}
            size='small'
            options={attributesMetadataInner}
            getOptionLabel={(option: AttributeMetadata) => option.DisplayName}
            key='attributeselector'
            autoSelect
            autoComplete
            blurOnSelect
            clearOnBlur
            onChange={(event, option, reason) => { reason === 'selectOption' && option && selectAttribute([option]); }}
            renderInput={(params) => <TextField {...params} label="Search attribute to update" />}
            renderOption={((props: React.HTMLAttributes<HTMLLIElement>, option: AttributeMetadata) => {
                const tooltipText = attributeMetadataTooltipGenerator(option);

                return (
                    <NoMaxWidthTooltip enterDelay={500} title={tooltipText} arrow placement='left' disableFocusListener>
                        <li {...props}>{option.DisplayName}</li>
                    </NoMaxWidthTooltip>
                );
            })}
            groupBy={(option) => groupbyEnabled ? option.MStype : ''}
            ListboxComponent={(props) => {
                return (
                    <div onMouseDown={props.onMouseDown}>
                        <ButtonGroup fullWidth size='small'>
                            <Button onClick={(e) => { setGroupbyEnabled(old => !old) }}>{groupbyEnabled ? "Ungroup" : "Group by Type"}</Button>
                            <Button onClick={(e) => { selectAttribute(attributesMetadata); }}>Select All</Button>
                        </ButtonGroup>
                        <ul {...props} />
                    </div>
                );
            }}
            sx={{
                mt: 0.5,
                mb: 0.5,
            }}
        />
    );
}


const updateRecord = new UpdateRecordButton();
export default updateRecord;


