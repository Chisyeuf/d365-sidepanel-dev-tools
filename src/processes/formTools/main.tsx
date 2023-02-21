
import { createTheme, ThemeProvider } from '@mui/material';
import { Stack } from '@mui/system';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../../utils/global/.processClass';
import HandymanIcon from '@mui/icons-material/Handyman';
import XrmObserver from '../../utils/global/XrmObserver';

import GodMode from './subProcesses/GodMode';
import { debugLog } from '../../utils/global/common';

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



const toolsList = [GodMode];

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

        useImperativeHandle(ref, () => ({
            onClose() {
                XrmObserver.removeListener(xrmObserverCallback)
            }
        }));
        const xrmObserverCallback = useCallback(() => {
            setXrmStatus({
                isRecord: !!Xrm.Page.data,
                entityName: Xrm.Page.data?.entity.getEntityName(),
                recordId: Xrm.Page.data?.entity.getId(),
            })
        }, []);

        useEffect(() => {
            XrmObserver.addListener(xrmObserverCallback);
        }, [])

        useEffect(() => {
            debugLog("setExecutionContext", !!Xrm.Page.data);
            if (Xrm.Page.data) {
                Xrm.Page.data.addOnLoad((executionContext) => {
                    setExecutionContext(executionContext);
                });
                Xrm.Page.data.refresh(false);
            }
            else {
                setExecutionContext(null);
            }
        }, [Xrm.Page.data?.addOnLoad])


        return (<ThemeProvider theme={theme}>
            <Stack spacing={1} width='calc(100% - 10px)' padding='10px'>
                {
                    toolsList?.map((SubProcess, index) => {
                        return <SubProcess executionContext={executionContext} />;
                    })
                }
            </Stack>
        </ThemeProvider>);
    }
);


export type SubProcessProps = {
    // xrmStatus: XrmStatus
    executionContext: ExecutionContext
}



var formTools = new FormToolsButton();
export default formTools;