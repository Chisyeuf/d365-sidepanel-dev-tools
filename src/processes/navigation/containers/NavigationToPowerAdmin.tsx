import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';

import { PowerEnvironmentIcon } from '../icons';
import { NavigationButton } from '../../../utils/types/NavigationButton';
import { Textfit } from 'react-textfit';
import DirectNavigationButton from '../components/NavigationButton';

function PowerAdmin(props: NavigationButton) {
    const { environmentId, clientUrl } = props;

    function handleClickEnvironment() {
        handleClick("/environments");
    }
    function handleClick(add: string = '') {
        window.open(`https://admin.powerplatform.microsoft.com${add}`, '_blank');
    }

    return (
        <>
            <DirectNavigationButton
                icon={<img height='20px' src='https://admin.powerplatform.microsoft.com/favicon.ico' alt='powerplatform' />}
                label='Power Platform Admin'
                onClick={handleClick}
                tooltip='Power Platform Admin Center - Home'
            />

            <DirectNavigationButton
                icon={<PowerEnvironmentIcon />}
                label='Environments'
                onClick={handleClickEnvironment}
                tooltip='Power Platform Admin Center - Environments List'
            />
        </>
    )
}

export default PowerAdmin;