import React, { useEffect } from 'react';
import Stack from '@mui/material/Stack';

import Processes, { defaultProcessesList, storageListName, StorageProcessList } from '../processes/.list';

import ReactDOM from 'react-dom';

import reportWebVitals from '../reportWebVitals';
import { GetData, GetUrl, waitForElm } from '../utils/global/common';
import { useEffectOnce } from 'usehooks-ts';
import XrmObserver from '../utils/global/XrmObserver';


export const MainScreen: React.FunctionComponent = () => {
    const processesListString = GetData(storageListName)
    const processesList: StorageProcessList[] = !processesListString || processesListString == '' ? defaultProcessesList : JSON.parse(processesListString)

    useEffect(() => {
        processesList.filter((processid) => processid.startOnLoad).forEach((processid) => {
            const process = Processes.find(p => p.id === processid.id)
            process?.openSidePane(processid.expand)
        })
    }, [])
    

    return (
        <Stack spacing={0.5} width={"100%"} padding={"10px"}>
            {
                processesList?.filter((process) => !process.hidden).map((value, index) => {
                    const process = Processes.find(p => p.id === value.id)
                    return process?.render()
                })
            }
        </Stack>)
}


var loading = setInterval(() => {
    if (Xrm != null) {
        clearInterval(loading);
        initExtension();
    }
}, 100);


function initExtension() {
    var paneOption: Xrm.App.PaneOptions = {
        paneId: "dynamicsToolsMenu",
        title: "Dynamics Tools Menu",
        canClose: false,
        imageSrc: GetUrl("icons/favicon.ico"),
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


// ReactDOM.render(<App />, document.getElementById('root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
console.log("Main loaded");
