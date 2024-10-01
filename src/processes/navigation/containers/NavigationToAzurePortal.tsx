
import { Button, Tooltip } from '@mui/material';
import React from 'react';

import { AzurePortalIcon } from '../icons';
import { NavigationButton } from '../../../utils/types/NavigationButton';

function AzurePortal(props: NavigationButton) {
    const { environmentId, clientUrl } = props;

    function handleClick() {
        window.open(`https://portal.azure.com/`, '_blank');
    }
    return (
        <>
            <Tooltip placement='left' title='Azure Portal'>
                <Button
                    variant='outlined'
                    onClick={handleClick}
                    startIcon={<AzurePortalIcon />}
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
                    Azure Portal
                </Button>
            </Tooltip>
            {/* </Stack>
            </ComponentContainer> */}
        </>
    )
}

export default AzurePortal;