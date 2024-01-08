
import { Autocomplete, Box, Button, Divider, Stack, TextField, Typography } from '@mui/material';
import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../../utils/global/.processClass';



import SaveIcon from '@mui/icons-material/Save';
import Processes, { defaultProcessesList, storageListName } from '../.list';
import { MessageType } from '../../utils/types/Message';
import { GetExtensionId, debugLog } from '../../utils/global/common';
import { StorageConfiguration } from '../../utils/types/StorageConfiguration';
import { DragDropContext, Draggable, DraggableProvided, DropResult, Droppable } from '@hello-pangea/dnd';


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
                                {process.startOnPosition?.toString() ?? "-1"}
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
    processList: StorageConfiguration[]
    forceHeight?: string
}
function ProcessList(props: ProcessListProps) {
    const { processList, title, forceHeight } = props;

    return (
        <>
            <Typography variant='h6'>{title.replaceAll('_', ' ')}</Typography>
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


const SetConfigurationProcess = forwardRef<ProcessRef, ProcessProps>(
    function SetConfigurationProcess(props: ProcessProps, ref) {

        const extensionId = GetExtensionId();

        const [processesList, setProcessesList] = useState<StorageConfiguration[]>(defaultProcessesList);


        useEffect(() => {
            chrome.runtime.sendMessage(extensionId, { type: MessageType.GETCONFIGURATION, data: { key: storageListName } },
                function (response: StorageConfiguration[]) {
                    setProcessesList(response ?? []);
                }
            );
        }, []);


        function CreateConfiguration() {
            // allOpenPanes = Xrm.App.sidePanes.getAllPanes().get(); //getAllPanes(): Collection.ItemCollection<App.PaneObject>;
            // selectedPane = Xrm.App.sidePanes.getSelectedPane();
            // allOpenPanes.shift();

            // const openConfigurations: StorageConfiguration[] = allOpenPanes.filter(pane => pane.paneId?.startsWith(ProcessButton.prefixId)).map((openPane: Xrm.App.PaneObject, index: number) => {
            //     return {
            //         id: openPane.paneId!,
            //         startOnLoad: true,
            //         startOnPosition: index,
            //         expand: !!openPane.paneId && !!selectedPane && openPane.paneId === selectedPane.paneId,
            //         hidden: false,
            //         options: Processes.find(p => p.id === openPane.paneId)?.getConfiguration(),
            //     }
            // });

            const configurations: StorageConfiguration[] = Processes.map(process => {
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

            debugLog(configurations);
            chrome.runtime.sendMessage(extensionId, { type: MessageType.SETCONFIGURATION, data: { key: storageListName, configurations: configurations } },
                function (response) {
                    if (response.success) {
                    }
                }
            );
        }

        // const message = useMemo(() => <>
        //     <p>The configuration store the opened side panels and the active side panel. At next loadings the same layout will be duplicated.</p>
        //     <p>If you want to have opened panels with no active panel, save the configuration when the main menu is active.</p>
        // </>, []);

        const saveConfiguration = () => {
            debugLog("saveConfiguration", processesList);
            CreateConfiguration();
        }

        const openedProcesses = useMemo(() => processesList.filter(process => process.startOnLoad).sort((processA, processB) => (processA.startOnPosition && processB.startOnPosition && processA.startOnPosition - processB.startOnPosition) ?? 0), [processesList]);

        const closedProcesses = useMemo(() => Processes.map(processButton => processesList.find(process => !process.startOnLoad && process.id === processButton.id)).filter((p): p is StorageConfiguration => !!p), [Processes, processesList]);

        // useEffect(() => {
        //     debugLog("processesList", processesList);
        // }, [processesList]);

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
                    .sort((processA, processB) => (processA.startOnPosition && processB.startOnPosition && processA.startOnPosition - processB.startOnPosition) ?? 0);
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

        return (
            <Stack direction='column' spacing={1} width='-webkit-fill-available' height='calc(100% - 20px)' padding='10px'>
                <Button variant='contained' onClick={saveConfiguration}>
                    Save Configuration
                </Button>

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

                            // if (!newValue) {
                            //     const unselectedProcess = [...previousProcessList];
                            //     for (let i = 0; i < unselectedProcess.length; i++) {
                            //         unselectedProcess[i].expand = false;
                            //     }
                            //     return unselectedProcess;
                            // }
                            // const selectedProcess = previousProcessList.find(p => p.id === newValue.id);
                            // if (!selectedProcess) {
                            //     return previousProcessList;
                            // }
                            // selectedProcess.expand = true;
                            // const unselectedProcess = previousProcessList.filter(p => p.id !== newValue.id);
                            // for (let i = 0; i < unselectedProcess.length; i++) {
                            //     unselectedProcess[i].expand = false;
                            // }
                            // return [...unselectedProcess, selectedProcess].sort((processA, processB) => (processA.startOnPosition && processB.startOnPosition && processA.startOnPosition - processB.startOnPosition) ?? 0);
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
                                    // [`&.${autocompleteClasses.option}`]: {
                                    //     padding: '8px',
                                    // },
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
                />

                < Divider />

                <Stack direction='row' height='100%'>

                    <DragDropContext onDragEnd={onDragEnd} >
                        <Stack direction='column' spacing={1} height='100%' width='100%'>

                            <ProcessList title={listOpenId} processList={openedProcesses} />

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