import createTheme from '@mui/material/styles/createTheme';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../../utils/global/.processClass';
import HandymanIcon from '@mui/icons-material/Handyman';

import GodMode from './containers/GodMode';
import LabelTools from './containers/LabelTools';

import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import DOMObserver from '../../utils/global/DOMObserver';
import { Env } from '../../utils/global/var';
import OtherTools from './containers/OtherTools';
import RefreshButtons from './containers/RefreshButtons';
import { useCurrentFormContext } from '../../utils/hooks/use/useCurrentFormContext';
import { FormContext } from '../../utils/types/FormContext';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useWindowSize } from 'usehooks-ts';

class FormToolsButton extends ProcessButton {
    constructor() {
        super(
            'formtools',
            'Form Tools',
            <HandymanIcon />,
            56
        );
        this.process = FormToolsProcess;
    }

    reStyleSidePane(sidePane: HTMLElement | null, sidePaneContent?: HTMLElement | null, header?: HTMLElement | null, title?: HTMLElement | null, closeButton?: HTMLElement | null): void {
        if (title) {
            title.style.alignSelf = "unset";
            title.style.maxHeight = "none";
            title.style.writingMode = "vertical-rl";
        }
        if (header) {
            header.style.flexDirection = "column-reverse";
        }
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

var domObserver: DOMObserver | null = null;

const toolsList: ((props: SubProcessProps) => JSX.Element)[] = [LabelTools, GodMode, RefreshButtons, OtherTools /** Blur fields, Dirty fields */];


const FormToolsProcess = forwardRef<ProcessRef, ProcessProps>(
    function FormToolsProcess(props: ProcessProps, ref) {

        const mainStackRef = useRef<HTMLDivElement>(null);
        const [domUpdated, setDomUpdated] = useState<boolean>(false);

        const currentFormContext = useCurrentFormContext();

        const { height, width } = useWindowSize();


        const xrmObserverCallback = useCallback(() => {
            setDomUpdated(prev => !prev);
        }, []);

        useImperativeHandle(ref, () => {
            return ({
                onClose() {
                    domObserver?.removeListener(xrmObserverCallback);
                }
            });
        }, [xrmObserverCallback]);

        useEffect(() => {
            if (!domObserver) {
                domObserver = new DOMObserver('formtools-domupdated', document.querySelector('#shell-container'), { childList: true, subtree: true });
            }
            domObserver.addListener(xrmObserverCallback);
        }, [xrmObserverCallback]);

        const isScollEnable = useMemo(() => mainStackRef.current && mainStackRef.current.scrollHeight > mainStackRef.current.clientHeight, [height, width]);
        const isScollTop = useMemo(() => mainStackRef.current && mainStackRef.current.scrollTop <= 10, [height, width, mainStackRef.current?.scrollTop]);
        const isScollBottom = useMemo(() => mainStackRef.current && mainStackRef.current.scrollHeight - 10 <= mainStackRef.current.clientHeight + mainStackRef.current.scrollTop, [height, width, mainStackRef.current?.scrollTop]);


        return (
            <ThemeProvider theme={theme}>
                <Stack height='100%' justifyContent='space-between'>

                    <Stack
                        width='100%'
                        alignItems='center'
                        sx={{
                            visibility: isScollEnable && !isScollTop ? 'visible' : 'hidden',
                            rotate: '180deg',
                        }}
                    >
                        <KeyboardArrowDownIcon />
                    </Stack>

                    <Stack ref={mainStackRef} spacing={4} height='calc(100% - 10px)' p='10px' pr={0} alignItems='center' sx={{ overflowY: 'auto', scrollbarWidth: 'none' }}>
                        {
                            Env.DEBUG &&
                            <Tooltip title={currentFormContext ? 'Context found' : 'Context unfound. Try to refresh'} >
                                <Stack alignItems='center' pr='25%'>
                                    {currentFormContext ? <WifiIcon color='success' /> : <WifiOffIcon color='error' />}
                                    <Typography
                                        fontSize='0.6em'
                                        variant='caption'
                                    >
                                        {currentFormContext ? 'Active' : 'Inactive'}
                                    </Typography>
                                </Stack>
                            </Tooltip>
                        }
                        {
                            toolsList?.map((SubProcess, index) => {
                                return (
                                    <SubProcess
                                        currentFormContext={currentFormContext}
                                        domUpdated={domUpdated}
                                    />
                                );
                            })
                        }
                    </Stack>
                    <Stack
                        width='100%'
                        alignItems='center'
                        sx={(theme) => ({
                            // background: `linear-gradient(0deg, ${theme.palette.background.paper} 60%, rgba(9,9,121,0) 100%)`,
                            visibility: isScollEnable && !isScollBottom ?  'visible' : 'hidden',
                        })}
                    >
                        <KeyboardArrowDownIcon />
                    </Stack>
                </Stack>
            </ThemeProvider>
        );
    }
);


export type SubProcessProps = {
    currentFormContext: FormContext,
    domUpdated?: boolean
}



const formTools = new FormToolsButton();
export default formTools;