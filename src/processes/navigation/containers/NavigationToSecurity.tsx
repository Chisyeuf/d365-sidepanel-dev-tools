import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';

import { NavigationButton } from '../../../utils/types/NavigationButton';
import D365NavBarIcon from '../../../utils/components/D365NavBarIcon';
import { Textfit } from 'react-textfit';


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
            window.onload = () => {
                waitForElm("#TabSettings").then((TabSettings) => {
                    TabSettings.click();
                    waitForElm("#nav_security").then((nav_security) => {
                        nav_security.click();
                    });
                });
            }`;
            new_Window!.document.head.appendChild(script);
        }, 1000);

    }

    return (
        <Tooltip placement='left' title='Legacy Interface - Security Panel'>
            <Button
                variant='outlined'
                onClick={handleClick}
                startIcon={<D365NavBarIcon iconX={-273} iconY={-103} width={20} />}
                sx={{
                    width: '100%',
                    maxWidth: 'calc(100% - 10px)',
                    gap: '0.4em',
                    padding: '5px 10px',
                    justifyContent: 'flex-start',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                }}

            >
                <Box width='calc(100% - 20px)'>
                    <Textfit mode='single' forceSingleModeWidth={false}>
                        Security
                    </Textfit>
                </Box>
            </Button>
        </Tooltip>
    )
}

export default NavigationToSecurity;

