

// Import statements
import React, {
    Dispatch, forwardRef, SetStateAction, useCallback, useEffect,
    useMemo, useState
} from 'react';
import { useBoolean } from 'usehooks-ts';

// Date picker imports
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';

// Material UI imports
import { Autocomplete, Box, ButtonGroup, createFilterOptions, createTheme, lighten, List, ListItem, ListItemText, TextField, ThemeProvider, Tooltip } from '@mui/material';
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
import { ProcessButton, ProcessProps, ProcessRef } from '../../utils/global/.processClass';
import { AttributeProps, BigIntNode, BooleanNode, DateTimeNode, DecimalNode, DoubleNode, GroupedPicklistNode, ImageNode, IntegerNode, LookupNode, MemoNode, MoneyNode, MultiplePicklistNode, PicklistNode, StringNode } from './nodes';

// Common functions and types
import { debugLog, formatId, StringKeys } from '../../utils/global/common';
import { AttributeMetadata, getReadableMSType, MSDateFormat, MSType } from '../../utils/types/requestsType';

// Xrm API hooks
import { useDictionnary } from '../../utils/hooks/use/useDictionnary';
import { RetrieveAttributes } from '../../utils/hooks/XrmApi/RetrieveAttributes';
import { RetrieveAttributesMetaData } from '../../utils/hooks/XrmApi/RetrieveAttributesMetaData';
import RecordSearchBar from '../../utils/components/RecordSearchBar';
import RestoreIcon from '@mui/icons-material/Restore';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { NoMaxWidthTooltip } from '../../utils/components/NoMaxWidthTooltip';
import SplittedDropDownButton from '../../utils/components/SplittedDropDownButton';
import { useUpdateEffect } from '@custom-react-hooks/all';
import { useSnackbar } from 'notistack';
import { useSpDevTools } from '../../utils/global/spContext';
import { useFormContextDocument } from '../../utils/hooks/use/useFormContextDocument';
import { useXrmUpdated } from '../../utils/hooks/use/useXrmUpdated';
import DropDownButton from '../../utils/components/DropDownButton';
import SettingsIcon from '@mui/icons-material/Settings';

class UpdateRecordButton extends ProcessButton {
    constructor() {
        super(
            'updaterecord',
            'Create / Update Record',
            <SyncIcon />,
            500
        )
        this.process = UpdateRecordProcess
        this.processContainer = (props) => {
            return (
                <ThemeProvider theme={theme}>

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        {props.children}
                    </LocalizationProvider>
                </ThemeProvider>
            )
        }
        this.description = <>
            <Typography><i>Save time and effort with creates and updates.</i></Typography>
            <Typography>With this tool, you can <b>update any field of any record</b> on your environment. You can even update <b>multiple records at once</b> for bulk updates.</Typography>
            <Typography><i>The default record loaded is the currently opened record. You can select different entity and records using the input fields at the top.</i></Typography>
            <Typography>To update a field, select it from the dropdown menu. Then, enter a new value in the corresponding input field. You can always restore the original value if needed.</Typography>
            <Typography>To remove a field from the update list, click the trash bin icon.</Typography>
            <Typography><b>Each field type has a matching input type</b>, such as a text box for text fields or a date picker for date fields. <b>Input fields have an icon that you can click</b> to open a tool that helps with data entry.</Typography>
        </>
    }
}

const ROW_HEIGHT = 42.625;

const defaultTheme = createTheme();
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
});

type AvailableModes = 'update' | 'create';

const UpdateRecordProcess = forwardRef<ProcessRef, ProcessProps>(
    function UpdateRecordProcess(props: ProcessProps, ref) {

        const { isDebug } = useSpDevTools();
        const { enqueueSnackbar } = useSnackbar();
        const { formContext } = useFormContextDocument();
        const { xrmUpdated } = useXrmUpdated();

        const [entityName, _setEntityname] = useState<string>(Xrm.Utility.getPageContext()?.input?.entityName);
        const [recordsIds, setRecordsIds] = useState<string[]>(formContext?.data?.entity ? [formatId(formContext.data?.entity?.getId()?.toLowerCase())] : []);

        const [filterAttribute, setFilterAttribute] = useState<string>("");
        const { dict: attributesValues, keys: attributesValueKeys, setValue: setAttributesValue, removeValue: removeAttributesValue, setDict: setAttributes } = useDictionnary({});
        const attributeToUpdateManager = useMemo(() => ({ setAttributesValue, removeAttributesValue }), [removeAttributesValue, setAttributesValue]);
        const { value: resetAttributes, toggle: toggleResetAttributes } = useBoolean(false);
        const { value: resetEntity, toggle: toggleResetEntity } = useBoolean(false);

        const [selectedMode, setSelectedMode] = useState<AvailableModes>('create');


        const setEntityname = (entityname: string) => {
            setRecordsIds([]);
            _setEntityname(entityname);
        }

        const setCurrentRecord = useCallback(() => {
            const entityName = formContext ? formContext.data?.entity?.getEntityName() : Xrm.Utility.getPageContext()?.input?.entityName;
            const recordid = formatId(formContext?.data?.entity?.getId()?.toLowerCase() ?? '');
            if (!entityName) return;
            setEntityname(entityName);
            setTimeout(() => {
                setRecordsIds(recordid ? [recordid] : []);
            }, 100);

        }, [formContext]);

        useUpdateEffect(() => {
            toggleResetAttributes();
        }, [recordsIds]);

        useUpdateEffect(() => {
            setAttributes({});
            toggleResetEntity();
        }, [entityName]);

        useUpdateEffect(() => {
            if (entityName) return;
            setCurrentRecord();
        }, [xrmUpdated]);

        useEffect(() => {
            const currentEntityName = Xrm.Utility.getPageContext()?.input?.entityName;
            if (!entityName) {
                _setEntityname(currentEntityName);
            }
            if (formContext && entityName === currentEntityName && recordsIds.length === 0) {
                setRecordsIds([formContext.data?.entity?.getId()?.toLowerCase()]);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [formContext]);


        const launchUpdate = useCallback(() => {
            debugLog("Launch Update for", entityName, recordsIds, "with", attributesValues);

            if (recordsIds.length === 0 || attributesValueKeys.length === 0) return;

            Xrm.Utility.showProgressIndicator(`Updating ${recordsIds.length} ${entityName}`);

            recordsIds.forEach((recordid) => {
                Xrm.WebApi.online.updateRecord(entityName, recordid, attributesValues).then(
                    function success(result) {
                        Xrm.Utility.closeProgressIndicator();
                        enqueueSnackbar(
                            entityName + " " + recordid + " updated.",
                            { variant: 'success' }
                        );
                    },
                    function (error) {
                        Xrm.Utility.closeProgressIndicator();
                        enqueueSnackbar(
                            "Updating " + entityName + " " + recordid + " has encountered an error.",
                            {
                                variant: 'detailsFile',
                                detailsVariant: 'error',
                                persist: true,
                                allowDownload: true,
                                detailsNode: <Typography
                                    gutterBottom
                                    variant="caption"
                                    style={{ color: "#000", display: "block" }}
                                >
                                    {`(0x${error.errorCode.toString(16)}) ${error.message}`}
                                </Typography>,
                                downloadButtonLabel: "Download log file",
                                fileContent: error.raw,
                                fileName: "ErrorDetails.txt"
                            }
                        );

                        console.error(error.message);
                    }
                );
            });
        }, [attributesValueKeys.length, attributesValues, enqueueSnackbar, entityName, recordsIds]);

        const launchCreate = useCallback(() => {
            debugLog("Launch Create for", entityName, "with", attributesValues);

            if (attributesValueKeys.length === 0) return;

            Xrm.Utility.showProgressIndicator("Creating " + entityName);
            Xrm.WebApi.online.createRecord(entityName, attributesValues).then(
                function success(result) {
                    Xrm.Utility.closeProgressIndicator();
                    setRecordsIds([result.id]);
                    enqueueSnackbar(
                        entityName + " " + result.id + " created.",
                        { variant: 'success' }
                    );
                },
                function (error) {
                    Xrm.Utility.closeProgressIndicator();
                    enqueueSnackbar(
                        "Creating " + entityName + " has encountered an error.",
                        {
                            variant: 'detailsFile',
                            detailsVariant: 'error',
                            persist: true,
                            allowDownload: true,
                            detailsNode: <Typography
                                gutterBottom
                                variant="caption"
                                style={{ color: "#000", display: "block" }}
                            >
                                {`(0x${error.errorCode.toString(16)}) ${error.message}`}
                            </Typography>,
                            downloadButtonLabel: "Download log file",
                            fileContent: error.raw,
                            fileName: "ErrorDetails.txt"
                        }
                    );

                    console.error(error.message);
                }
            );
        }, [attributesValueKeys.length, attributesValues, enqueueSnackbar, entityName]);


        return (
            <Stack spacing={0.5} width="-webkit-fill-available" padding="10px" height='calc(100% - 10px)'>
                <NavTopBar
                    setEntityname={setEntityname}
                    setRecordsIds={setRecordsIds}
                    setCurrentRecord={setCurrentRecord}
                    launchUpdate={launchUpdate}
                    launchCreate={launchCreate}
                    setFilterAttribute={setFilterAttribute}
                    entityname={entityName}
                    recordsIds={recordsIds}
                    setMode={(mode: AvailableModes) => setSelectedMode(mode)}
                />
                <Divider />
                <AttributesList
                    entityname={entityName}
                    recordsIds={recordsIds}
                    filter={filterAttribute}
                    resetEntity={resetEntity}
                    resetAttributes={resetAttributes}
                    attributeToUpdateManager={attributeToUpdateManager}
                    mode={selectedMode}
                />
                {
                    isDebug.value && <>
                        <Divider />
                        <Typography maxHeight='19px'>{entityName + " / " + recordsIds}</Typography>
                    </>
                }

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
    resetEntity: boolean,
    resetAttributes: boolean,
    attributeToUpdateManager: { setAttributesValue: (key: string, value: any) => void, removeAttributesValue: (key: string) => void }
    mode: AvailableModes
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

    const handleSelectAttribute = useCallback((selectedAttribute: AttributeMetadata[]) => {
        setSelectedAttribute(array => [...array, ...selectedAttribute]);
    }, []);

    const resetAttributes = useCallback(() => {
        setSelectedAttribute([]);
    }, []);

    const handleUnselectAttribute = useCallback((selectedAttribute: AttributeMetadata[]) => {
        const attributeNameToRemove = selectedAttribute.map(attribute => attribute.LogicalName);
        setSelectedAttribute(array => array.filter(attribute => !attributeNameToRemove.includes(attribute.LogicalName)));
    }, []);

    useEffect(() => {
        setSelectedAttribute([]);
    }, [props.resetEntity]);

    return (
        !fetchingMetadata
            ?
            <>
                <SelectAttribute attributesMetadata={selectableAttribute} selectAttribute={handleSelectAttribute} resetAttributes={resetAttributes} mode={props.mode} />
                <Stack spacing={"2px"} height="100%" sx={{ overflowY: 'scroll', overflowX: 'hidden' }} >
                    {
                        !fetchingValues
                            ?
                            selectedAttribute?.map((metadata) => {
                                const attributeName = metadata.MStype !== MSType.Lookup ? metadata.LogicalName : "_" + metadata.LogicalName + "_value"
                                return (
                                    <AttributeNode
                                        key={attributeName}
                                        disabled={props.mode !== 'create' ? !metadata.IsValidForUpdate : !metadata.IsValidForCreate}
                                        attribute={metadata}
                                        entityname={props.entityname}
                                        value={attributesRetrieved[attributeName]}
                                        filter={filter}
                                        resetAttributes={props.resetAttributes}
                                        attributeToUpdateManager={props.attributeToUpdateManager}
                                        unselectAttribute={handleUnselectAttribute}
                                    />
                                )
                            })
                            :
                            [...Array(16)].map(() => <Skeleton variant='rounded' height={ROW_HEIGHT + 'px'} />)
                    }
                </Stack>
            </>
            :
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress size={100} thickness={4.5} />
            </div>
    );
}

type AttributeNodeProps = {
    attribute: AttributeMetadata,
    entityname: string,
    value: any,
    disabled: boolean,
    filter: string,
    resetAttributes: boolean,
    attributeToUpdateManager: { setAttributesValue: (key: string, value: any) => void, removeAttributesValue: (key: string) => void }
    unselectAttribute: (selectedAttribute: AttributeMetadata[]) => void
}
const AttributeNode = React.memo((props: AttributeNodeProps) => {
    const { value: isDirty, setTrue, setFalse } = useBoolean(false);
    const manageDirty = { setTrue, setFalse };

    const { value: toReset, setTrue: setToReset, setFalse: resetToReset } = useBoolean(false);
    const { value: toRemove, setTrue: setToRemove, setFalse: resetToRemove } = useBoolean(false);
    const [isVisible, setIsVisible] = useState<boolean>(true);

    const tooltipText = useMemo(() => {
        return attributeMetadataTooltipGenerator(props.attribute);
    }, [props.attribute]);

    const className: string = useMemo(() =>
        props.disabled ? "disabled" : (isDirty ? "dirty" : ""),
        [props.disabled, isDirty]);

    const isVisibleStyle: string = useMemo(() =>
        isVisible ? '' : 'none',
        [isVisible]);

    const backgroundColorStyle: string = useMemo(() =>
        props.disabled ? defaultTheme.palette.grey[200] : (isDirty ? defaultTheme.palette.primary.main : "")
        , [props.disabled, isDirty]);


    useEffect(() => {
        (async () => {
            return (props.attribute.DisplayName.toLowerCase().indexOf(props.filter) !== -1 ||
                props.attribute.LogicalName.indexOf(props.filter) !== -1 ||
                props.attribute.SchemaName.toLowerCase().indexOf(props.filter) !== -1)
        })().then(result => {
            setIsVisible(result);
        });
    }, [props.filter, props.attribute]);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.unselectAttribute, toRemove, resetToRemove]);

    useUpdateEffect(() => {
        setToReset();
    }, [props.resetAttributes]);


    return (
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
                >
                    <Typography
                        key={props.attribute.LogicalName + "_label"}
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
                manageDirty={{ set: manageDirty.setTrue, remove: manageDirty.setFalse }}
                reset={toReset}
                remove={toRemove}
                disabled={props.disabled}
                attributeToUpdateManager={{ ...props.attributeToUpdateManager }}
            />
            {
                (
                    isDirty ?
                        <IconButton title="Restore to initial value" onClick={setToReset} sx={{ padding: '6px' }} tabIndex={-1}>
                            <RestoreIcon fontSize='large' />
                        </IconButton>
                        :
                        <IconButton title="Remove to update list" onClick={setToRemove} sx={{ padding: '6px' }} tabIndex={-1}>
                            <DeleteIcon fontSize='large' />
                        </IconButton>
                )
            }
        </Stack >
    );
});


function AttributeFactory(props: AttributeProps & { entityname: string }) {

    switch (props.attribute.MStype) {
        case MSType.Lookup:
            return (<LookupNode
                attribute={props.attribute}
                value={props.value}
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
                value={props.value}
                manageDirty={props.manageDirty}
                reset={props.reset}
                remove={props.remove}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
            />);
        case MSType.Memo:
            return (<MemoNode
                attribute={props.attribute}
                value={props.value}
                manageDirty={props.manageDirty}
                reset={props.reset}
                remove={props.remove}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
            />);
        case MSType.Decimal:
            return (<DecimalNode
                attribute={props.attribute}
                value={props.value}
                manageDirty={props.manageDirty}
                reset={props.reset}
                remove={props.remove}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
            />);
        case MSType.Double:
            return (<DoubleNode
                attribute={props.attribute}
                value={props.value}
                manageDirty={props.manageDirty}
                reset={props.reset}
                remove={props.remove}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
            />);
        case MSType.Money:
            return (<MoneyNode
                attribute={props.attribute}
                value={props.value}
                manageDirty={props.manageDirty}
                reset={props.reset}
                remove={props.remove}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
            />);
        case MSType.Integer:
            return (<IntegerNode
                attribute={props.attribute}
                value={props.value}
                manageDirty={props.manageDirty}
                reset={props.reset}
                remove={props.remove}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
            />);
        case MSType.BigInt:
            return (<BigIntNode
                attribute={props.attribute}
                value={props.value}
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
                manageDirty={props.manageDirty}
                reset={props.reset}
                remove={props.remove}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
            />);
        case MSType.DateTime:
            return (<DateTimeNode
                attribute={props.attribute}
                value={props.value}
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
                manageDirty={props.manageDirty}
                reset={props.reset}
                remove={props.remove}
                disabled={props.disabled}
                attributeToUpdateManager={props.attributeToUpdateManager}
            />);
        case MSType.Image:
            return (<ImageNode
                attribute={props.attribute}
                value={props.value}
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
    launchCreate: () => void,
    setFilterAttribute: (str: string) => void,
    entityname: string,
    recordsIds: string[],
    setMode: (mode: AvailableModes) => void
}
function NavTopBar(props: NavBarProps) {

    return (
        <Stack key="topbar" spacing={0.5} width="100%">

            <RecordSearchBar
                setEntityName={props.setEntityname}
                setRecordIds={props.setRecordsIds}
                reset={props.setCurrentRecord}
                entityName={props.entityname}
                recordIds={props.recordsIds}
                multiple
            />


            <Stack direction={"row"} key="attributesselector" spacing={4} width="100%">

                <Stack direction='row' spacing={0.5} alignItems='center' width="100%">

                    <Typography>Refresh:</Typography>

                    <ButtonGroup variant='outlined' fullWidth size='small' orientation='horizontal'>
                        <Button
                            onClick={() => {
                                Xrm.Page.ui.refreshRibbon(true)
                            }}
                        >
                            Ribbon
                        </Button>
                        <Button
                            onClick={() => {
                                Xrm.Page.data.refresh(false)
                            }}
                        >
                            Form
                        </Button>
                    </ButtonGroup>
                </Stack>
                <SplittedDropDownButton
                    options={[
                        {
                            title: <Stack direction='row' spacing={2}><RocketLaunchIcon /> <div>Launch Create</div></Stack>,
                            action: props.launchCreate,
                            onSelect: () => props.setMode('create'),
                        },
                        {
                            title: <Stack direction='row' spacing={2}><RocketLaunchIcon /> <div>Launch Update</div></Stack>,
                            action: props.launchUpdate,
                            onSelect: () => props.setMode('update'),
                        },
                    ]}
                    actionIndex={props.recordsIds.length === 0 ? 0 : 1}
                />
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
    resetAttributes: () => void,
    mode: AvailableModes
}
function SelectAttribute(props: SelectAttributeProps) {

    const { attributesMetadata, selectAttribute, mode, resetAttributes } = props;

    const [groupby, setGroupby] = useState<StringKeys<AttributeMetadata> | null>(null);

    const attributesMetadataInner = useMemo(() => {
        const nameSort = attributesMetadata.sort((a, b) => a.DisplayName.localeCompare(b.DisplayName));
        if (groupby === 'RequiredLevel') {
            const order: AttributeMetadata['RequiredLevel'][] = ['ApplicationRequired', 'Recommended', 'SystemRequired', 'None'];
            return order.flatMap(requiredLevel => nameSort.filter(att => att.RequiredLevel === requiredLevel));
        }
        if (groupby) {
            return nameSort.sort((a, b) => a[groupby].localeCompare(b[groupby]));
        }
        return nameSort;
    }, [attributesMetadata, groupby]);

    const selectGroup = useCallback((groupByText: string) => {
        if (groupby) {
            const selectedAttributes = attributesMetadata.filter((a) => a[groupby] === groupByText);
            selectAttribute(selectedAttributes);
        }
    }, [attributesMetadata, groupby, selectAttribute]);

    return (
        <Stack direction='row' spacing={0}>
            <Autocomplete
                fullWidth
                value={null}
                filterOptions={filterOptions}
                size='small'
                options={attributesMetadataInner}
                getOptionLabel={(option: AttributeMetadata) => option.DisplayName}
                key='attributeselector'
                autoSelect
                autoComplete
                blurOnSelect
                clearOnBlur
                // onChange={(event, option, reason) => { reason === 'selectOption' && option && selectAttribute([option]); }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Search attribute to update"
                        slotProps={{
                            input: {
                                ...params.InputProps,
                                sx: {
                                    borderTopRightRadius: 0,
                                    borderBottomRightRadius: 0,
                                }
                            }
                        }}
                    />
                )}
                renderOption={((renderProps: React.HTMLAttributes<HTMLLIElement>, option: AttributeMetadata) => {
                    const tooltipText = attributeMetadataTooltipGenerator(option);

                    const disabled = (mode === 'update' && !option.IsValidForUpdate) || (mode === 'create' && !option.IsValidForCreate);

                    return (
                        <NoMaxWidthTooltip enterDelay={500} title={tooltipText} arrow placement='left' disableFocusListener>
                            <ListItem key={`selectAttribute-option-${option.LogicalName}`} {...renderProps} sx={{ ...(disabled && { color: 'text.disabled' }), py: '0 !important' }} onClick={() => selectAttribute([option])}>
                                <ListItemText>
                                    {option.DisplayName}
                                </ListItemText>
                            </ListItem>
                        </NoMaxWidthTooltip>
                    );
                })}
                groupBy={(option) => groupby ? option[groupby] : ''}
                renderGroup={(params) => (
                    <>
                        {params.group &&
                            <ListItem key={params.key} sx={(theme) => ({ bgcolor: lighten(theme.palette.primary.main, 0.9) })}>
                                <ListItemText sx={{ color: 'text.secondary' }}>
                                    {params.group.replace("Microsoft.Dynamics.CRM.", "").replace("AttributeMetadata", "")}
                                </ListItemText>
                                <Button onClick={() => selectGroup(params.group)}>Select Group</Button>
                            </ListItem>
                        }
                        <List key={`selectAttribute-group-${params.key}-options`} sx={{ ...(params.group && { ml: 1, pt: 0.5 }) }}>
                            {params.children}
                        </List>
                    </>
                )}
                sx={{
                    my: 0.5,
                }}
            />
            <DropDownButton
                title={<SettingsIcon />}
                variant='outlined'
                options={[
                    {
                        id: 'ungroup',
                        title: "Ungroup",
                        disabled: !groupby,
                        onClick: () => setGroupby(null)
                    },
                    {
                        id: 'groupByRequirement',
                        title: "Group by Requirement Level",
                        disabled: groupby === 'RequiredLevel',
                        onClick: () => setGroupby('RequiredLevel')
                    },
                    {
                        id: 'groupByType',
                        title: "Group by Type",
                        disabled: groupby === 'MStype',
                        onClick: () => setGroupby('MStype')
                    },
                    {
                        id: 'selectAll',
                        title: 'Select All Attributes',
                        onClick: () => selectAttribute(attributesMetadata)
                    },
                ]}
                sx={{
                    my: 0.5,
                    // borderRadius: 0,
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                }}
            />
            <Tooltip title={<Typography variant='h6'>Clear Selection</Typography>} arrow disableInteractive placement='top'>
                <Button
                    onClick={resetAttributes}
                    size="small"
                    sx={{
                        my: 0.5,
                        ml: 0.5,
                        // borderTopLeftRadius: 0,
                        // borderBottomLeftRadius: 0,
                    }}
                >
                    Clear
                </Button>
            </Tooltip>
        </Stack>
    );
}


const updateRecord = new UpdateRecordButton();
export default updateRecord;


