
import { createTheme, ThemeProvider } from '@mui/material';
import { Stack } from '@mui/system';
import React, { forwardRef, useMemo, } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../../utils/global/.processClass';

// import NavigationIcon from '@mui/icons-material/Navigation';
import MapIcon from '@mui/icons-material/Map';

import NavigationToSolutionList from './containers/NavigationToSolutionList';
import NavigationToEnvironments from './containers/NavigationToEnvironments';
import NavigationToSecurity from './containers/NavigationToSecurity';
import NavigationToFormEditor from './containers/NavigationToFormEditor';
import NavigationAzurePortal from './containers/NavigationToAzurePortal';


class NavigationButton extends ProcessButton {
    constructor() {
        super(
            'navigation',
            'Navigation',
            <MapIcon />,
            175
        );
        this.process = NavigationProcess;
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
    NavigationToEnvironments,
    NavigationAzurePortal,
    NavigationToSecurity
];

const NavigationProcess = forwardRef<ProcessRef, ProcessProps>(
    function NavigationProcess(props: ProcessProps, ref) {

        const environmentId = useMemo(() => (Xrm.Utility.getGlobalContext().organizationSettings as any).bapEnvironmentId, []);
        const clientUrl = useMemo(() => Xrm.Utility.getGlobalContext().getClientUrl(), []);

        return (
            <ThemeProvider theme={theme}>
                <Stack spacing={3} width='calc(100% - 10px)' padding='10px' alignItems='center'>
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