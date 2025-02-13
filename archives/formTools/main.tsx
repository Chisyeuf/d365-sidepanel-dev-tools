import createTheme from '@mui/material/styles/createTheme';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { forwardRef, useContext, useMemo, useRef } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../../utils/global/.processClass';
import HandymanIcon from '@mui/icons-material/Handyman';

import GodMode from './containers/GodMode';
import LabelTools from './containers/LabelTools';

import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import OtherTools from './containers/OtherTools';
import RefreshButtons from './containers/RefreshButtons';
import { FormContext } from '../../utils/types/FormContext';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useWindowSize } from 'usehooks-ts';
import { useFormContextDocument } from '../../utils/hooks/use/useFormContextDocument';
import { useSpDevTools } from '../../utils/global/spContext';

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

const toolsList: ((props: SubProcessProps) => JSX.Element)[] = [LabelTools, GodMode, RefreshButtons, OtherTools /** Blur fields, Dirty fields */];


const FormToolsProcess = forwardRef<ProcessRef, ProcessProps>(
    function FormToolsProcess(props: ProcessProps, ref) {

        const { isDebug } = useSpDevTools();

        const mainStackRef = useRef<HTMLDivElement>(null);
        const { d365MainAndIframeUpdated: domUpdated, formContext } = useFormContextDocument();

        const { height, width } = useWindowSize();

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
                            isDebug.value &&
                            <Tooltip title={formContext ? 'Context found' : 'Context unfound. Try to refresh'} >
                                <Stack alignItems='center' pr='25%'>
                                    {formContext ? <WifiIcon color='success' /> : <WifiOffIcon color='error' />}
                                    <Typography
                                        fontSize='0.6em'
                                        variant='caption'
                                    >
                                        {formContext ? 'Active' : 'Inactive'}
                                    </Typography>
                                </Stack>
                            </Tooltip>
                        }
                        {
                            toolsList?.map((SubProcess, index) => {
                                return (
                                    <SubProcess
                                        currentFormContext={formContext}
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
                            visibility: isScollEnable && !isScollBottom ? 'visible' : 'hidden',
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