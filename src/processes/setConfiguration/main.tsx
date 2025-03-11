
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../../utils/global/.processClass';

import Processes, { defaultProcessesList } from '../.list';
import { MessageType } from '../../utils/types/Message';
import { debugLog } from '../../utils/global/common';
import { StorageConfiguration } from '../../utils/types/StorageConfiguration';
import { DragDropContext, Draggable, DropResult, Droppable } from '@hello-pangea/dnd';
import { STORAGE_ForegroundPanes, STORAGE_ListName } from '../../utils/global/var';
import SettingsIcon from '@mui/icons-material/Settings';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Tooltip, { TooltipProps } from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MessageManager from '../../utils/global/MessageManager';

class SetConfigurationButton extends ProcessButton {
    constructor() {
        super(
            'createconfiguration',
            'Configuration Manager',
            <SettingsIcon />,
            320
        );
        this.process = SetConfigurationProcess;
        this.description = <>
            <Typography><i>Configure your SidePanel Tools experience.</i></Typography>
            <Typography>This tool lets you select which tools <b>automatically open</b> when a page loads. You can also specify a tool to be <b>expanded by default</b>.</Typography>
            <Typography>A <i>"foreground"</i> option is available to <u>disable automatic width adjustments</u> of the main Dynamics screen.</Typography>
        </>
    }
}

const listOpenId = "Opened_Tools";
const listAvalaibleId = "Avalaible_Tools";


interface ProcessItemProps {
    process: StorageConfiguration
    index: number
}
function ProcessItem(props: ProcessItemProps) {
    const { index, process } = props;

    const processButton = useMemo(() => Processes.find(processButton => processButton.id === process.id), [process]);

    return (
        processButton?.openable ?
            <Draggable draggableId={process.id} index={index} key={process.id + 'draggable'}>
                {
                    providerDraggable => (
                        <Box
                            key={process.id + 'contentbox'}
                            ref={providerDraggable.innerRef}
                            {...providerDraggable.draggableProps}
                            {...providerDraggable.dragHandleProps}
                        >
                            <Stack
                                direction='row'
                                spacing={1}
                                justifyContent='center'
                                key={processButton?.id + 'content'}
                                sx={{
                                    bgcolor: 'primary.main',//rgb(21, 101, 192)
                                    color: 'primary.contrastText',
                                    borderRadius: 1,
                                    pt: 0.75,
                                    pb: 0.75,
                                    pl: 2,
                                    pr: 2,
                                }}
                            >
                                <Typography variant='button'>
                                    {processButton?.menuButtonName ?? "Name not found"}
                                </Typography>
                                {processButton?.menuButtonIcon}
                            </Stack>
                        </Box>
                    )
                }
            </Draggable>
            : <></>
    )
}

interface ProcessListProps {
    title: string
    titleButton?: { label: string, onClick: () => void }
    tooltip?: React.ReactNode
    processList: StorageConfiguration[]
    isDragging: boolean
}
function ProcessList(props: ProcessListProps) {
    const { processList, title, titleButton, isDragging, tooltip } = props;

    return (
        <>
            <Stack direction='row' justifyContent='space-between' alignItems='center'>
                <Typography variant='h6'>{title.replaceAll('_', ' ')}</Typography>
                <Stack direction='row' spacing={1} alignItems='center'>

                    {
                        titleButton && (
                            <Button variant='outlined' size='small' onClick={titleButton.onClick}>
                                {titleButton.label}
                            </Button>
                        )
                    }
                    {
                        tooltip && (
                            <Tooltip
                                placement='left'
                                arrow
                                disableInteractive
                                title={tooltip}
                                slotProps={{
                                    tooltip: {
                                        sx: {
                                            fontSize: '1.2rem',
                                            p: 0,
                                            maxWidth: '540px'
                                        }
                                    },
                                    arrow: {
                                        sx: {
                                            "::before": {
                                                bgcolor: 'rgb(229, 246, 253)'
                                            }
                                        }
                                    },
                                }}
                            >
                                <HelpOutlineIcon sx={{ opacity: 0.7 }} />
                            </Tooltip>
                        )
                    }
                </Stack>
            </Stack>
            <Droppable droppableId={title} key={title + 'draggable'}>
                {
                    providerDroppable => (
                        <Paper
                            ref={providerDroppable.innerRef}
                            {...providerDroppable.droppableProps}
                            elevation={0}
                            sx={{
                                ...(isDragging && { bgcolor: 'grey.400' }),
                                transition: 'background-color 200ms ease-in-out',
                                py: 0.5,
                                px: 1,
                            }}
                        >
                            <Stack
                                direction='column'
                                spacing={0.5}
                                height='100%'
                                width='100%'
                                sx={{
                                    whiteSpace: 'nowrap',
                                    minHeight: 2,
                                }}
                            >
                                {
                                    processList.map((process, index) => {
                                        return <ProcessItem index={index} process={process} key={process.id + 'item'} />
                                    })
                                }
                                {providerDroppable.placeholder}
                            </Stack>
                        </Paper>
                    )
                }
            </Droppable>
        </>
    );
}


function sortProcessesByStartOnPosition(processA: StorageConfiguration, processB: StorageConfiguration) { return processA.startOnPosition !== undefined && processB.startOnPosition !== undefined ? processA.startOnPosition - processB.startOnPosition : 0; }

const SetConfigurationProcess = forwardRef<ProcessRef, ProcessProps>(
    function SetConfigurationProcess(props: ProcessProps, ref) {

        const [processesList, setProcessesList] = useState<StorageConfiguration[]>(defaultProcessesList);
        const [configurationSaved, setConfigurationSaved] = useState<boolean>(false);

        const [isForegroundPanes, setIsForegroundPanes] = useState<boolean>(false);
        const [isDragging, setIsDragging] = useState(false);



        useEffect(() => {
            MessageManager.sendMessage(MessageType.GETCONFIGURATION, { key: STORAGE_ListName }).then(
                function (response: StorageConfiguration[] | null) {
                    setProcessesList(response ?? []);
                }
            );
            MessageManager.sendMessage(MessageType.GETCONFIGURATION, { key: STORAGE_ForegroundPanes }).then(
                function (response: boolean | null) {
                    setIsForegroundPanes(response ?? false);
                }
            );
        }, []);


        const createConfiguration = useCallback(() => {

            const processConfigurations: StorageConfiguration[] = Processes.map(process => {
                const opened = processesList.find(c => c.id === process.id);
                if (opened) {
                    return opened;
                }
                return {
                    id: process.id,
                    startOnLoad: false,
                    expand: false,
                    hidden: false,
                    options: process?.getConfiguration(),
                }
            });

            debugLog(processConfigurations);
            MessageManager.sendMessage(MessageType.SETCONFIGURATION, { key: STORAGE_ListName, configurations: processConfigurations });
            MessageManager.sendMessage(MessageType.SETCONFIGURATION, { key: STORAGE_ForegroundPanes, configurations: isForegroundPanes });
        }, [isForegroundPanes, processesList]);

        const saveConfiguration = useCallback(() => {
            debugLog("saveConfiguration", processesList);

            createConfiguration();

            setConfigurationSaved(true);
            setTimeout(() => {
                setConfigurationSaved(false);
            }, 2000);
        }, [createConfiguration, processesList]);

        const openedProcesses = useMemo(() => {
            const opened = processesList.filter(process => process.startOnLoad)
            opened.sort(sortProcessesByStartOnPosition);
            debugLog("openedProcesses", opened);
            return opened;
        }, [processesList]);

        const closedProcesses = useMemo(() => Processes.map(processButton => processesList.find(process => !process.startOnLoad && process.id === processButton.id)).filter((p): p is StorageConfiguration => !!p), [processesList]);

        const onDragStart = useCallback(() => {
            setIsDragging(true);
        }, []);

        const onDragEnd = useCallback((result: DropResult) => {
            setIsDragging(false);

            if (!result.destination) {
                return;
            }

            if (result.destination.index === result.source.index && result.destination.droppableId === result.source.droppableId) {
                return;
            }

            setProcessesList(previousProcessList => {
                const updatedProcess = previousProcessList.find(process => process.id === result.draggableId);
                if (!updatedProcess) {
                    return previousProcessList;
                }

                const startOnLoad = result.destination?.droppableId === listOpenId;
                updatedProcess.startOnLoad = startOnLoad;

                const openedProcess = previousProcessList.filter(process => process.startOnLoad && process.id !== result.draggableId)
                    .sort(sortProcessesByStartOnPosition);
                if (startOnLoad) {
                    openedProcess.splice(result.destination!.index, 0, updatedProcess);
                }
                for (let i = 0; i < openedProcess.length; i++) {
                    openedProcess[i].startOnPosition = i;
                }

                const closedProcess = previousProcessList.filter(process => !process.startOnLoad && process.id !== result.draggableId);
                if (!startOnLoad) {
                    closedProcess.splice(result.destination!.index, 0, updatedProcess);
                }
                for (let i = 0; i < closedProcess.length; i++) {
                    closedProcess[i].startOnPosition = undefined;
                    closedProcess[i].expand = false;
                    closedProcess[i].startOnLoad = false;
                }
                return [...openedProcess, ...closedProcess];
            });
        }, []);

        const reset = useCallback(() => {
            setProcessesList(previousProcessList => {
                const updatedProcesses = [...previousProcessList];
                for (let i = 0; i < updatedProcesses.length; i++) {
                    updatedProcesses[i].startOnPosition = undefined;
                    updatedProcesses[i].expand = false;
                    updatedProcesses[i].startOnLoad = false;
                }
                return updatedProcesses;
            });
        }, []);


        return (
            <Stack direction='column' spacing={1} width='-webkit-fill-available' height='calc(100% - 20px)' padding='10px'>

                <Alert severity='info' sx={{ py: 0 }}>
                    <Typography variant='body2'>
                        The saved configuration will be applied after refreshing the page.
                    </Typography>
                </Alert>

                <Button variant='contained' onClick={saveConfiguration}>
                    {configurationSaved ? "Saved" : "Save Configuration"}
                </Button>


                <Divider />

                <HelpInfo
                    placement='left'
                    arrow
                    disableInteractive
                    title={
                        <Typography variant='body2'>
                            Enable/Disable automatic width adjustments of the main Dynamics screen.
                        </Typography>
                    }
                >
                    <FormControl fullWidth sx={{ pl: 2 }}>
                        <FormControlLabel control={<Switch checked={isForegroundPanes} onChange={() => setIsForegroundPanes(prev => !prev)} />} label="Foreground Panes" />
                    </FormControl>
                </HelpInfo>

                <Divider />

                <HelpInfo
                    placement='left'
                    arrow
                    disableInteractive
                    title={
                        <Typography variant='body2'>
                            The selected tool will be expanded by default when the page loads.
                        </Typography>
                    }
                >
                    <Autocomplete
                        size='small'
                        fullWidth
                        disabled={processesList.filter(process => process.startOnLoad).length === 0}
                        value={processesList.find(process => process.expand) ?? null}
                        onChange={(event: any, newValue: StorageConfiguration | null) => {
                            setProcessesList(previousProcessList => {
                                const newProcessList = [...previousProcessList];
                                for (let i = 0; i < newProcessList.length; i++) {
                                    newProcessList[i].expand = newValue?.id === newProcessList[i].id;
                                }
                                return newProcessList;
                            });
                        }}
                        options={Processes.map(processButton => processButton.isPanelProcess && openedProcesses.find(p => p.id === processButton.id)).filter((p): p is StorageConfiguration => !!p)}
                        renderInput={(params) => <TextField
                            {...params}
                            label="Expanded Tool"
                            slotProps={{
                                input: {
                                    ...params.InputProps,
                                    endAdornment: <>
                                        {Processes.find(processButton => processButton.menuButtonName === params.inputProps.value)?.menuButtonIcon}
                                        {params.InputProps.endAdornment}
                                    </>
                                }
                            }}
                        />}
                        getOptionLabel={(option) => Processes.find(processButton => processButton.id === option.id)?.menuButtonName ?? "Name not found"}
                        renderOption={(props, option, state) => {
                            const processButton = Processes.find(processButton => processButton.id === option.id);
                            return (
                                <Stack
                                    direction='row'
                                    spacing={1}
                                    justifyContent='center'
                                    sx={{
                                        borderRadius: '8px',
                                        margin: '5px',
                                    }}
                                    component="li"
                                    {...props}
                                >
                                    <Typography variant='button'>
                                        {processButton?.menuButtonName ?? option.id}
                                    </Typography>
                                    {processButton?.menuButtonIcon}
                                </Stack>
                            )
                        }}
                        sx={{
                            mt: 1
                        }}
                    />
                </HelpInfo>

                < Divider />

                <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd} >
                    <Stack direction='column' spacing={1} height='100%' width='100%' overflow='auto'>

                        <ProcessList
                            title={listOpenId}
                            processList={openedProcesses}
                            isDragging={isDragging}
                            tooltip={
                                <Alert severity='info'>
                                    <Typography variant='body2'>
                                        Drag and drop tools you want to open when the page loads.
                                    </Typography>
                                </Alert>
                            }
                            titleButton={{ label: 'Reset', onClick: reset }}

                        />

                        <Divider />

                        <ProcessList
                            title={listAvalaibleId}
                            processList={closedProcesses}
                            isDragging={isDragging}
                        />

                    </Stack>
                </DragDropContext>

            </Stack >
        );
    }
);

function HelpInfo(props: Omit<TooltipProps, 'slotProps'>) {
    const { children, title, ...otherProps } = props;

    return (
        <Stack direction='row' spacing={2} width='100%' justifyContent='space-between' alignItems='center'>
            {children}
            <Tooltip
                {...otherProps}
                title={
                    <Alert severity='info'>
                        {title}
                    </Alert>
                }
                slotProps={{
                    tooltip: {
                        sx: {
                            fontSize: '1.2rem',
                            p: 0,
                            maxWidth: '540px'
                        }
                    },
                    arrow: {
                        sx: {
                            "::before": {
                                bgcolor: 'rgb(229, 246, 253)'
                            }
                        }
                    },
                }}
            >
                <HelpOutlineIcon sx={{ opacity: 0.7 }} />
            </Tooltip>
        </Stack>
    )
}

const createConfiguration = new SetConfigurationButton();
export default createConfiguration;