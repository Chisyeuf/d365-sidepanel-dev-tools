import createTheme from '@mui/material/styles/createTheme';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import Stack from '@mui/material/Stack';
import { createContext, forwardRef, PropsWithChildren, useContext, useMemo, useRef } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../../utils/global/.processClass';
import HandymanIcon from '@mui/icons-material/Handyman';

import LabelIcon from '@mui/icons-material/Label';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';

import { FormContext, FormDocument } from '../../utils/types/FormContext';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useWindowSize } from 'usehooks-ts';
import { useXrmUpdated } from '../../utils/hooks/use/useXrmUpdated';
import { noOperation } from '../../utils/global/common';
import { ToggableToolButtonContainer } from './ToolButtonContainer';
import ShowFieldLabel from './toolButtons/ShowFieldLabel';
import VisibleMode from './toolButtons/VisibleMode';

import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import { useFormContextDocument } from '../../utils/hooks/use/useFormContextDocument';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import { Env } from '../../utils/global/var';


class FormToolsButtonV2 extends ProcessButton {
    constructor() {
        super(
            'formtoolsv2',
            'Form Tools V2',
            <HandymanIcon />,
            56
        );
        this.process = FormToolsProcessV2;
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

interface IFormToolContext {
    // getFormContextDocument: () => Promise<FormContextDocument>;
    // isRetrievingFormContext: boolean;
    formContext: FormContext;
    formDocument: FormDocument;
    isRefreshing: boolean;
    refresh: () => Promise<void>;
    domUpdated: boolean;
    xrmRoute: ReturnType<typeof useXrmUpdated>['xrmRoute'];
}
const defaultFormToolContext: IFormToolContext = {
    // getFormContextDocument: noOperation,
    // isRetrievingFormContext: false,
    formContext: null,
    formDocument: null,
    isRefreshing: false,
    refresh: noOperation,
    domUpdated: false,
    xrmRoute: { current: '', previous: '' }
}
export const FormToolContext = createContext<IFormToolContext>(defaultFormToolContext);

function FormToolContextProvider(props: PropsWithChildren) {

    const { xrmRoute } = useXrmUpdated();
    const { formContext, formDocument, isRefreshing, d365MainAndIframeUpdated: domUpdated, refresh } = useFormContextDocument();

    return (
        <FormToolContext.Provider
            value={{
                formContext,
                formDocument,
                isRefreshing,
                refresh,
                domUpdated: domUpdated,
                xrmRoute,
            }}
            {...props}
        />
    );
}

function DebugIndicator() {
    const { formContext, isRefreshing } = useContext(FormToolContext);

    return (
        <Tooltip title={formContext ? `Context found for ${formContext?.data?.entity.getEntityName()}` : 'Context not found.'} disableInteractive arrow>
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

        const mainStackRef = useRef<HTMLDivElement>(null);
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

                    <FormToolContextProvider>
                        <Stack ref={mainStackRef} spacing={3} height='calc(100% - 10px)' p='10px' pr={0} alignItems='center' sx={{ overflowY: 'auto', scrollbarWidth: 'none' }}>

                            {Env.DEBUG && <DebugIndicator />}

                            <ToggableToolButtonContainer
                                title='Label Tools'
                                icons={{ enabled: <LabelIcon fontSize='large' />, disabled: <LabelOutlinedIcon fontSize='large' /> }}
                                toolList={[
                                    ShowFieldLabel
                                ]}
                            />

                            <ToggableToolButtonContainer
                                title='God Mode'
                                icons={{ enabled: <TipsAndUpdatesIcon fontSize='large' />, disabled: <TipsAndUpdatesOutlinedIcon fontSize='large' /> }}
                                toolList={[
                                    VisibleMode
                                ]}
                            />

                        </Stack>
                    </FormToolContextProvider>

                    <Stack
                        width='100%'
                        alignItems='center'
                        sx={(theme) => ({
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



const formToolsV2 = new FormToolsButtonV2();
export default formToolsV2;