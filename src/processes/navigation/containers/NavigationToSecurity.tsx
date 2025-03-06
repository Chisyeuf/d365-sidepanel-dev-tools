import Tooltip from '@mui/material/Tooltip';

import { NavigationButton } from '../../../utils/types/NavigationButton';
import D365NavBarIcon from '../../../utils/components/D365NavBarIcon';
import DirectNavigationButton from '../components/NavigationButton';


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
        <DirectNavigationButton
            icon={<D365NavBarIcon iconX={-273} iconY={-103} width={20} />}
            label='Legacy Security'
            onClick={handleClick}
            tooltip='Legacy Interface - Security Panel'
        />
    )
}

export default NavigationToSecurity;

