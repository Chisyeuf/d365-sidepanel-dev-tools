import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useEffectOnce } from 'usehooks-ts';

import {
    createGenerateClassName, createStyles, createTheme, makeStyles, MuiThemeProvider,
    StylesProvider, Theme, ThemeProvider
} from '@material-ui/core';
import { unstable_ClassNameGenerator as ClassNameGenerator } from '@mui/material/className';
import Stack from '@mui/material/Stack';

import Processes, {
    defaultProcessesList, storageListName, StorageProcessList
} from '../processes/.list';
import reportWebVitals from '../reportWebVitals';
import { ProcessButton } from '../utils/global/.processClass';
import { GetData, GetUrl, waitForElm } from '../utils/global/common';
import XrmObserver from '../utils/global/XrmObserver';

// ClassNameGenerator.configure(
//     // Do something with the componentName
//     (componentName) => `sidepanel-dev-tools-updateRecord-${componentName}`,
// );

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            padding: '10px'
        },
    }),
);

export const MainScreen: React.FunctionComponent = () => {
    const classes = useStyles();

    const processesListString = GetData(storageListName)
    const processesList: StorageProcessList[] = !processesListString || processesListString == '' ? defaultProcessesList : JSON.parse(processesListString)

    useEffect(() => {
        processesList.filter((processid) => processid.startOnLoad).forEach((processid) => {
            const process = Processes.find(p => p.id === processid.id)
            process?.openSidePane(processid.expand)
        })
    }, [])

    return (
        <Stack spacing={0.5} className={classes.root}>
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
}, 100);


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


// ReactDOM.render(<App />, document.getElementById('root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
console.log("Main loaded");
