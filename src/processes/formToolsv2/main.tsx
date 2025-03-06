import createTheme from '@mui/material/styles/createTheme';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import Stack from '@mui/material/Stack';
import { forwardRef, useContext, useMemo, useRef } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../../utils/global/.processClass';
import HandymanIcon from '@mui/icons-material/Handyman';

import LabelIcon from '@mui/icons-material/Label';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useWindowSize } from 'usehooks-ts';
import { ToggableToolButtonContainer, ToolButtonContainer } from './ToolButtonContainer';
import ShowFieldLabel from './toolButtons/ShowFieldLabel';
import VisibleMode from './toolButtons/VisibleMode';

import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import ShowTabLabel from './toolButtons/ShowTabLabel';
import { OptionalMode } from './toolButtons/OptionalMode';
import { EnableMode } from './toolButtons/EnableMode';
import RefreshRibbon from './toolButtons/RefreshRibbon';
import RefreshForm from './toolButtons/RefreshForm';
import FormToolContextProvider, { FormToolContext } from './context';
import FillFields from './toolButtons/FillFields';
import ShowOptionSetInFields from './toolButtons/ShowOptionSetInFields';
import CloneRecord from './toolButtons/CloneRecord';
import BlurFields from './toolButtons/BlurFields';
import { useSpDevTools } from '../../utils/global/spContext';


class FormToolsButtonV2 extends ProcessButton {
    constructor() {
        super(
            'formtoolsv2',
            'Form Tools',
            <HandymanIcon />,
            56
        );
        this.process = FormToolsProcessV2;
        this.description = <>
            <Typography><i>Randomize, visualize, and master your data.</i></Typography>
            <Typography>This tool provide functionnalities used on records form.</Typography>
            <Typography>You will be able to <b>display logical names</b>, <b>manage field controls</b>, refresh data, <b>fill fields</b> with random data, <b>clone your records</b> and <b>blur sensitive informations</b>.</Typography>
            <Typography><u>Some buttons are reversible</u>: it can be activated or deactivated without refreshing the page.</Typography>
        </>
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


function DebugIndicator() {
    const { formContext, isRefreshing } = useContext(FormToolContext);

    return (
        <Tooltip title={formContext ? `Context found for ${formContext?.data?.entity?.getEntityName()}` : 'Context not found.'} disableInteractive arrow>
            <Stack alignItems='center' pr='25%'>
                {formContext ? <WifiIcon color='success' /> : <WifiOffIcon color='error' />}
                <Typography
                    fontSize='0.6em'
                    variant='caption'
                    lineHeight={1}
                >
                    {formContext ? 'Active' : 'Inactive'}
                </Typography>
                <Typography
                    fontSize='0.6em'
                    variant='caption'
                    lineHeight={1}
                >
                    {formContext ? (formContext.data?.entity?.getEntityName() ?? 'unfound') : 'none'}
                </Typography>
                <Typography
                    fontSize='0.6em'
                    variant='caption'
                    lineHeight={1}
                    whiteSpace='nowrap'
                >
                    {isRefreshing ? 'Retrieving' : 'Stand By'}
                </Typography>
            </Stack>
        </Tooltip>
    )
}

const FormToolsProcessV2 = forwardRef<ProcessRef, ProcessProps>(
    function FormToolsProcessV2(props: ProcessProps, ref) {

        const { isDebug } = useSpDevTools();

        const mainStackRef = useRef<HTMLDivElement>(null);
        // const { height, width } = useWindowSize();
        const isScollEnable = useMemo(() => mainStackRef.current && mainStackRef.current.scrollHeight > mainStackRef.current.clientHeight, [mainStackRef]);


        return (
            <ThemeProvider theme={theme}>
                <Stack height='100%' justifyContent='space-between'>

                    <Stack
                        width='100%'
                        alignItems='center'
                        sx={{
                            visibility: isScollEnable ? 'visible' : 'hidden',
                            // visibility: isScollEnable && !isScollTop ? 'visible' : 'hidden',
                            rotate: '180deg',
                        }}
                    >
                        <KeyboardArrowDownIcon />
                    </Stack>

                    <FormToolContextProvider>

                        <Stack ref={mainStackRef} spacing={3} height='calc(100% - 10px)' p='10px' pr={0} alignItems='center' sx={{ overflowY: 'auto', scrollbarWidth: 'none' }}>

                            {isDebug.value && <DebugIndicator />}

                            <ToggableToolButtonContainer
                                title='Label Tools'
                                icons={{ enabled: <LabelIcon fontSize='large' />, disabled: <LabelOutlinedIcon fontSize='large' /> }}
                                toolList={[
                                    ShowTabLabel,
                                    ShowFieldLabel,
                                ]}
                            />

                            <ToggableToolButtonContainer
                                title='God Mode'
                                icons={{ enabled: <TipsAndUpdatesIcon fontSize='large' />, disabled: <TipsAndUpdatesOutlinedIcon fontSize='large' /> }}
                                toolList={[
                                    OptionalMode,
                                    EnableMode,
                                    VisibleMode,
                                ]}
                            />

                            <ToolButtonContainer
                                title='Refresh'
                                toolList={[
                                    RefreshRibbon,
                                    RefreshForm,
                                ]}
                            />

                            <ToolButtonContainer
                                toolList={[
                                    ShowOptionSetInFields,
                                    FillFields,
                                    CloneRecord,
                                    BlurFields,
                                ]}
                            />

                        </Stack>
                    </FormToolContextProvider>

                    <Stack
                        width='100%'
                        alignItems='center'
                        sx={{
                            visibility: isScollEnable ? 'visible' : 'hidden',
                            // visibility: isScollEnable && !isScollBottom ? 'visible' : 'hidden',
                        }}
                    >
                        <KeyboardArrowDownIcon />
                    </Stack>
                </Stack>
            </ThemeProvider>
        );
    }
);



const formToolsV2 = new FormToolsButtonV2();
export default formToolsV2;