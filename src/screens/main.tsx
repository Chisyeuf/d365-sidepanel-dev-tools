import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

import Stack from '@mui/material/Stack';

import Processes, { defaultProcessesList } from '../processes/.list';
import { debugLog, GetExtensionId, GetUrl, setStyle, waitForElm } from '../utils/global/common';
import XrmObserver from '../utils/global/XrmObserver';

import { StorageConfiguration } from '../utils/types/StorageConfiguration';
import { MessageType } from '../utils/types/Message';
import DOMObserver from '../utils/global/DOMObserver';
import { Badge, Button, Divider, Drawer, IconButton, Tooltip, Typography } from '@mui/material';
import { ProcessButton } from '../utils/global/.processClass';
import { applicationName, classesPrefix, drawerContainerId, storageForegroundPanes, storageListName, storageStandardPanels } from '../utils/global/var';
import PanelDrawerItem from '../utils/components/PanelDrawer/PanelDrawerItem';
import CloseIcon from '@mui/icons-material/Close';


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

    const [panelOpenedIndex, setPanelOpenedIndex] = useState<number | null>(null);

    const [processesList, setProcessesList] = useState<StorageConfiguration[]>([]);
    const [openedProcesses, setOpenedProcesses] = useState<ProcessButton[]>([]);
    const [openedProcessesBadge, setOpenedProcessesBadge] = useState<(number | string | null)[]>([]);

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
        if (!isForegroundPanes && panelOpenedIndex !== null) {
            if (panelOpenedIndex > -1) {
                dynamicsmainscreenWidth = openedProcesses[panelOpenedIndex].width;
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
    }, [panelOpenedIndex, isForegroundPanes]);


    useEffect(() => {
        processesList.filter((processid) => processid.startOnLoad)
            .sort((processA, processB) => processA.startOnPosition! - processB.startOnPosition!)
            .forEach((processid, index) => {
                const process = Processes.find(p => p.id === processid.id);
                if (!process) return;
                setOpenedProcesses(prev => [...prev, process]);
                setOpenedProcessesBadge(prevBadge => [...prevBadge, null]);
                if (processid.expand) {
                    setPanelOpenedIndex(index);
                }
            })
    }, [processesList]);


    const togglePanelDrawer = (index: number) => {
        setPanelOpenedIndex(prev => prev !== index ? index : null);
    }

    const openProcess = (process: ProcessButton) => {
        setOpenedProcesses(prev => {
            const alreadyOpenedProcess = prev.findIndex(p => p.id === process.id);
            if (alreadyOpenedProcess === -1) {
                togglePanelDrawer(prev.length);
                setOpenedProcessesBadge(prevBadge => [...prevBadge, null]);
                return [...prev, process];
            }
            togglePanelDrawer(alreadyOpenedProcess);
            return prev;
        })
    }

    const closeProcess = (processId: string) => {
        setOpenedProcesses(prev => {
            const processToCloseIndex = prev.findIndex(p => p.id === processId);
            if (processToCloseIndex === -1) {
                return prev;
            }
            setPanelOpenedIndex(null);
            setOpenedProcessesBadge(prevBadges => {
                const copyBadge = [...prevBadges];
                copyBadge.splice(processToCloseIndex, 1);
                return copyBadge;
            })
            const copy = [...prev];
            copy.splice(processToCloseIndex, 1);
            return copy;
        })
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
                            key={`sidepanel-mainmenu-processButton`}
                            onClick={() => togglePanelDrawer(-1)}
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

                    {
                        openedProcesses.map((process, index) => {
                            return (
                                <Tooltip
                                    title={<Typography variant='h6'>{process.name}</Typography>}
                                    placement='left'
                                    arrow
                                >
                                    <Button
                                        key={`${process.id}-processButton`}
                                        variant={panelOpenedIndex === index ? 'contained' : 'text'}
                                        onClick={() => togglePanelDrawer(index)}
                                        sx={{
                                            minWidth: 'unset',
                                            aspectRatio: '1 / 1',
                                            borderRadius: 0,
                                            boxShadow: 'unset',
                                            // zoom: 1.2,
                                            color: panelOpenedIndex === index ? 'white' : 'black'
                                        }}
                                    >
                                        <Badge
                                            badgeContent={openedProcessesBadge[index] === null ? null : String(openedProcessesBadge[index])}
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
                            );
                        })
                    }

                </Stack>
            </Drawer >

            <PanelDrawerItem width={mainMenuWidth} open={panelOpenedIndex === -1}>

                <Typography variant='h5' padding={'15px 15px 5px 15px'}>{applicationName}</Typography>

                <Stack spacing={0.5} width='-webkit-fill-available' padding='10px'>
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
                </Stack>

            </PanelDrawerItem>

            {
                openedProcesses.map((process, index, array) => {
                    return <DrawerTool
                        key={`${process.id}-drawertool`}
                        closeProcess={closeProcess}
                        index={index}
                        panelOpenedIndex={panelOpenedIndex}
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
    index: number
    setOpenedProcessesBadge: (value: React.SetStateAction<(number | string | null)[]>) => void
    closeProcess: (processId: string) => void
    panelOpenedIndex: number | null
}
function DrawerTool(props: DrawerToolProps) {
    const { index, process, setOpenedProcessesBadge, closeProcess, panelOpenedIndex } = props;

    const verticalTitle = useMemo(() => process.width < 100, [process]);

    const setBadgeInner = useCallback((content: number | string | null) => {
        setOpenedProcessesBadge(prevBadge => {
            const copyBadge = [...prevBadge];
            copyBadge.splice(index, 1, content);
            return copyBadge;
        });
    }, [setOpenedProcessesBadge, index]);

    return (
        <PanelDrawerItem key={`${process.id}-processPanel`} width={process.width} open={panelOpenedIndex === index}>

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