
import { Autocomplete, Box, Button, Divider, FormControl, FormControlLabel, Stack, Switch, TextField, Typography } from '@mui/material';
import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../../utils/global/.processClass';



import SaveIcon from '@mui/icons-material/Save';
import Processes, { defaultProcessesList } from '../.list';
import { MessageType } from '../../utils/types/Message';
import { GetExtensionId, debugLog } from '../../utils/global/common';
import { StorageConfiguration } from '../../utils/types/StorageConfiguration';
import { DragDropContext, Draggable, DraggableProvided, DropResult, Droppable } from '@hello-pangea/dnd';
import { storageForegroundPanes, storageListName, storageStandardPanels } from '../../utils/global/var';


class SetConfigurationButton extends ProcessButton {
    constructor() {
        super(
            'createconfiguration',
            'Configuration Manager',
            <SaveIcon />,
            300
        );
        this.process = SetConfigurationProcess;
    }
}

const listOpenId = "Opened_Processes";
const listAvalaibleId = "Avalaible_Processes";


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
                                    {processButton?.name ?? "Name not found"}
                                </Typography>
                                {processButton?.icon}
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
    processList: StorageConfiguration[]
    forceHeight?: string
}
function ProcessList(props: ProcessListProps) {
    const { processList, title, forceHeight, titleButton } = props;

    return (
        <>
            <Stack direction='row' justifyContent='space-between'>
                <Typography variant='h6'>{title.replaceAll('_', ' ')}</Typography>
                {
                    titleButton && (
                        <Button onClick={titleButton.onClick}>
                            {titleButton.label}
                        </Button>
                    )
                }
            </Stack>
            <Stack direction='row' height={forceHeight ?? '100%'} width='100%' sx={{ overflowY: 'auto' }}>
                <Droppable droppableId={title} key={title + 'draggable'}>
                    {
                        providerDroppable => (
                            <Box
                                ref={providerDroppable.innerRef}
                                {...providerDroppable.droppableProps}
                                height='100%'
                                width='100%'
                            >
                                <Stack
                                    direction='column'
                                    spacing={0.5}
                                    height='100%'
                                    width='100%'
                                    sx={{ whiteSpace: 'nowrap' }}
                                >
                                    {
                                        processList.map((process, index) => {
                                            return <ProcessItem index={index} process={process} key={process.id + 'item'} />
                                        })
                                    }
                                    {providerDroppable.placeholder}
                                </Stack>
                            </Box>
                        )
                    }
                </Droppable>
            </Stack>
        </>
    );
}


function sortProcessesByStartOnPosition(processA: StorageConfiguration, processB: StorageConfiguration) { return processA.startOnPosition !== undefined && processB.startOnPosition !== undefined ? processA.startOnPosition - processB.startOnPosition : 0; }

const SetConfigurationProcess = forwardRef<ProcessRef, ProcessProps>(
    function SetConfigurationProcess(props: ProcessProps, ref) {

        const extensionId = GetExtensionId();
        const isOnPrem: boolean = (Xrm.Utility.getGlobalContext() as any).isOnPremises();

        const [processesList, setProcessesList] = useState<StorageConfiguration[]>(defaultProcessesList);
        const [configurationSaved, setConfigurationSaved] = useState<boolean>(false);

        const [useStandardPanels, setUseStandardPanels] = useState<boolean>(false);
        const [isForegroundPanes, setIsForegroundPanes] = useState<boolean>(false);


        useEffect(() => {
            chrome.runtime.sendMessage(extensionId, { type: MessageType.GETCONFIGURATION, data: { key: storageListName } },
                function (response: StorageConfiguration[] | null) {
                    setProcessesList(response ?? []);
                }
            );
            chrome.runtime.sendMessage(extensionId, { type: MessageType.GETCONFIGURATION, data: { key: storageStandardPanels } },
                function (response: boolean | null) {
                    setUseStandardPanels(response ?? false);
                }
            );
            chrome.runtime.sendMessage(extensionId, { type: MessageType.GETCONFIGURATION, data: { key: storageForegroundPanes } },
                function (response: boolean | null) {
                    setIsForegroundPanes(response ?? false);
                }
            );
        }, []);


        function CreateConfiguration() {

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
            chrome.runtime.sendMessage(extensionId, { type: MessageType.SETCONFIGURATION, data: { key: storageListName, configurations: processConfigurations } },
                function (response) {
                    if (response.success) { }
                }
            );
            chrome.runtime.sendMessage(extensionId, { type: MessageType.SETCONFIGURATION, data: { key: storageStandardPanels, configurations: useStandardPanels } },
                function (response) {
                    if (response.success) { }
                }
            );
            chrome.runtime.sendMessage(extensionId, { type: MessageType.SETCONFIGURATION, data: { key: storageForegroundPanes, configurations: isForegroundPanes } },
                function (response) {
                    if (response.success) { }
                }
            );
        }

        const saveConfiguration = () => {
            debugLog("saveConfiguration", processesList);

            CreateConfiguration();

            setConfigurationSaved(true);
            setTimeout(() => {
                setConfigurationSaved(false);
            }, 2000);
        }

        const openedProcesses = useMemo(() => {
            const opened = processesList.filter(process => process.startOnLoad)
            opened.sort(sortProcessesByStartOnPosition);
            debugLog("openedProcesses", opened);
            return opened;
        }, [processesList]);

        const closedProcesses = useMemo(() => Processes.map(processButton => processesList.find(process => !process.startOnLoad && process.id === processButton.id)).filter((p): p is StorageConfiguration => !!p), [Processes, processesList]);

        function onDragEnd(result: DropResult) {
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
        }

        function reset() {
            setProcessesList(previousProcessList => {
                const updatedProcesses = [...previousProcessList];
                for (let i = 0; i < updatedProcesses.length; i++) {
                    updatedProcesses[i].startOnPosition = undefined;
                    updatedProcesses[i].expand = false;
                    updatedProcesses[i].startOnLoad = false;
                }
                return updatedProcesses;
            });
        }

        return (
            <Stack direction='column' spacing={1} width='-webkit-fill-available' height='calc(100% - 20px)' padding='10px'>
                <Button variant='contained' onClick={saveConfiguration}>
                    {configurationSaved ? "Saved" : "Save Configuration"}
                </Button>

                <Typography variant='caption'>
                    The saved configuration will be applied after refreshing.
                </Typography>

                <Divider />

                <FormControl fullWidth  sx={{ pl: 2 }}>
                    <FormControlLabel control={<Switch checked={isForegroundPanes} onChange={() => setIsForegroundPanes(prev => !prev)} />} label="Foreground Panes" />
                    {!isOnPrem && <FormControlLabel control={<Switch checked={useStandardPanels} onChange={() => setUseStandardPanels(prev => !prev)} />} label="Use Standard Panels" />}
                </FormControl>

                <Divider />

                <Autocomplete
                    size='small'
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
                    options={Processes.map(processButton => processesList.filter(process => process.startOnLoad).find(p => p.id === processButton.id)).filter((p): p is StorageConfiguration => !!p)}
                    renderInput={(params) => <TextField {...params} label="Selected Process" InputProps={{ ...params.InputProps, endAdornment: <>{Processes.find(processButton => processButton.name === params.inputProps.value)?.icon} {params.InputProps.endAdornment}</> }} />}
                    getOptionLabel={(option) => Processes.find(processButton => processButton.id === option.id)?.name ?? "Name not found"}
                    renderOption={(props, option, state) => {
                        const processButton = Processes.find(processButton => processButton.id === option.id)
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
                                    {processButton?.name ?? option.id}
                                </Typography>
                                {processButton?.icon}
                            </Stack>
                        )
                    }}
                    sx={{
                        mt: 1
                    }}
                />

                < Divider />

                <Stack direction='row' height='100%'>

                    <DragDropContext onDragEnd={onDragEnd} >
                        <Stack direction='column' spacing={1} height='100%' width='100%'>

                            <ProcessList title={listOpenId} processList={openedProcesses} titleButton={{ label: 'Reset', onClick: reset }} />

                            <Divider />

                            <ProcessList title={listAvalaibleId} processList={closedProcesses} />

                        </Stack>
                    </DragDropContext>

                </Stack>
            </Stack >
        );
    }
);

const createConfiguration = new SetConfigurationButton();
export default createConfiguration;