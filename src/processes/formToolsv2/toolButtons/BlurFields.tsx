import { Tooltip, Button } from '@mui/material';
import React, { useContext, useEffect } from 'react';

import { useBoolean } from 'usehooks-ts';
import { setStyle } from '../../../utils/global/common';
import BlurOffOutlinedIcon from '@mui/icons-material/BlurOffOutlined';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import { IToolButtonStandard, ToolButton } from '../ToolButton';
import { FormToolContext } from '../context';

function BlurFields(props: IToolButtonStandard) {
    
    const { formDocument } = useContext(FormToolContext);
    const { value: blurEnabled, toggle: toggleBlurEnabled } = useBoolean(false);

    useEffect(() => {
        if (blurEnabled) {
            setStyle(formDocument ?? document, "blurFieldsSheet", {
                '[data-id*="fieldControl"], [role="gridcell"], [data-id="header_title"], [id^=headerControlsList]>div>div:first-child': ['filter: blur(4px)']
            });
        }
        else {
            setStyle(formDocument ?? document, "blurFieldsSheet", {});
        }
    }, [blurEnabled, formDocument]);

    return (
        <ToolButton
            controlled={false}
            icon={blurEnabled ? <BlurOnIcon /> : <BlurOffOutlinedIcon />}
            tooltip='Blur Data'
            onClick={toggleBlurEnabled}
        />
    );
}

export default BlurFields;