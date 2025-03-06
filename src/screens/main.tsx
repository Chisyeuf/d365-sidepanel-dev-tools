import '../utils/components/DetailsSnackbar';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';

import Stack from '@mui/material/Stack';

import Processes, { defaultProcessesList } from '../processes/.list';
import { debugLog, GetExtensionId, GetUrl, isArraysEquals, setStyle, waitForElm } from '../utils/global/common';
import XrmObserver from '../utils/global/XrmObserver';

import { StorageConfiguration } from '../utils/types/StorageConfiguration';
import { MessageType } from '../utils/types/Message';
import { Badge, Box, Button, Divider, Drawer, IconButton, Paper, StyledEngineProvider, Tooltip, Typography } from '@mui/material';
import { ProcessButton } from '../utils/global/.processClass';
import { APPLICATION_NAME, PROJECT_PREFIX, DRAWER_CONTAINER_ID, MAIN_MENU_ID, STORAGE_ForegroundPanes, STORAGE_ListName } from '../utils/global/var';
import PanelDrawerItem from '../utils/components/PanelDrawer/PanelDrawerItem';
import CloseIcon from '@mui/icons-material/Close';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';

import packageJson from "../../package.json";
import { SnackbarProvider, useSnackbar } from 'notistack';
import DetailsSnackbar from '../utils/components/DetailsSnackbar';
import GitHubIcon from '@mui/icons-material/GitHub';
import BugReportIcon from '@mui/icons-material/BugReport';
import OpenOptionsButton from '../utils/components/OpenOptionsButton';
import SpDevToolsContextProvider, { useSpDevTools } from '../utils/global/spContext';
import { BuyMeACoffeeIcon } from '../icons/BuyMeACoffee';
import StarIcon from '@mui/icons-material/Star';
import BlackWhiteIconButton from '../utils/components/BlackWhiteIconButton';


const MainScreen: React.FunctionComponent = () => {
    return (
        // <React.StrictMode>
        <StyledEngineProvider injectFirst>
            <SnackbarProvider
                dense
                maxSnack={5}
                Components={{
                    detailsFile: DetailsSnackbar,
                }}
            >
                <SpDevToolsContextProvider>
                    <MainScreenCustomPanel />
                </SpDevToolsContextProvider>
            </SnackbarProvider>
        </StyledEngineProvider>
        // </React.StrictMode>
    )
}

const DRAWER_BUTTON_CONTAINER_WIDTH = 47;
const MAIN_MENU_WIDTH = 322;

const MainScreenCustomPanel: React.FunctionComponent = () => {

    const extensionId = GetExtensionId();

    const [panelOpenedId, setPanelOpenedId] = useState<string | null>(null);

    const [processesList, setProcessesList] = useState<StorageConfiguration[]>([]);
    const [openedProcesses, setOpenedProcesses] = useState<{ [processId: string]: ProcessButton }>({});
    const [openedProcessesBadge, setOpenedProcessesBadge] = useState<{ [processId: string]: (React.ReactNode | null) }>({});

    const [isForegroundPanes, setIsForegroundPanes] = useState<boolean>(false);


    useEffect(() => {
        chrome.runtime.sendMessage(extensionId, { type: MessageType.GETCONFIGURATION, data: { key: STORAGE_ListName } },
            function (response: StorageConfiguration[]) {
                if (response && isArraysEquals(response.map(t => t.id), defaultProcessesList.map(t => t.id))) {
                    setProcessesList(response);
                    return;
                }
                else {
                    chrome.runtime.sendMessage(extensionId, { type: MessageType.SETCONFIGURATION, data: { key: STORAGE_ListName, configurations: defaultProcessesList } });
                    setProcessesList(defaultProcessesList);
                }

            }
        );

        chrome.runtime.sendMessage(extensionId, { type: MessageType.GETCONFIGURATION, data: { key: STORAGE_ForegroundPanes } },
            function (response: boolean | null) {
                setIsForegroundPanes(response ?? false);
            }
        );
    }, [extensionId]);


    useEffect(() => {
        const setPageStyle = async () => {
            setStyle(document, 'drawerbuttonsmain', {
                "#shell-container": [`width: calc(100% - ${DRAWER_BUTTON_CONTAINER_WIDTH}px)`],
            });

            let dynamicsmainscreenWidth = 0;
            if (!isForegroundPanes && panelOpenedId !== null) {
                if (panelOpenedId !== MAIN_MENU_ID && openedProcesses[panelOpenedId].widthNumber > 0) {
                    dynamicsmainscreenWidth = openedProcesses[panelOpenedId].widthNumber;
                }
                else {
                    dynamicsmainscreenWidth = MAIN_MENU_WIDTH;
                }
            }
            setStyle(document, 'resizedynamicsmainscreen', {
                "#ApplicationShell > *:not(*:first-child)": [`width: calc(100% - ${dynamicsmainscreenWidth}px)`],
                // "#mainContent > *:first-child": [`width: calc(100% - ${dynamicsmainscreenWidth}px)`],
                "[id^=DialogContainer]": [`width: calc(100% - ${DRAWER_BUTTON_CONTAINER_WIDTH}px - ${dynamicsmainscreenWidth}px)`],
                "[id*=__flyoutRootNode] > div > div": ["z-index: 1200"],
            });
        };

        setPageStyle();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [panelOpenedId, isForegroundPanes]);

    useEffect(() => {
        if (panelOpenedId && openedProcesses[panelOpenedId] && !openedProcesses[panelOpenedId].isPanelProcess) {
            openedProcesses[panelOpenedId].execute();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [panelOpenedId]);


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

    const openProcess = useCallback((process: ProcessButton) => {
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
    }, []);

    const closeProcess = useCallback((processId: string) => {
        setOpenedProcesses(prev => {
            const processToCloseIndex: ProcessButton | undefined = prev[processId];
            if (!processToCloseIndex) {
                return prev;
            }
            processToCloseIndex.onProcessClose();
            setPanelOpenedId(null);
            setOpenedProcessesBadge(prevBadges => {
                const { [processId]: _, ...copyBadge } = prevBadges;
                return copyBadge;
            })
            const { [processId]: _, ...copy } = prev;
            return copy;
        })
    }, []);


    const toolsButton = useMemo(() => processesList?.filter((process) => !process.hidden).map((value, index) => {
        const toolButton = Processes.find(p => p.id === value.id);
        if (!toolButton) return null;
        if (toolButton.openable) {
            return toolButton.getOpeningButton(openProcess);
        } else {
            return toolButton.getFunctionButton();
        }
    }), [processesList, openProcess]);


    const onDragEnd = (result: DropResult) => {
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
                hideBackdrop
                sx={{
                    width: DRAWER_BUTTON_CONTAINER_WIDTH,
                    flexShrink: 0,
                }}
                PaperProps={{
                    sx: {
                        width: DRAWER_BUTTON_CONTAINER_WIDTH,
                        backgroundColor: "rgb(246,247,248)",
                    },
                }}
                variant="permanent"
            >
                <Stack direction='column'>

                    <Tooltip title={<Typography variant='h6'>{APPLICATION_NAME}</Typography>} placement='left' arrow disableInteractive>
                        <Button
                            key={`${MAIN_MENU_ID}-processButton`}
                            onClick={() => togglePanelDrawer(MAIN_MENU_ID)}
                            sx={{
                                minWidth: 'unset',
                                aspectRatio: '1 / 1',
                                borderRadius: 0,
                                boxShadow: 'unset'
                            }}
                        >
                            <img src={GetUrl("icons/muiwandflip.png")} alt='SPDT.icon' width={24} style={{ fontSize: 'medium' }} />
                        </Button>
                    </Tooltip>

                    <Divider />

                    <DragDropContext onDragEnd={onDragEnd} >
                        <Droppable droppableId={MAIN_MENU_ID + "droppable"} key={MAIN_MENU_ID + 'droppable'}>
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
                                                                    title={<Typography variant='h6'>{process.panelButtonName}</Typography>}
                                                                    placement='left'
                                                                    arrow
                                                                    disableInteractive
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
                                                                            color: panelOpenedId === process.id ? 'white' : 'black'
                                                                        }}
                                                                    >
                                                                        <Badge
                                                                            badgeContent={openedProcessesBadge[process.id]}
                                                                            color="info"
                                                                            sx={(theme) => ({
                                                                                [`& .${PROJECT_PREFIX}Badge-badge`]: {
                                                                                    aspectRatio: '1 / 1',
                                                                                    border: `2px solid ${theme.palette.background.paper}`
                                                                                }
                                                                            })}
                                                                        >
                                                                            {process.panelButtonIcon}
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

            <PanelDrawerItem width={MAIN_MENU_WIDTH} open={panelOpenedId === MAIN_MENU_ID}>

                <Typography variant='h5' padding={'15px 15px 5px 15px'} sx={{ userSelect: 'none' }}>{APPLICATION_NAME}</Typography>

                <Stack spacing={0.5} width='-webkit-fill-available' padding='10px' pb='5px' height='calc(100% - 63px)' justifyContent='space-between'>
                    <Stack spacing={0.5} width='-webkit-fill-available' overflow='auto'>
                        {
                            toolsButton.every(t => t) ?

                                toolsButton

                                :
                                <>
                                    <Typography>
                                        It seems there was a problem retrieving the tools list. Try resetting the tools list in the options screen.
                                    </Typography>
                                    <OpenOptionsButton variant='contained' />
                                </>
                        }
                    </Stack>

                    <MainScreenFooter />
                </Stack>

            </PanelDrawerItem>

            {
                Object.values(openedProcesses).filter(process => process.isPanelProcess).map((process) => {
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
    );
}


let clickCount = 0;
let timer: NodeJS.Timeout;
const clickThreshold = 15;
const timeThreshold = 8000;

function MainScreenFooter() {

    const { enqueueSnackbar } = useSnackbar();
    const { isDebug } = useSpDevTools();

    const handleHiddenAction = useCallback(() => {
        clickCount++;

        if (clickCount === 1) {
            timer = setTimeout(() => {
                clickCount = 0;
            }, timeThreshold);
        } else if (clickCount >= clickThreshold) {
            enqueueSnackbar(
                `Debug Mode ${!isDebug.value ? "activated" : "deactivated"}.`,
                { variant: 'info' }
            )
            isDebug.toggle();
            clearTimeout(timer);
            clickCount = 0;
        }
    }, [isDebug, enqueueSnackbar]);


    const navigatorType = useMemo(() => {
        if (navigator.userAgent.includes('Firefox')) {
            return 'Firefox';
        }
        else if (navigator.userAgent.includes('Edg')) {
            return 'Edge';
        }
        else {
            return 'Chrome';
        }
    }, []);

    const reviewUrl = useMemo(() => {
        switch (navigatorType) {
            case 'Edge':
                return "https://microsoftedge.microsoft.com/addons/detail/d365-sidepanel-dev-tools/peineehbfebfgjbimbiomckmkkdbcpcg";
            case 'Chrome':
                return "https://chromewebstore.google.com/detail/d365-sidepanel-dev-tools/cbcpebonnklbnemkgkmofpkebonjifff/reviews";
            default:
                return '';
        }
    }, [navigatorType]);

    return (
        <Paper elevation={0}>
            <Stack direction='column'>
                <Divider />
                <Stack spacing={1} mt='5px' direction='row' alignItems='center' ml='auto'>
                    <Tooltip title={<Typography>Send a review</Typography>} arrow disableInteractive>
                        <a href={reviewUrl} target="_blank" rel="noreferrer">
                            <BlackWhiteIconButton size="small" color='#FDCC0D'>
                                <StarIcon fontSize="inherit" sx={{ stroke: 'black' }} />
                            </BlackWhiteIconButton>
                        </a>
                    </Tooltip>
                    <Tooltip title={<Typography fontFamily="'Cookie',cursive">Buy me a coffee</Typography>} arrow disableInteractive>
                        <a href='https://buymeacoffee.com/sofiane.guezzar' target="_blank" rel="noreferrer">
                            <BlackWhiteIconButton size="small" color='#0388a6'>
                                <BuyMeACoffeeIcon fontSize="inherit" sx={{ height: '15px' }} />
                            </BlackWhiteIconButton>
                        </a>
                    </Tooltip>
                    <Tooltip title={<Typography>Github project</Typography>} arrow disableInteractive>
                        <a href='https://github.com/Chisyeuf/d365-sidepanel-dev-tools' target="_blank" rel="noreferrer">
                            <BlackWhiteIconButton size="small" color='#2dba4e' >
                                <GitHubIcon fontSize="inherit" />
                            </BlackWhiteIconButton>
                        </a>
                    </Tooltip>
                    <Tooltip title={<Typography>Report an issue</Typography>} arrow disableInteractive>
                        <a href='https://github.com/Chisyeuf/d365-sidepanel-dev-tools/issues/new' target="_blank" rel="noreferrer">
                            <BlackWhiteIconButton size="small" color='#df5050'>
                                <BugReportIcon fontSize="inherit" />
                            </BlackWhiteIconButton>
                        </a>
                    </Tooltip>
                    <Divider orientation='vertical' flexItem />
                    <Typography variant='caption' color='grey' textAlign='end' sx={{ userSelect: 'none' }} onClick={handleHiddenAction}>v{packageJson.version}</Typography>
                </Stack>
            </Stack>
        </Paper>
    );
}


interface DrawerToolProps {
    process: ProcessButton
    setOpenedProcessesBadge: (value: React.SetStateAction<{ [processid: string]: React.ReactNode | null }>) => void
    closeProcess: (processId: string) => void
    panelOpenedId: string | null
}
function DrawerTool(props: DrawerToolProps) {
    const { process, setOpenedProcessesBadge, closeProcess, panelOpenedId } = props;

    const verticalTitle = useMemo(() => process.widthNumber < 100 && process.widthNumber > 0, [process]);

    const setBadgeInner = useCallback((content: React.ReactNode | null) => {
        setOpenedProcessesBadge(prevBadge => {
            const copyBadge = { ...prevBadge };
            copyBadge[process.id] = content;
            return copyBadge;
        });
    }, [setOpenedProcessesBadge, process]);

    const width = useMemo(() => {
        if (typeof process.width === 'string') {
            if (process.width.endsWith('%')) {
                return `calc(${process.width} - (${DRAWER_BUTTON_CONTAINER_WIDTH}px * (${parseInt(process.width)} / 100)))`;
            }
            else {
                return parseInt(process.width);
            }
        }
        else {
            return process.width;
        }
    }, [process.width]);

    return (
        <PanelDrawerItem key={`${process.id}-processPanel`} width={width} open={panelOpenedId === process.id}>

            <Stack direction='column' width='100%' height='100%'>

                <Stack direction={verticalTitle ? 'column-reverse' : 'row'} padding={'15px 15px 5px 15px'} justifyContent='space-between' sx={{ userSelect: 'none' }}>
                    <Typography variant='h5' sx={{ writingMode: verticalTitle ? 'vertical-lr' : 'unset' }}>{process.menuButtonName}</Typography>
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



if (window.top && window.top.window === window) {
    var loading = setInterval(() => {
        if (!!Xrm) {
            clearInterval(loading);
            initExtension();
        }
    }, 1000);
}


function initExtension() {

    waitForElm(document, '#mainContent', { infiniteWait: true }).then((mainNode) => {
        const drawerContainer = document.createElement('div');
        drawerContainer.setAttribute('id', ProcessButton.prefixId + DRAWER_CONTAINER_ID);
        mainNode?.append(drawerContainer);

        ReactDOM.render(
            <MainScreen />,
            drawerContainer
        );
    });

    new XrmObserver();
}

debugLog("Main loaded");