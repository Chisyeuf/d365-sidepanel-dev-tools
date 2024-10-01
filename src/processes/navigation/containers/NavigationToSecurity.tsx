
import { Button, Tooltip } from '@mui/material';
import React from 'react';

import { NavigationButton } from '../../../utils/types/NavigationButton';
import D365NavBarIcon from '../../../utils/components/D365NavBarIcon';

declare var processLink: any;

function NavigationToSecurity(props: NavigationButton) {
    const { environmentId, clientUrl } = props;

    function handleClick() {
        const new_Window = window.open(`${clientUrl}/main.aspx?settingsonly=true`, '_blank',);
        setTimeout(() => {

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
                waitForElm("#TabSettings").then((TabSettings) => {
                    TabSettings.click();
                    waitForElm("#nav_security").then((nav_security) => {
                        nav_security.click();
                    });
                });
            })();`;
            new_Window!.document.head.appendChild(script);
        }, 1000);

    }

    return (
        <>
            <Tooltip placement='left' title='Security Panel'>
                <Button
                    variant='outlined'
                    onClick={handleClick}
                    startIcon={<D365NavBarIcon iconX={-273} iconY={-103} width={20} />}
                    sx={{
                        width: '100%',
                        maxWidth: 'calc(100% - 10px)',
                        gap: '0.4em',
                        padding: '5px 10px',
                        justifyContent:'flex-start',
                        overflow:'hidden',
                        whiteSpace:'nowrap',
                    }}

                >
                    Security
                </Button>
            </Tooltip>
            {/* </Stack> */}
            {/* </ComponentContainer> */}
        </>
    )
}

export default NavigationToSecurity;

