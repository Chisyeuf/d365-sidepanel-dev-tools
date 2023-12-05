import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import Stack from '@mui/material/Stack';

import Processes, { defaultProcessesList, storageForegroundPanes, storageListName } from '../processes/.list';
import { debugLog, GetExtensionId, GetUrl, setStyle, waitForElm } from '../utils/global/common';
import XrmObserver from '../utils/global/XrmObserver';

import { StorageConfiguration } from '../utils/types/StorageConfiguration';
import { MessageType } from '../utils/types/Message';
import DOMObserver from '../utils/global/DOMObserver';
import { Divider, FormControl, FormControlLabel, Switch, Typography } from '@mui/material';
import { ProcessButton } from '../utils/global/.processClass';


export const MainScreen: React.FunctionComponent = () => {

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

    useEffect(() => {
        chrome.runtime.sendMessage(extensionId, { type: MessageType.SETCONFIGURATION, data: { key: storageForegroundPanes, configurations: isForegroundPanes } });
        setPageStyle();
    }, [isForegroundPanes]);


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
            <FormControl fullWidth sx={{ alignItems: 'center' }}>
                <FormControlLabel control={<Switch checked={isForegroundPanes} onChange={() => setIsForegroundPanes(prev => !prev)} />} label="Foreground Panes" />
            </FormControl>

            <Divider />

            <Stack spacing={0.5} width='-webkit-fill-available' height='100%'>
                {
                    processesList?.filter((process) => !process.hidden).map((value, index) => {
                        const Process = Processes.find(p => p.id === value.id);
                        return Process?.render();
                    })
                }
            </Stack>

            {/* <Divider /> */}
            {/* <Typography maxHeight='19px'>Created by Sofiane GUEZZAR</Typography> */}
        </Stack>
    )
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
    var paneOption: Xrm.App.PaneOptions = {
        paneId: ProcessButton.prefixId + "dynamicstoolsmenu",
        title: "Dynamics Side Tools Menu",
        canClose: false,
        imageSrc: GetUrl("icons/muiwand.png"),
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
            <MainScreen />,
            mainSidePane
        );
    });

    new XrmObserver();

}

debugLog("Main loaded");
