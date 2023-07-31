
import React, { } from 'react';
import { ProcessButton } from '../../utils/global/.processClass';

import TroubleshootIcon from '@mui/icons-material/Troubleshoot';

class CommandDebugger extends ProcessButton {
    constructor() {
        super(
            'ribbondebugenabler',
            'Toggle Command Checker',
            <TroubleshootIcon />,
            100
        );
    }

    openSidePane(selected: boolean = true): void {
        const newLocationUrl = new URL(location.href);
        const currentRibbondebug = newLocationUrl.searchParams.get('ribbondebug');
        const newRibbondebug = !currentRibbondebug || currentRibbondebug === 'false' ? 'true' : 'false';
        newLocationUrl.searchParams.set('ribbondebug', newRibbondebug);
        location.replace(newLocationUrl);
    };
}





const commandDebugger = new CommandDebugger();
export default commandDebugger;