
import { Button, Tooltip } from '@mui/material';
import { Stack } from '@mui/system';
import React from 'react';

// import NavigationIcon from '@mui/icons-material/Navigation';

import ComponentContainer from '../../../utils/components/ComponentContainer';
import { PowerAppsIcon, PowerEnvironmentIcon } from '../icons';
import { NavigationButton } from '../../../utils/types/NavigationButton';

function Environments(props: NavigationButton) {
    const { environmentId, clientUrl } = props;

    function handleClick() {
        window.open(`https://admin.powerplatform.microsoft.com/environments`, '_blank');
    }

    return (
        <>
            {/* <ComponentContainer width='100%' Legends={{ top: { position: 'center', component: 'Environments', padding: '5px' } }}>
                <Stack spacing={1} width='calc(100% - 10px)' padding='5px' direction='row'> */}
            <Tooltip placement='left' title='Environments List in Admin Power Platform'>
                <Button
                    variant='outlined'
                    onClick={handleClick}
                    startIcon={<PowerEnvironmentIcon />}
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
                    Environments
                </Button>
            </Tooltip>
            {/* </Stack>
            </ComponentContainer> */}
        </>
    )
}

export default Environments;