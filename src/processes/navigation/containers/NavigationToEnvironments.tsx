
import { Button, Tooltip } from '@mui/material';
import React from 'react';

import { PowerEnvironmentIcon } from '../icons';
import { NavigationButton } from '../../../utils/types/NavigationButton';

function Environments(props: NavigationButton) {
    const { environmentId, clientUrl } = props;

    function handleClick() {
        window.open(`https://admin.powerplatform.microsoft.com/environments`, '_blank');
    }

    return (
        <>
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