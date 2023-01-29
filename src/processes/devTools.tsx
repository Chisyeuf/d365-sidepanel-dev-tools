
import { Button, createTheme, ThemeProvider, Tooltip } from '@mui/material';
import { Stack } from '@mui/system';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../utils/global/.processClass';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import HandymanIcon from '@mui/icons-material/Handyman';
import XrmObserver from '../utils/global/XrmObserver';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';

class DevToolsButton extends ProcessButton {
    constructor() {
        super(
            'devtools',
            'Dev Tools',
            <HandymanIcon />,
            56
        );
        this.process = DevToolsProcess;
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



const toolsList = [EnableMode, VisibleMode];

type XrmStatus = {
    isRecord: boolean;
    entityName?: string;
    recordId?: string;
}

const DevToolsProcess = forwardRef<ProcessRef, ProcessProps>(
    function DevToolsProcess(props: ProcessProps, ref) {

        const [xrmStatus, setXrmStatus] = useState<XrmStatus>({
            isRecord: false,
        });

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


        return (<ThemeProvider theme={theme}>
            <Stack spacing={2} width="100%" padding={"5px"}>
                {
                    toolsList?.map((SubProcess, index) => {
                        return <SubProcess xrmStatus={xrmStatus} />;
                    })
                }
            </Stack>
        </ThemeProvider>);
    }
);


type FormControlState<T> = {
    name: string
    defaultState: T
}
type SubProcessProps = {
    xrmStatus: XrmStatus
}
function EnableMode(props: SubProcessProps) {

    const [enableModeEnable, setEnableMode] = useState(false);
    const [enableControls, setEnableControls] = useState<FormControlState<boolean>[]>([]);

    const onClick = () => {
        setEnableMode((prev) => !prev);
    }

    useEffect(() => {
        console.log(props.xrmStatus);
        if (props.xrmStatus.isRecord) {
            getAllControl();
        }
    }, [props.xrmStatus]);

    const getAllControl = () => {
        const controls: Xrm.Controls.Control[] = Xrm.Page.ui.controls.get();
        const tabs: Xrm.Controls.Tab[] = Xrm.Page.ui.tabs.get();
        const sections: Xrm.Controls.Section[] = tabs.flatMap(t => t.sections.get());

        const allcontrols: FormControlState<boolean>[] = controls.map<FormControlState<boolean>>(c => {
            return {
                name: c.getName(),
                defaultState: ((c as any).getDisabled && (c as any).getDisabled()) ?? false,
                // setFunction: (c as any).setDisabled ?? (() => { }),
            }
        });

        setEnableControls(allcontrols);
    }

    const toggle = () => {
        enableControls.forEach(c => {
            const controlTemp:any = Xrm.Page.getControl(c.name) as any;
            controlTemp.setDisabled && controlTemp.setDisabled(enableModeEnable || c.defaultState);
        })
    }

    useEffect(() => {
        toggle();
    }, [enableModeEnable, enableControls])

    return (
        <Tooltip title='Enable Mode'>
            <Button
                variant="contained"
                onClick={onClick}
                startIcon={enableModeEnable ? <LockOpenIcon /> : <LockIcon />}
            />
        </Tooltip>
    );
}

function VisibleMode(props: SubProcessProps) {

    const [visibleModeEnable, setVisibleMode] = useState(false);
    const [visibilityControls, setVisibilityControls] = useState<FormControlState<boolean>[]>([]);
    const [tabControls, setTabControls] = useState<FormControlState<boolean>[]>([])
    const [sectionControls, setSectionControls] = useState<FormControlState<boolean>[]>([])

    const onClick = () => {
        setVisibleMode((prev) => !prev);
    }

    useEffect(() => {
        console.log(props.xrmStatus);
        if (props.xrmStatus.isRecord) {
            getAllControl();
        }
    }, [props.xrmStatus]);

    useEffect(() => {
    }, [visibleModeEnable]);


    const getAllControl = () => {
        const controls: Xrm.Controls.Control[] = Xrm.Page.ui.controls.get();
        const tabs: Xrm.Controls.Tab[] = Xrm.Page.ui.tabs.get();
        const sections: Xrm.Controls.Section[] = tabs.flatMap(t => t.sections.get());
        // const allcontrols: FormControlState<boolean>[] = [...controls, ...tabs, ...sections].map<FormControlState<boolean>>(c => {
        //     return {
        //         name: c.getName(),
        //         defaultState: ((c as any).getVisible && (c as any).getVisible()) ?? true,
        //         // setFunction: (c as any).setVisible ?? (() => { }),
        //     }
        // });

        setVisibilityControls(controls.map<FormControlState<boolean>>(c => {
            return {
                name: c.getName(),
                defaultState: ((c as any).getVisible && (c as any).getVisible()) ?? true,
                // setFunction: (c as any).setVisible ?? (() => { }),
            }
        }));
        setTabControls(tabs.map<FormControlState<boolean>>(c => {
            return {
                name: c.getName(),
                defaultState: ((c as any).getVisible && (c as any).getVisible()) ?? true,
                // setFunction: (c as any).setVisible ?? (() => { }),
            }
        }));
        setSectionControls(sections.map<FormControlState<boolean>>(c => {
            return {
                name: c.getName(),
                defaultState: ((c as any).getVisible && (c as any).getVisible()) ?? true,
                // setFunction: (c as any).setVisible ?? (() => { }),
            }
        }))
    }

    const toggle = () => {
        visibilityControls.forEach(c => {
            const controlTemp:any = Xrm.Page.getControl(c.name) as any;
            controlTemp.setDisabled && controlTemp.setDisabled(visibleModeEnable || c.defaultState);
        });
        tabControls.forEach(t => {
            const tabControlTemp = Xrm.Page.ui.tabs.get(t.name);
            tabControlTemp.setVisible(visibleModeEnable || t.defaultState);
            sectionControls.forEach(s => {
                const sectionControlTemp = tabControlTemp.sections.get(s.name);
                if (sectionControlTemp) {
                    sectionControlTemp.setVisible(visibleModeEnable || s.defaultState)
                }
            })
        });
    }

    useEffect(() => {
        toggle();
    }, [visibleModeEnable, visibilityControls])


    return (
        <Tooltip title='Visible Mode'>
            <Button
                variant="contained"
                onClick={onClick}
                startIcon={visibleModeEnable ? <VisibilityOffIcon /> : <VisibilityIcon />}
            />
        </Tooltip>
    );
}

var devTools = new DevToolsButton();
export default devTools;