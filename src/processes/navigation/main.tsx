
import { Box, Button, createTheme, Divider, Drawer, List, ListItemButton, ListItemText, ThemeProvider, Tooltip, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState, } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../../utils/global/.processClass';
import HandymanIcon from '@mui/icons-material/Handyman';

// import NavigationIcon from '@mui/icons-material/Navigation';
import MapIcon from '@mui/icons-material/Map';

import ComponentContainer from '../../utils/components/ComponentContainer';
import { OldSolutionIcon, PowerAppsIcon } from './icons';
import { RetrieveAllAttributes } from '../../utils/hooks/XrmApi/RetrieveAllAttributes';
import { RetrieveAttributes } from '../../utils/hooks/XrmApi/RetrieveAttributes';
import { RetrieveSolutions } from '../../utils/hooks/XrmApi/RetrieveSolutions';
import { useBoolean } from 'usehooks-ts';
import FilterInput from '../../utils/components/FilterInput';
import SolutionList from './containers/SolutionList';


class NavigationButton extends ProcessButton {
    constructor() {
        super(
            'navigation',
            'Navigation',
            <MapIcon />,
            130
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


const NavigationProcess = forwardRef<ProcessRef, ProcessProps>(
    function NavigationProcess(props: ProcessProps, ref) {


        return (
            <ThemeProvider theme={theme}>
                <Stack spacing={4} width='calc(100% - 10px)' padding='10px' alignItems='center'>
                    <SolutionList />
                </Stack>
            </ThemeProvider>
        );
    }
);




const navigation = new NavigationButton();
export default navigation;