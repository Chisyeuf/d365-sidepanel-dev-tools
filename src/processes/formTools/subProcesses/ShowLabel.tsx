import InfoIcon from '@mui/icons-material/Info';
import { Tooltip, IconButton, Stack, Button } from '@mui/material';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ComponentContainer from '../../../utils/components/ComponentContainer';
import { debugLog } from '../../../utils/global/common';
import { SubProcessProps } from '../main';

type ShowLabelSubProcess = {
    enabled: boolean,
    setEnabled: React.Dispatch<React.SetStateAction<boolean>>
}
function ShowLabel(props: SubProcessProps) {

    const { executionContext } = props;
    const [labelDisplayed, setLabelDisplayed] = useState(false);

    
    useEffect(() => {
        toggle();
    }, [executionContext?.getDepth()]);

    const enableableControls = useMemo(async () => {
        if (executionContext) {
            
            return false;
        }
        else {
            return null;
        }

    }, [executionContext?.getDepth()]);

    const toggle = () => {
        setLabelDisplayed((prev) => !prev);
    }

    return (
        <Tooltip title='Show Label' placement='left'>
            <Button
                variant='contained'
                onClick={toggle}
                // startIcon={labelDisplayed ? <VpnKeyIcon /> : <VpnKeyOffOutlinedIcon />}
            // disabled={!executionContext}
            />
        </Tooltip>
    );
}