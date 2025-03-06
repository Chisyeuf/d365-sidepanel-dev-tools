import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';

import { NavigationButton } from '../../../utils/types/NavigationButton';
import { Textfit } from 'react-textfit';
import { PowerAppsIcon } from '../icons';
import DirectNavigationButton from '../components/NavigationButton';

function ToPowerApps(props: NavigationButton) {
    const { environmentId, clientUrl } = props;

    function handleClick() {
        window.open(`https://make.powerapps.com/environments/${environmentId}/home`, '_blank');
    }

    return (
        <DirectNavigationButton
            icon={<PowerAppsIcon />}
            label='Power Apps'
            onClick={handleClick}
            tooltip='Power Apps - Home'
        />
    )
}

export default ToPowerApps;