import { Tooltip, Button } from '@mui/material';
import React, { useCallback } from 'react';
import { SubProcessProps } from '../main';

import TabUnselectedIcon from '@mui/icons-material/TabUnselected';

function RefreshRibbon(props: SubProcessProps) {

    const { currentFormContext } = props;

    const toggleOptionsDisplay = useCallback(() => {
        currentFormContext?.ui.refreshRibbon(true);
    }, [currentFormContext]);

    return (<>
        <Tooltip title='Refresh Ribbon' placement='left'>
            <Button
                variant='contained'
                onClick={toggleOptionsDisplay}
                startIcon={<TabUnselectedIcon />}
            />
        </Tooltip>
    </>
    );
}

export default RefreshRibbon;