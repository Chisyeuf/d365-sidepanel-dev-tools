
import React, { } from 'react';
import { ProcessButton } from '../../utils/global/.processClass';

import TroubleshootIcon from '@mui/icons-material/Troubleshoot';

class CommandDebugger extends ProcessButton {
    constructor() {
        super(
            'ribbondebugenabler',
            () => new URL(location.href).searchParams.get('ribbondebug') === 'true' ? 'Turn off Command Checker' : 'Turn on Command Checker',
            <TroubleshootIcon />,
            1,
            false
        );
    }

    openSidePane(selected: boolean = true): void {
        const newLocationUrl = new URL(location.href);
        const currentRibbondebug = newLocationUrl.searchParams.get('ribbondebug');
        const newRibbondebug = currentRibbondebug === 'true' ? 'false' : 'true';
        newLocationUrl.searchParams.set('ribbondebug', newRibbondebug);
        location.replace(newLocationUrl);
    };
}





const commandDebugger = new CommandDebugger();
export default commandDebugger;