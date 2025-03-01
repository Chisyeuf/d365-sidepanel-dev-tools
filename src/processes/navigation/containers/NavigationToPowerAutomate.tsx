import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';

import { NavigationButton } from '../../../utils/types/NavigationButton';
import { Textfit } from 'react-textfit';
import { PowerAutomateIcon } from '../icons';

function ToPowerAutomate(props: NavigationButton) {
    const { environmentId, clientUrl } = props;

    function handleClick() {
        window.open(`https://make.powerautomate.com/environments/${environmentId}/home`, '_blank');
    }

    return (
        <Tooltip placement='left' title='Power Automate - Home' disableInteractive arrow>
            <Button
                variant='outlined'
                onClick={handleClick}
                startIcon={<PowerAutomateIcon />}
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
                    <Textfit mode='single'>
                        Power Automate
                    </Textfit>
                </Box>
            </Button>
        </Tooltip>
    )
}

export default ToPowerAutomate;