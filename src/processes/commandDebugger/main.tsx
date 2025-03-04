
import { ProcessButton } from '../../utils/global/.processClass';

import TroubleshootIcon from '@mui/icons-material/Troubleshoot';
import SearchIcon from '@mui/icons-material/Search';
import { Typography } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';

class CommandDebugger extends ProcessButton {
    constructor() {
        super(
            'ribbondebugenabler',
            () => new URL(window.location.href).searchParams.get('ribbondebug') === 'true' ? 'Turn off Command Checker' : 'Turn on Command Checker',
            () => <TroubleshootIcon />,
            1,
            false
        );
        this.panelButtonName = new URL(window.location.href).searchParams.get('ribbondebug') === 'true' ? <><Typography>Command Checker is <i><b>Active</b></i></Typography><Typography><b>Click here to turn OFF</b></Typography></> : <><Typography>Command Checker is <i><b>Inactive</b></i></Typography><Typography><b>Click here to turn ON</b></Typography></>;
        this.panelButtonIcon = new URL(window.location.href).searchParams.get('ribbondebug') === 'true' ? <TroubleshootIcon color='primary' /> : <SearchOffIcon />
        this.description = <>
            <Typography>This button enable or disable the debugger for model-app ribbons.</Typography>
        </>
    }

    execute(): void {
        const newLocationUrl = new URL(window.location.href);
        const currentRibbondebug = newLocationUrl.searchParams.get('ribbondebug');
        const newRibbondebug = currentRibbondebug === 'true' ? 'false' : 'true';
        newLocationUrl.searchParams.set('ribbondebug', newRibbondebug);
        window.location.replace(newLocationUrl);
    };
}

// const CommandDebuggerPanel = forwardRef<ProcessRef, ProcessProps>(
//     function CommandDebuggerPanel(props: ProcessProps) {

//         useEffectOnce(() => {
//             const newLocationUrl = new URL(window.location.href);
//             const currentRibbondebug = newLocationUrl.searchParams.get('ribbondebug');
//             const newRibbondebug = currentRibbondebug === 'true' ? 'false' : 'true';
//             newLocationUrl.searchParams.set('ribbondebug', newRibbondebug);
//             window.location.replace(newLocationUrl);
//         });

//         return (
//             <>If you see this text: an  error occured.</>
//         )
//     }
// );




const commandDebugger = new CommandDebugger();
export default commandDebugger;