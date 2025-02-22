import { createTheme, ThemeProvider } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import React, { forwardRef, useMemo } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../../utils/global/.processClass';

import MapIcon from '@mui/icons-material/Map';

import NavigationToSolutionList from './containers/NavigationToSolutionList';
import NavigationToPowerAdmin from './containers/NavigationToPowerAdmin';
import NavigationToSecurity from './containers/NavigationToSecurity';
import NavigationToFormEditor from './containers/NavigationToFormEditor';
import NavigationAzurePortal from './containers/NavigationToAzurePortal';
import AdvancedFind from './containers/NavigationToAdvancedFind';
import NavigationToPowerAutomate from './containers/NavigationToPowerAutomate';
import { List, Typography } from '@mui/material';
import NavigationToPowerApps from './containers/NavigationToPowerApps';


class NavigationButton extends ProcessButton {
    constructor() {
        super(
            'navigation',
            'Navigation',
            <MapIcon />,
            175
        );
        this.process = NavigationProcess;
        this.description = <>
            <Typography><i>Access everything you need in one place.</i></Typography>
            <Typography>This tool provides quick access to various essential resources:</Typography>
            <List sx={{ listStyleType: 'disc', ml: 3, pt: 0 }}>
                <Typography component='li'><u>Solutions</u>: Opens the <b>solution list</b> or the <b>selected solution</b> in an other tab. Choose between the classic interface or PowerApps.</Typography>
                <Typography component='li'><u>Form Editor</u>: Opens the <b>form editor</b> of the currently opened form in an other tab. Choose between the classic interface or PowerApps.</Typography>
                <Typography component='li'><u>Advanced Find</u>: Opens the good old <b>Advanced Find</b> in a new tab, automatically focusing on the currently viewed entity.</Typography>
                <Typography component='li'><u>Power Apps Home</u></Typography>
                <Typography component='li'><u>Power Automate Home</u></Typography>
                <Typography component='li'><u>Admin Power Platform</u></Typography>
                <Typography component='li'><u>Environments</u>: Opens the environment list of the tenant on admin center.</Typography>
                <Typography component='li'><u>Azure Portal</u>: Opens the tenant's Azure portal.</Typography>
                <Typography component='li'><u>Security</u>: Opens the classic interface security page of the advanced settings.</Typography>
            </List>
        </>
    }
}

const theme = createTheme({
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    maxWidth: "46px",
                    minWidth: "auto"
                },
                startIcon: {
                    marginLeft: 0,
                    marginRight: 0
                }
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    fontSize: '1em'
                }
            }
        }
    },
});

const buttons = [
    NavigationToSolutionList,
    NavigationToFormEditor,
    AdvancedFind,
    NavigationToPowerApps,
    NavigationToPowerAutomate,
    NavigationToPowerAdmin,
    NavigationAzurePortal,
    NavigationToSecurity,
];

const NavigationProcess = forwardRef<ProcessRef, ProcessProps>(
    function NavigationProcess(props: ProcessProps, ref) {

        const environmentId = useMemo(() => (Xrm.Utility.getGlobalContext().organizationSettings as any).bapEnvironmentId, []);
        const clientUrl = useMemo(() => Xrm.Utility.getGlobalContext().getClientUrl(), []);

        return (
            <ThemeProvider theme={theme}>
                <Stack spacing={2} height='calc(100% - 10px)' padding='10px' alignItems='center'>
                    {
                        buttons.map(Button => {
                            return <Button environmentId={environmentId} clientUrl={clientUrl} />
                        })
                    }
                </Stack>
            </ThemeProvider>
        );
    }
);




const navigation = new NavigationButton();
export default navigation;