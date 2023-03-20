
import { createTheme, Theme, ThemeProvider, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../../utils/global/.processClass';
import HandymanIcon from '@mui/icons-material/Handyman';
import XrmObserver from '../../utils/global/XrmObserver';

import GodMode from './subProcesses/GodMode';
import { debugLog } from '../../utils/global/common';
import { useBoolean } from 'usehooks-ts';
import LabelTools from './subProcesses/LabelTools';

import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import { Tooltip } from '@material-ui/core';
import ObserveDOM from '../../utils/global/DOMObserver';
import OptionSetTool from './subProcesses/OptionSetTool';

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
    },
});



const toolsList = [GodMode, LabelTools, OptionSetTool];

type ExecutionContext = Xrm.Events.DataLoadEventContext | null;

type XrmStatus = {
    isRecord: boolean;
    entityName?: string;
    recordId?: string;
}

const FormToolsProcess = forwardRef<ProcessRef, ProcessProps>(
    function DevToolsProcess(props: ProcessProps, ref) {

        const [xrmStatus, setXrmStatus] = useState<XrmStatus>({
            isRecord: false,
        });

        const [executionContext, setExecutionContext] = useState<ExecutionContext>(null);
        const { value: executionContextUpdated, toggle: executionContextIsUpdated } = useBoolean(false);

        const [domUpdated, setDomUpdated] = useState<boolean>(false);

        useImperativeHandle(ref, () => ({
            onClose() {
                XrmObserver.removeListener(xrmObserverCallback);
                DOMobserver?.disconnect();
            }
        }));

        const xrmObserverCallback = useCallback(() => {
            setXrmStatus({
                isRecord: !!Xrm.Page.data,
                entityName: Xrm.Page.data?.entity.getEntityName(),
                recordId: Xrm.Page.data?.entity.getId(),
            })
        }, []);

        const DOMobserver = useMemo(() => {
            return ObserveDOM(document.querySelector('#shell-container'), () => {
                debugLog("DOM Updated");
                setDomUpdated(prev => !prev);
            });
        }, []);

        useEffect(() => {
            XrmObserver.addListener(xrmObserverCallback);
        }, [])

        useEffect(() => {
            debugLog("setExecutionContext", Xrm.Utility.getPageContext()?.input?.pageType == 'entityrecord');

            if (Xrm.Utility.getPageContext()?.input?.pageType == 'entityrecord') {
                Xrm.Page.data.addOnLoad((executionContext) => {
                    setExecutionContext(executionContext);
                    executionContextIsUpdated();
                });
                Xrm.Page.data.refresh(false);
            }
            else {
                setExecutionContext(null);
            }
        }, [(Xrm.Utility.getPageContext() as any)._pageId])


        return (<ThemeProvider theme={theme}>
            <Stack spacing={4} width='calc(100% - 10px)' padding='10px' alignItems='center'>
                <Tooltip title={executionContext ? 'Context found' : 'Context Unfound. Try to refresh'}>
                    <Stack alignItems='center' paddingRight='25%'>
                        {executionContext ? <WifiIcon color='success' /> : <WifiOffIcon color='error' />}
                        <Typography
                            fontSize='0.6em'
                            variant='caption'
                        >
                            {executionContext ? 'Connected' : 'Off'}
                        </Typography>
                    </Stack>
                </Tooltip>
                {
                    toolsList?.map((SubProcess, index) => {
                        return (
                            <SubProcess
                                executionContext={executionContext}
                                executionContextUpdated={executionContextUpdated}
                                domUpdated={domUpdated}
                            />
                        );
                    })
                }
            </Stack>
        </ThemeProvider>);
    }
);


export type SubProcessProps = {
    // xrmStatus: XrmStatus
    executionContext: ExecutionContext,
    executionContextUpdated: boolean
}



const formTools = new FormToolsButton();
export default formTools;