import { Tooltip, Button } from '@mui/material';
import React, { useCallback } from 'react';
import { SubProcessProps } from '../main';

import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';

function RefreshForm(props: SubProcessProps) {

    const { currentFormContext } = props;

    const toggleOptionsDisplay = useCallback(() => {
        currentFormContext?.data.refresh(false);
    }, [currentFormContext]);

    return (<>
        <Tooltip title='Refresh Form Data' placement='left'>
            <Button
                variant='contained'
                onClick={toggleOptionsDisplay}
                startIcon={<ViewQuiltIcon />}
            />
        </Tooltip>
    </>
    );
}

export default RefreshForm;