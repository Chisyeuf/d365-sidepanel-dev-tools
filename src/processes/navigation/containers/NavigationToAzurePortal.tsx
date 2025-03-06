import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';

import { AzurePortalIcon, EntraIcon, Microsoft365AdminCenterIcon } from '../icons';
import { Textfit } from 'react-textfit';
import { NavigationButton } from '../../../utils/types/NavigationButton';
import DirectNavigationButton from '../components/NavigationButton';

function AzurePortal(props: NavigationButton) {
    const { environmentId, clientUrl } = props;

    function handleClickAzure() {
        window.open(`https://portal.azure.com/`, '_blank');
    }
    function handleClickEntra() {
        window.open(`https://entra.microsoft.com/#home`, '_blank');
    }
    function handleClickAdmin() {
        window.open(`https://admin.microsoft.com/#/homepage`, '_blank');
    }
    return (
        <>
            <DirectNavigationButton
                icon={<AzurePortalIcon />}
                label='Azure Portal'
                onClick={handleClickAzure}
                tooltip='Microsoft Azure Portal'
            />

            <DirectNavigationButton
                icon={<EntraIcon />}
                label='Microsoft Entra'
                onClick={handleClickEntra}
                tooltip='Microsoft Entra Admin Center'
            />

            <DirectNavigationButton
                icon={<Microsoft365AdminCenterIcon />}
                label='Admin Center'
                onClick={handleClickAdmin}
                tooltip='Microsoft 365 Admin Center'
            />
        </>
    )
}

export default AzurePortal;