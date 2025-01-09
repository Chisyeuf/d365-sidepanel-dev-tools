import '../utils/global/extensions';

import React, { useCallback } from 'react';
import ReactDOM from 'react-dom';

import { Alert, Button, Container, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';

import { defaultProcessesList } from '../processes/.list';

import { debugLog, waitForElm } from '../utils/global/common';
import { useChromeStorage } from '../utils/hooks/use/useChromeStorage';
import { StorageConfiguration } from '../utils/types/StorageConfiguration';
import { MessageType } from '../utils/types/Message';
import { storage_DontShowImpersonationInfo, storage_ListName } from '../utils/global/var';

const OptionsScreen: React.FunctionComponent = () => {

    const [processesList, setProcessList] = useChromeStorage<StorageConfiguration[]>(storage_ListName, defaultProcessesList);


    const resetImpersonate = useCallback(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const activeTab = tabs[0];
            const activeTabURL = activeTab.url;
            if (!activeTab.id || !activeTabURL) return;

            const urlObject = new URL(activeTabURL);

            chrome.runtime.sendMessage({ type: MessageType.IMPERSONATE, data: { userSelected: null, selectedon: new Date(), url: urlObject.origin } },
                function () {
                    chrome.tabs.reload(activeTab.id!, { bypassCache: true })
                }
            );

        });
    }, []);


    const resetProcessList = useCallback(() => {
        setProcessList(defaultProcessesList);
    }, [setProcessList, defaultProcessesList]);


    const resetDontShowImpersonationInfo = useCallback(() => {
        chrome.runtime.sendMessage({ type: MessageType.SETCONFIGURATION, data: { key: storage_DontShowImpersonationInfo, configurations: false } },
            function (response) {
                if (response.success) { }
            }
        );
    }, []);




    return (
        <Container sx={{ width: '600px', p: 2 }}>

            <Stack direction='column' spacing={1}>

                <Alert severity='warning'>
                    <Typography component='p' fontWeight='bold' fontSize='0.95rem'>
                        This section is not where you can use this extension:
                    </Typography>
                    <Typography component='p' fontSize='0.95rem'>
                        D365 SidePanel Tools adds a panel at the right of Dynamics 365 pages.
                    </Typography>
                </Alert>

                <Alert severity='info'>
                    <Typography component='p' fontSize='0.95rem'>
                        This screen contains buttons that can be used to reset some features of this extension.
                    </Typography>
                </Alert>

                <Button
                    variant='contained'
                    onClick={resetProcessList}>
                    Reset Tool List
                </Button>

                <Button
                    variant='contained'
                    onClick={resetImpersonate}>
                    Rest Impersonation on Active tab
                </Button>

                <Button
                    variant='contained'
                    onClick={resetDontShowImpersonationInfo}>
                    Reset "Don't Show" Impersonation Info
                </Button>

            </Stack>
        </Container>
    )
}


waitForElm(document, '#root').then((rootDiv) => {
    ReactDOM.render(
        <OptionsScreen />,
        rootDiv
    );
});

debugLog("Option loaded");
export { }