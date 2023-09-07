
import { Button, Tooltip } from '@mui/material';
import { Stack } from '@mui/system';
import React from 'react';

// import NavigationIcon from '@mui/icons-material/Navigation';

import ComponentContainer from '../../../utils/components/ComponentContainer';
import { PowerAppsIcon } from '../icons';
import { NavigationButton } from '../../../utils/types/NavigationButton';
import D365NavBarIcon from '../../../utils/components/D365NavBarIcon';

declare var processLink: any;
// (() => {
//     console.log("processLink");
//     setTimeout(() => {
//         processLink("systemuser","adminsecurity_area.aspx?pid=06&web=true");
//     }, 500);
//     // processLink("systemuser","adminsecurity_area.aspx?pid=06&web=true")
//     // Mscrm.PageManager.get_instance().raiseEvent(21, { uri: "/tools/AdminSecurity/adminsecurity_area.aspx?pid=06&web=true" });
// })();

function NavigationToSecurity(props: NavigationButton) {
    const { environmentId, clientUrl } = props;

    function handleClick() {
        const new_Window = window.open(`${clientUrl}/main.aspx?settingsonly=true`, '_blank',);

        new_Window!.onload = function () {
            const script = document.createElement('script');
            script.innerHTML = `
            function waitForElm(selector) {
                return new Promise((resolve) => {
                    if (document.querySelector(selector)) {
                        return resolve(document.querySelector(selector));
                    }
            
                    const observer = new MutationObserver((mutations) => {
                        if (document.querySelector(selector)) {
                            resolve(document.querySelector(selector));
                            observer.disconnect();
                        }
                    });
            
                    observer.observe(document.body, {
                        childList: true,
                        subtree: true
                    });
                });
            }
            (() => {
                console.log("processLink");
                debugger;
                waitForElm("#TabSettings").then((TabSettings) => {
                    TabSettings.click();
                    waitForElm("#nav_security").then((nav_security) => {
                        nav_security.click();
                        setTimeout(() => {
                            document.querySelector("#contentIFrame0").contentWindow.processLink("systemuser", "adminsecurity_area.aspx?pid=06&web=true");
                        }, 500);
                    });
                });
            })();`;
            new_Window!.document.head.appendChild(script);
        };

    }

    return (
        <>
            <ComponentContainer width='100%' Legends={{ top: { position: 'center', component: 'Security', padding: '5px' } }}>
                <Stack spacing={1} width='calc(100% - 10px)' padding='5px' direction='row'>
                    <Tooltip placement='top' title='Security Panel'>
                        <Button
                            variant='outlined'
                            onClick={handleClick}
                            startIcon={<D365NavBarIcon iconX={-273} iconY={-103} width={20} />}
                            sx={{
                                width: '100%',
                                maxWidth: '100%',
                            }}
                        />
                    </Tooltip>
                </Stack>
            </ComponentContainer>
        </>
    )
}

export default NavigationToSecurity;

