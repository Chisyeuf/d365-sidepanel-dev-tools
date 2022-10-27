import React, { } from 'react';
import Stack from '@mui/material/Stack';

import Processes from '../processes/.list';

import ReactDOM from 'react-dom';

import reportWebVitals from '../reportWebVitals';
import { GetUrl, waitForElm } from '../utils/global/common';

// const stackTokens: IStackTokens = { childrenGap: 5 };
// const stackStyles: Partial<IStackStyles> = {
//     root: {
//         width: "100%",
//         padding: "10px"
//     },
// }

export const MainScreen: React.FunctionComponent = () => {
    return (
        <Stack spacing={0.5} width={"100%"} padding={"10px"}>
            {
                Processes.map((value, index) => {
                    return value.render();
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
}


// ReactDOM.render(<App />, document.getElementById('root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
console.log("Main loaded");
