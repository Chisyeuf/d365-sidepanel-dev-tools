import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

import Stack from '@mui/material/Stack';

import Processes, { defaultProcessesList } from '../processes/.list';
import { debugLog, GetExtensionId, GetUrl, setStyle, waitForElm } from '../utils/global/common';
import XrmObserver from '../utils/global/XrmObserver';

import { StorageConfiguration } from '../utils/types/StorageConfiguration';
import { MessageType } from '../utils/types/Message';
import DOMObserver from '../utils/global/DOMObserver';
import { Badge, Box, Button, Divider, Drawer, IconButton, Tooltip, Typography } from '@mui/material';
import { ProcessButton } from '../utils/global/.processClass';
import { applicationName, classesPrefix, drawerContainerId, mainMenuId, storageForegroundPanes, storageListName, storageStandardPanels } from '../utils/global/var';
import PanelDrawerItem from '../utils/components/PanelDrawer/PanelDrawerItem';
import CloseIcon from '@mui/icons-material/Close';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';

import packageJson from "../../package.json";


const MainScreenStandardPanel: React.FunctionComponent = () => {

    const extensionId = GetExtensionId();

    const [processesList, setProcessesList] = useState<StorageConfiguration[]>([]);

    const [isForegroundPanes, setIsForegroundPanes] = useState<boolean>(false);

    useEffect(() => {
        chrome.runtime.sendMessage(extensionId, { type: MessageType.GETCONFIGURATION, data: { key: storageListName } },
            function (response: StorageConfiguration[]) {
                if (response && response.length === defaultProcessesList.length) {
                    setProcessesList(response);
                    return;
                }
                else {
                    chrome.runtime.sendMessage(extensionId, { type: MessageType.SETCONFIGURATION, data: { key: storageListName, configurations: defaultProcessesList } });
                    setProcessesList(defaultProcessesList);
                }

            }
        );

        chrome.runtime.sendMessage(extensionId, { type: MessageType.GETCONFIGURATION, data: { key: storageForegroundPanes } },
            function (response: boolean | null) {
                setIsForegroundPanes(response ?? false);
                setPageStyle();
            }
        );
    }, [extensionId]);

    const setPageStyle = async () => {
        if (!isForegroundPanes) {
            const openedPane = document.getElementById(Xrm.App.sidePanes.getSelectedPane()?.paneId ?? '');
            if (openedPane) {
                setStyle('styleModifier-main', {
                    "div[id^=DialogContainer] > div": [
                        "width: calc(100% - " +
                        (document.getElementById(Xrm.App.sidePanes.getSelectedPane()?.paneId ?? '')?.offsetWidth ?? 0) +
                        "px)",
                        "left: 0"
                    ],
                    "[id^=quickCreateRoot], [id^=dialogRoot], [id^=defaultDialogChromeView], [id^=lookupDialogRoot]": ["position: relative", "right: 47px"],
                    "[id*=__flyoutRootNode] > div > div": ["z-index: 11"],
                    "#panels > div:last-child": ["z-index: 10", "background: #F8F7F6"]
                });
            }
            else {
                setStyle('styleModifier-main', {
                    "[id^=quickCreateRoot], [id^=dialogRoot], [id^=defaultDialogChromeView], [id^=lookupDialogRoot]": ["position: relative", "right: 47px"],
                    "[id*=__flyoutRootNode] > div > div": ["z-index: 11"],
                    "#panels > div:last-child": ["z-index: 10", "background: #F8F7F6"]
                });
            }
        }
        else {
            setStyle('styleModifier-main', {
                "[id^=sidepaneldevtools-]:not([id$='_header']):not(.ms-Tooltip-content)": ["position: absolute", "right: 47px"],
                "[id*=__flyoutRootNode] > div > div": ["z-index: 11"],
                "#panels > div:last-child": ["z-index: 10", "background: #F8F7F6"]
            });
        }
    }


    waitForElm("#panels > div:last-child").then(elem => {
        // ObserveDOM(elem, setPageStyle);
        const domObserver = new DOMObserver('sidepanelinteracted', elem, { childList: true, subtree: true });
        domObserver.addListener(setPageStyle);
    })


    useEffect(() => {
        processesList.filter((processid) => processid.startOnLoad)
            .sort((processA, processB) => processA.startOnPosition! - processB.startOnPosition!)
            .forEach((processid) => {
                const process = Processes.find(p => p.id === processid.id);
                process?.openSidePane(processid.expand);
            })
    }, [processesList]);

    return (
        <Stack spacing={0.5} width='-webkit-fill-available' padding='10px'>

            <Stack spacing={0.5} width='-webkit-fill-available' height='100%'>
                {
                    processesList?.filter((process) => !process.hidden).map((value, index) => {
                        const Process = Processes.find(p => p.id === value.id);
                        return Process?.getButtonOpeningStandardPanel();
                    })
                }
            </Stack>

            {/* <Divider /> */}
            {/* <Typography maxHeight='19px'>Created by Sofiane GUEZZAR</Typography> */}
        </Stack>
    )
}

const drawerButtonContainerWidth = 47;
const mainMenuWidth = 300;
const MainScreenCustomPanel: React.FunctionComponent = () => {

    const extensionId = GetExtensionId();

    const [panelOpenedId, setPanelOpenedId] = useState<string | null>(null);

    const [processesList, setProcessesList] = useState<StorageConfiguration[]>([]);
    const [openedProcesses, setOpenedProcesses] = useState<{ [processIi: string]: ProcessButton }>({});
    const [openedProcessesBadge, setOpenedProcessesBadge] = useState<{ [processid: string]: (number | string | null) }>({});

    const [isForegroundPanes, setIsForegroundPanes] = useState<boolean>(false);

    useEffect(() => {
        chrome.runtime.sendMessage(extensionId, { type: MessageType.GETCONFIGURATION, data: { key: storageListName } },
            function (response: StorageConfiguration[]) {
                if (response && response.length === defaultProcessesList.length) {
                    setProcessesList(response);
                    return;
                }
                else {
                    chrome.runtime.sendMessage(extensionId, { type: MessageType.SETCONFIGURATION, data: { key: storageListName, configurations: defaultProcessesList } });
                    setProcessesList(defaultProcessesList);
                }

            }
        );

        chrome.runtime.sendMessage(extensionId, { type: MessageType.GETCONFIGURATION, data: { key: storageForegroundPanes } },
            function (response: boolean | null) {
                setIsForegroundPanes(response ?? false);
            }
        );
    }, [extensionId]);

    const setPageStyle = async () => {
        setStyle('drawerbuttonsmain', {
            "#shell-container": [`width: calc(100% - ${drawerButtonContainerWidth}px)`],
        });

        let dynamicsmainscreenWidth = 0;
        if (!isForegroundPanes && panelOpenedId !== null) {
            if (panelOpenedId !== mainMenuId) {
                dynamicsmainscreenWidth = openedProcesses[panelOpenedId].width;
            }
            else {
                dynamicsmainscreenWidth = mainMenuWidth;
            }
        }
        setStyle('resizedynamicsmainscreen', {
            "#mainContent > *:first-child": [`width: calc(100% - ${dynamicsmainscreenWidth}px)`],
            "[id^=DialogContainer]": [`width: calc(100% - ${drawerButtonContainerWidth}px - ${dynamicsmainscreenWidth}px)`],
            "[id*=__flyoutRootNode] > div > div": ["z-index: 1200"],
        });
    };

    useEffect(() => {
        setPageStyle();
    }, [panelOpenedId, isForegroundPanes]);


    useEffect(() => {
        processesList.filter((processid) => processid.startOnLoad)
            .sort((processA, processB) => processA.startOnPosition! - processB.startOnPosition!)
            .forEach((processid, index) => {
                const process = Processes.find(p => p.id === processid.id);
                if (!process) return;
                setOpenedProcesses(prev => ({ ...prev, [process.id]: process }));
                setOpenedProcessesBadge(prevBadge => ({ ...prevBadge, [process.id]: null }));
                if (processid.expand) {
                    setPanelOpenedId(process.id);
                }
            });
    }, [processesList]);


    const togglePanelDrawer = (processid: string) => {
        setPanelOpenedId(prev => prev !== processid ? processid : null);
    }

    const openProcess = (process: ProcessButton) => {
        setOpenedProcesses(prev => {
            const alreadyOpenedProcess: ProcessButton | undefined = prev[process.id];
            if (!alreadyOpenedProcess) {
                togglePanelDrawer(process.id);
                setOpenedProcessesBadge(prevBadge => ({ ...prevBadge, [process.id]: null }));
                return { ...prev, [process.id]: process };
            }
            togglePanelDrawer(alreadyOpenedProcess.id);
            return prev;
        })
    }

    const closeProcess = (processId: string) => {
        setOpenedProcesses(prev => {
            const processToCloseIndex: ProcessButton | undefined = prev[processId];
            if (!processToCloseIndex) {
                return prev;
            }
            setPanelOpenedId(null);
            setOpenedProcessesBadge(prevBadges => {
                const { [processId]: _, ...copyBadge } = prevBadges;
                return copyBadge;
            })
            const { [processId]: _, ...copy } = prev;
            return copy;
        })
    }

    function onDragEnd(result: DropResult) {
        if (!result.destination) {
            return;
        }

        if (result.destination.index === result.source.index && result.destination.droppableId === result.source.droppableId) {
            return;
        }

        setOpenedProcesses(previousProcessList => {
            const processIdList = Object.keys(previousProcessList);
            const originalProcessIndex = result.source!.index;
            const futureProcessIndex = result.destination!.index;

            const removedKey = processIdList.splice(originalProcessIndex, 1);
            processIdList.splice(futureProcessIndex, 0, ...removedKey);

            return processIdList.reduce<typeof previousProcessList>(
                (obj, key) => {
                    obj[key] = previousProcessList[key];
                    return obj;
                }
                , {});
        });
    }


    return (
        <>
            <Drawer
                anchor={"right"}
                // open={open}
                hideBackdrop
                sx={{
                    width: drawerButtonContainerWidth,
                    flexShrink: 0,
                }}
                PaperProps={{
                    sx: {
                        width: drawerButtonContainerWidth,
                        backgroundColor: "rgb(246,247,248)",
                    },
                }}
                variant="permanent"
            >
                <Stack direction='column'>

                    <Tooltip title={<Typography variant='h6'>{applicationName}</Typography>} placement='left' arrow describeChild={false}>
                        <Button
                            key={`${mainMenuId}-processButton`}
                            onClick={() => togglePanelDrawer(mainMenuId)}
                            sx={{
                                minWidth: 'unset',
                                aspectRatio: '1 / 1',
                                borderRadius: 0,
                                boxShadow: 'unset'
                            }}
                        >
                            <img src={GetUrl("icons/muiwandflip.png")} width={24} style={{ fontSize: 'medium' }} />
                        </Button>
                    </Tooltip>

                    <Divider />

                    <DragDropContext onDragEnd={onDragEnd} >
                        <Droppable droppableId={mainMenuId + "droppable"} key={mainMenuId + 'droppable'}>
                            {
                                providerDroppable => (
                                    <Stack
                                        direction='column'
                                        ref={providerDroppable.innerRef}
                                        {...providerDroppable.droppableProps}
                                    >
                                        {
                                            Object.values(openedProcesses).map((process, index) => {
                                                return (
                                                    <Draggable draggableId={process.id} index={index} key={process.id + 'draggable'}>
                                                        {providerDraggable => (
                                                            <Box
                                                                key={process.id + '-maincontentbox'}
                                                                ref={providerDraggable.innerRef}
                                                                {...providerDraggable.draggableProps}
                                                                {...providerDraggable.dragHandleProps}
                                                                width='100%'
                                                                sx={{
                                                                    aspectRatio: '1/1'
                                                                }}
                                                            >
                                                                <Tooltip
                                                                    title={<Typography variant='h6'>{process.name}</Typography>}
                                                                    placement='left'
                                                                    arrow
                                                                >
                                                                    <Button
                                                                        key={`${process.id}-processButton`}
                                                                        variant={panelOpenedId === process.id ? 'contained' : 'text'}
                                                                        onClick={() => togglePanelDrawer(process.id)}
                                                                        fullWidth
                                                                        sx={{
                                                                            minWidth: 'unset',
                                                                            aspectRatio: '1 / 1',
                                                                            borderRadius: 0,
                                                                            boxShadow: 'unset',
                                                                            // zoom: 1.2,
                                                                            color: panelOpenedId === process.id ? 'white' : 'black'
                                                                        }}
                                                                    >
                                                                        <Badge
                                                                            badgeContent={openedProcessesBadge[process.id] === null ? null : String(openedProcessesBadge[process.id])}
                                                                            color="info"
                                                                            sx={(theme) => ({
                                                                                [`& .${classesPrefix}Badge-badge`]: {
                                                                                    // zoom: 0.8,
                                                                                    aspectRatio: '1 / 1',
                                                                                    border: `2px solid ${theme.palette.background.paper}`
                                                                                }
                                                                            })}
                                                                        >
                                                                            {process.icon}
                                                                        </Badge>
                                                                    </Button>
                                                                </Tooltip>
                                                            </Box>
                                                        )}
                                                    </Draggable>
                                                );
                                            })
                                        }
                                        {providerDroppable.placeholder}
                                    </Stack>
                                )
                            }
                        </Droppable>
                    </DragDropContext>

                </Stack>
            </Drawer >

            <PanelDrawerItem width={mainMenuWidth} open={panelOpenedId === mainMenuId}>

                <Typography variant='h5' padding={'15px 15px 5px 15px'}>{applicationName}</Typography>

                <Stack spacing={0.5} width='-webkit-fill-available' padding='10px' height='100%' justifyContent='space-between'>
                    <Stack spacing={0.5} width='-webkit-fill-available' height='100%'>
                        {
                            processesList?.filter((process) => !process.hidden).map((value, index) => {
                                const Process = Processes.find(p => p.id === value.id);
                                if (!Process) return null;
                                if (Process.openable) {
                                    return Process.getButton(openProcess);
                                } else {
                                    return Process.getButtonOpeningStandardPanel();
                                }
                            })
                        }
                    </Stack>
                    <Typography variant='caption' color='grey' textAlign='end'>v{packageJson.version}</Typography> 
                </Stack>

            </PanelDrawerItem>

            {
                Object.values(openedProcesses).map((process, index, array) => {
                    return <DrawerTool
                        key={`${process.id}-drawertool`}
                        closeProcess={closeProcess}
                        panelOpenedId={panelOpenedId}
                        process={process}
                        setOpenedProcessesBadge={setOpenedProcessesBadge}
                    />
                })
            }
        </>
    )
}


interface DrawerToolProps {
    process: ProcessButton
    setOpenedProcessesBadge: (value: React.SetStateAction<{ [processid: string]: string | number | null }>) => void
    closeProcess: (processId: string) => void
    panelOpenedId: string | null
}
function DrawerTool(props: DrawerToolProps) {
    const { process, setOpenedProcessesBadge, closeProcess, panelOpenedId } = props;

    const verticalTitle = useMemo(() => process.width < 100, [process]);

    const setBadgeInner = useCallback((content: number | string | null) => {
        setOpenedProcessesBadge(prevBadge => {
            const copyBadge = { ...prevBadge };
            copyBadge[process.id] = content;
            return copyBadge;
        });
    }, [setOpenedProcessesBadge, process]);

    return (
        <PanelDrawerItem key={`${process.id}-processPanel`} width={process.width} open={panelOpenedId === process.id}>

            <Stack direction='column' width='100%' height='100%'>
                {/* <Stack direction='column' width='100%' height={`calc(100% - ${titleHeight}px)`}> */}

                <Stack direction={verticalTitle ? 'column-reverse' : 'row'} padding={'15px 15px 5px 15px'} justifyContent='space-between'>
                    <Typography variant='h5' sx={{ writingMode: verticalTitle ? 'vertical-lr' : 'unset' }}>{process.name}</Typography>
                    <IconButton onClick={() => closeProcess(process.id)}>
                        <CloseIcon />
                    </IconButton>
                </Stack>

                <Stack flex='1 1 auto' minHeight={0}>
                    {process.getProcess(setBadgeInner)}
                </Stack>
            </Stack>
        </PanelDrawerItem>
    );
}



if (top && top.window === window) {
    var loading = setInterval(() => {
        if (!!Xrm) {
            clearInterval(loading);
            initExtension();
        }
    }, 1000);
}


function initExtension() {
    const extensionId = GetExtensionId();

    chrome.runtime.sendMessage(extensionId, { type: MessageType.GETCONFIGURATION, data: { key: storageStandardPanels } },
        function (useStandardPanel: boolean | null) {

            const isOnPrem: boolean = (Xrm.Utility.getGlobalContext() as any).isOnPremises();

            if (isOnPrem || !useStandardPanel) {
                waitForElm('#mainContent').then((mainNode) => {
                    const drawerContainer = document.createElement('div');
                    drawerContainer.setAttribute('id', ProcessButton.prefixId + drawerContainerId);
                    mainNode?.append(drawerContainer);

                    ReactDOM.render(
                        <MainScreenCustomPanel />,
                        drawerContainer
                    );
                });
            }
            else {
                const paneOption: Xrm.App.PaneOptions = {
                    paneId: ProcessButton.prefixId + "dynamicstoolsmenu",
                    title: applicationName,
                    canClose: false,
                    imageSrc: GetUrl("icons/muiwandflip.png"),
                    hideHeader: false,
                    isSelected: false,
                    width: 200,
                    hidden: false,
                    alwaysRender: true,
                    keepBadgeOnSelect: true
                }

                Xrm.App.sidePanes.createPane(paneOption);

                waitForElm('#' + ProcessButton.prefixId + 'dynamicstoolsmenu > div > div:last-child').then((mainSidePane) => {
                    ReactDOM.render(
                        <MainScreenStandardPanel />,
                        mainSidePane
                    );
                });
            }

            new XrmObserver();
        }
    );
}

debugLog("Main loaded");