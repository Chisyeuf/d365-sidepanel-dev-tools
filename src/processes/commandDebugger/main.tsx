
import { ProcessButton } from '../../utils/global/.processClass';

import TroubleshootIcon from '@mui/icons-material/Troubleshoot';

class CommandDebugger extends ProcessButton {
    constructor() {
        super(
            'ribbondebugenabler',
            () => new URL(window.location.href).searchParams.get('ribbondebug') === 'true' ? 'Turn off Command Checker' : 'Turn on Command Checker',
            <TroubleshootIcon />,
            1,
            false
        );
    }

    execute(): void {
        const newLocationUrl = new URL(window.location.href);
        const currentRibbondebug = newLocationUrl.searchParams.get('ribbondebug');
        const newRibbondebug = currentRibbondebug === 'true' ? 'false' : 'true';
        newLocationUrl.searchParams.set('ribbondebug', newRibbondebug);
        window.location.replace(newLocationUrl);
    };
}





const commandDebugger = new CommandDebugger();
export default commandDebugger;