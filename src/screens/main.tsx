import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import Stack from '@mui/material/Stack';

import Processes, { defaultProcessesList, storageListName } from '../processes/.list';
import { debugLog, GetData, GetExtensionId, GetUrl, waitForElm } from '../utils/global/common';
import XrmObserver from '../utils/global/XrmObserver';

import { StorageConfiguration } from '../utils/types/StorageConfiguration';
import { MessageType } from '../utils/types/Message';


export const MainScreen: React.FunctionComponent = () => {

    const extensionId = GetExtensionId();

    const [processesList, setProcessesList] = useState<StorageConfiguration[]>([]);

    useEffect(() => {
        chrome.runtime.sendMessage(extensionId, { type: MessageType.GETCONFIGURATION, data: { key: storageListName } },
            function (response: StorageConfiguration[]) {
                if (response.length !== defaultProcessesList.length) {
                    chrome.runtime.sendMessage(extensionId, { type: MessageType.SETCONFIGURATION, data: { key: storageListName, configurations: defaultProcessesList } },
                        function () { }
                    );
                    setProcessesList(defaultProcessesList);
                    return;
                }

                if (response) {
                    console.log(response);
                    setProcessesList(response);
                }
                else {
                    console.log(defaultProcessesList);
                    setProcessesList(defaultProcessesList);
                }

            }
        );
    }, [extensionId]);


    // const processesListString = undefined
    // const processesList: StorageConfiguration[] = !processesListString || processesListString == '' ? defaultProcessesList : JSON.parse(processesListString)

    useEffect(() => {
        processesList.filter((processid) => processid.startOnLoad)
            .sort((processA, processB) => processA.startOnPosition! - processB.startOnPosition!)
            .forEach((processid) => {
                const process = Processes.find(p => p.id === processid.id)
                process?.openSidePane(processid.expand)
            })
    }, [processesList]);

    return (
        <Stack spacing={0.5} width='-webkit-fill-available' padding='10px'>
            {
                processesList?.filter((process) => !process.hidden).map((value, index) => {
                    const Process = Processes.find(p => p.id === value.id)
                    return Process?.render()
                })
            }
        </Stack>
    )
}


var loading = setInterval(() => {
    if (Xrm != null) {
        clearInterval(loading);
        initExtension();
    }
}, 200);


function initExtension() {
    var paneOption: Xrm.App.PaneOptions = {
        paneId: "dynamicsToolsMenu",
        title: "Dynamics Tools Menu",
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

    waitForElm('#dynamicsToolsMenu > div > div:last-child').then((mainSidePane) => {
        ReactDOM.render(
            <MainScreen />,
            mainSidePane
        );
    });

    new XrmObserver();

}

debugLog("Main loaded");
