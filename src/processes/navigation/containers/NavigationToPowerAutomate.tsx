
import { Box, Button, Tooltip } from '@mui/material';

import { NavigationButton } from '../../../utils/types/NavigationButton';
import { Textfit } from 'react-textfit';

function ToPowerAutomate(props: NavigationButton) {
    const { environmentId, clientUrl } = props;

    function handleClick() {
        window.open(`https://make.powerautomate.com//environments/${environmentId}`, '_blank');
    }

    return (
        <>

            <Tooltip placement='left' title='Power Automate'>
                <Button
                    variant='outlined'
                    onClick={handleClick}
                    startIcon={<img height='20px' src="https://make.powerautomate.com/favicon.ico" />}
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
                            Power Automate
                        </Textfit>
                    </Box>
                </Button>
            </Tooltip>

        </>
    )
}

export default ToPowerAutomate;