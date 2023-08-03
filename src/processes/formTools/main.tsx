
import { createTheme, ThemeProvider, Tooltip, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState, } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../../utils/global/.processClass';
import HandymanIcon from '@mui/icons-material/Handyman';

import GodMode from './containers/GodMode';
import { debugLog } from '../../utils/global/common';
import LabelTools from './containers/LabelTools';

import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import DOMObserver from '../../utils/global/DOMObserver';
import { Env } from '../../utils/global/var';
import ComponentContainer from '../../utils/components/ComponentContainer';
import FillFields from './buttons/FillFields';
import ShowOptionSetInFields from './buttons/ShowOptionSetInFields';
import OtherTools from './containers/OtherTools';

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

    reStyleSidePane(): void {
        var sidePane = document.querySelector<HTMLElement>('#' + this.id);
        if (sidePane) {
            sidePane.style.width = this.width + "px";
            var dev = sidePane.querySelector<HTMLElement>("div:first-child");
            if (dev) {
                dev.style.minWidth = "100%";
                var header = dev.querySelector<HTMLElement>("div:first-child");
                if (header) {
                    header.style.flexDirection = "column-reverse";
                    header.style.paddingLeft = "5px";
                    header.style.paddingRight = "5px";
                    header.style.alignItems = "flex-end";
                    header.style.justifyContent = "flex-end";

                    var h2 = header.querySelector<HTMLElement>("h2");
                    if (h2) {
                        h2.style.width = "100%";
                        h2.style.alignSelf = "unset";
                        h2.style.maxHeight = "none";
                        h2.style.writingMode = "vertical-rl";
                    }

                    var button = header.querySelector<HTMLElement>("button");
                    if (button) {
                        button.style.alignSelf = "unset";
                        button.style.marginRight = "8px";
                    }
                }
            }
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

const toolsList: ((props: SubProcessProps) => JSX.Element)[] = [LabelTools, GodMode, OtherTools /** Blur fields, Dirty fields */];

type FormContext = Xrm.Page | null;

type XrmStatus = {
    isRecord: boolean;
    pageType?: string;
    entityName?: string;
    recordId?: string;
}

const FormToolsProcess = forwardRef<ProcessRef, ProcessProps>(
    function FormToolsProcess(props: ProcessProps, ref) {

        const [xrmStatus, setXrmStatus] = useState<XrmStatus>({
            isRecord: false,
        });

        const [currentFormContext, setCurrentFormContext] = useState<FormContext>(null);

        const [domUpdated, setDomUpdated] = useState<boolean>(false);

        useImperativeHandle(ref, () => {
            return ({
                onClose() {
                    domObserver?.removeListener(xrmObserverCallback);
                }
            });
        }, []);

        const xrmObserverCallback = useCallback(() => {
            setDomUpdated(prev => !prev);
        }, []);

        useEffect(() => {
            if (!domObserver) {
                domObserver = new DOMObserver('formtools-domupdated', document.querySelector('#shell-container'), { childList: true, subtree: true });
            }
            domObserver.addListener(xrmObserverCallback);
        }, []);

        useEffect(() => {
            setXrmStatus({
                isRecord: Xrm.Utility.getPageContext()?.input?.pageType === 'entityrecord' || !!Xrm.Page.data?.entity?.getEntityName(),
                pageType: Xrm.Utility.getPageContext()?.input?.pageType,
                entityName: Xrm.Page.data?.entity?.getEntityName(),
                recordId: Xrm.Page.data?.entity?.getId(),
            });

            setTimeout(() => {
                
                if (Xrm.Utility.getPageContext()?.input?.pageType === 'entityrecord' || !!Xrm.Page.data?.entity?.getEntityName()) {
                    setCurrentFormContext(Xrm.Page);
                    // Xrm.Page.data.addOnLoad(() => {
                    //     setCurrentFormContext(Xrm.Page);
                    // });
                }
                else {
                    setCurrentFormContext(null);
                }
            }, 1000);

        }, [(Xrm.Utility.getPageContext() as any)._pageId]);

        return (
            <ThemeProvider theme={theme}>
                <Stack spacing={4} width='calc(100% - 10px)' padding='10px' alignItems='center'>
                    {
                        Env.DEBUG &&
                        <Tooltip title={currentFormContext ? 'Context found' : 'Context unfound. Try to refresh'} >
                            <Stack alignItems='center' paddingRight='25%'>
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
            </ThemeProvider>
        );
    }
);


export type SubProcessProps = {
    // xrmStatus: XrmStatus
    currentFormContext: FormContext,
    domUpdated?: boolean
}



const formTools = new FormToolsButton();
export default formTools;