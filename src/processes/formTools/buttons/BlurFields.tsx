import { Tooltip, Button } from '@mui/material';
import React, { useEffect } from 'react';
import { SubProcessProps } from '../main';

import { LabelToolsSubProcess } from '../containers/LabelTools';
import { useBoolean } from 'usehooks-ts';
import { setStyle } from '../../../utils/global/common';
import BlurOffOutlinedIcon from '@mui/icons-material/BlurOffOutlined';
import BlurOnIcon from '@mui/icons-material/BlurOn';

function BlurFields(props: SubProcessProps) {

    const { currentFormContext, domUpdated } = props;

    const { value: blurEnabled, toggle: toggleBlurEnabled } = useBoolean(false);

    useEffect(() => {
        if (blurEnabled) {
            setStyle("blurFieldsSheet", {
                '[data-id*="fieldControl"], [role="gridcell"], [data-id="header_title"], [id^=headerControlsList]>div>div:first-child': ['filter: blur(4px)']
            });
        }
        else {
            setStyle("blurFieldsSheet", {});
        }
    }, [blurEnabled]);

    return (<>
        <Tooltip title='Blur Data' placement='left'>
            <Button
                variant='contained'
                onClick={toggleBlurEnabled}
                startIcon={blurEnabled ? <BlurOnIcon /> : <BlurOffOutlinedIcon />}
            />
        </Tooltip>
    </>
    );
}

export default BlurFields;