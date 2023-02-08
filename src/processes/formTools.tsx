
import { Button, createTheme, IconButton, ThemeProvider, Tooltip, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../utils/global/.processClass';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import HandymanIcon from '@mui/icons-material/Handyman';
import XrmObserver from '../utils/global/XrmObserver';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import ComponentContainer from '../utils/components/ComponentContainer';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudIcon from '@mui/icons-material/Cloud';
import VpnKeyOffOutlinedIcon from '@mui/icons-material/VpnKeyOffOutlined';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

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
            if (Xrm.Page.data) {
                Xrm.Page.data.addOnLoad((executionContext) => {
                    setExecutionContext(executionContext);
                });
            }
            else {
                setExecutionContext(null);
            }
        }, [xrmStatus])


        return (<ThemeProvider theme={theme}>
            <Stack spacing={1} width="calc(100% - 10px)" padding={"5px"}>
                {
                    toolsList?.map((SubProcess, index) => {
                        return <SubProcess executionContext={executionContext} />;
                    })
                }
            </Stack>
        </ThemeProvider>);
    }
);


function GodMode(props: SubProcessProps) {
    return (
        <ComponentContainer
            width='100%'
            Legends={
                {
                    top: {
                        component: (
                            <IconButton>
                                <AutoFixHighIcon />
                            </IconButton>
                        ),
                        margin: '30px',
                        padding: '15px'
                    },
                    left: {
                        component: <div style={{ writingMode: 'vertical-rl' }}>GodMode</div>
                    }
                }
            }
        >
            <Stack spacing={1} width="calc(100% - 10px)" padding={"5px"}>
                <EnableMode executionContext={props.executionContext} />
                <VisibleMode executionContext={props.executionContext} />
                <EditableMode executionContext={props.executionContext} />
            </Stack>
        </ComponentContainer>
    );
}

type FormControlState<T> = {
    name: string
    defaultState: T
}
type SubProcessProps = {
    // xrmStatus: XrmStatus
    executionContext: ExecutionContext
}
type EnableModeStateType = FormControlState<boolean>;
function EnableMode(props: SubProcessProps) {

    const { executionContext } = props;

    const [enableModeEnable, setEnableMode] = useState(false);

    const toggleEnableMode = () => {
        setEnableMode((prev) => !prev);
    }

    useEffect(() => {
        toggle();
    }, [executionContext]);

    const enableableControls = useMemo(async () => {
        if (executionContext) {

            const controls: Xrm.Controls.Control[] = Xrm.Page.ui.controls.get();

            const allcontrols: EnableModeStateType[] = controls.map<EnableModeStateType>(c => {
                return {
                    name: c.getName(),
                    defaultState: ((c as any).getDisabled && (c as any).getDisabled()) ?? false,
                }
            });
            return allcontrols;
        }
        else {
            return null;
        }

    }, [executionContext]);

    const toggle = async () => {
        enableableControls.then((controls: EnableModeStateType[] | null) => {
            controls?.forEach(c => {
                const controlTemp: any = Xrm.Page.getControl(c.name) as any;
                controlTemp.setDisabled && controlTemp.setDisabled(enableModeEnable ? false : c.defaultState);
            })
        });
    }

    useEffect(() => {
        toggle();
    }, [enableModeEnable, enableableControls]);

    return (
        <Tooltip title='Enable Mode' placement='left'>
            <Button
                variant="contained"
                onClick={toggleEnableMode}
                startIcon={enableModeEnable ? <VpnKeyIcon /> : <VpnKeyOffOutlinedIcon />}
            />
        </Tooltip>
    );
}

type OptionalModeStateType = FormControlState<Xrm.Attributes.RequirementLevel>;
function EditableMode(props: SubProcessProps) {

    const { executionContext } = props;

    const [optionalModeEnable, setOptionalMode] = useState(false);

    const toggleMode = () => {
        setOptionalMode((prev) => !prev);
    }

    useEffect(() => {
        toggle();
    }, [executionContext]);

    const fieldsControls = useMemo(async () => {
        if (executionContext) {

            const controls: Xrm.Attributes.Attribute<any>[] = Xrm.Page.getAttribute();

            const allcontrols: OptionalModeStateType[] = controls.map<OptionalModeStateType>(c => {
                return {
                    name: c.getName(),
                    defaultState: c.getRequiredLevel(),
                }
            });
            return allcontrols;
        }
        else {
            return null;
        }

    }, [executionContext]);

    const toggle = async () => {
        fieldsControls.then((controls: OptionalModeStateType[] | null) => {
            controls?.forEach(c => {
                const controlTemp = Xrm.Page.getAttribute(c.name);
                controlTemp.setRequiredLevel(optionalModeEnable ? 'none' : c.defaultState);
            })
        });
    }

    useEffect(() => {
        toggle();
    }, [optionalModeEnable, fieldsControls]);

    return (
        <Tooltip title='Optional Mode' placement='left'>
            <Button
                variant="contained"
                onClick={toggleMode}
                startIcon={optionalModeEnable ? <CloudIcon /> : <CloudOffIcon />}
            />
        </Tooltip>
    );
}

type VisibleModeStateType = FormControlState<boolean>;
function VisibleMode(props: SubProcessProps) {

    const { executionContext } = props;

    const [visibleModeEnable, setVisibleMode] = useState(false);

    const onClick = () => {
        setVisibleMode((prev) => !prev);
    }

    useEffect(() => {
        toggle();
    }, [executionContext]);


    const visibilityControlsFields = useMemo(async () => {
        if (executionContext) {

            const controls: Xrm.Controls.Control[] = Xrm.Page.ui.controls.get();

            const allcontrols: VisibleModeStateType[] = controls.map<VisibleModeStateType>(c => {
                return {
                    name: c.getName(),
                    defaultState: c.getVisible() ?? true,
                }
            });
            return allcontrols;
        }
        else {
            return null;
        }

    }, [executionContext]);

    const visibilityControlsTabs = useMemo(async () => {
        if (executionContext) {

            const tabs: Xrm.Controls.Tab[] = Xrm.Page.ui.tabs.get();

            const allcontrols: VisibleModeStateType[] = tabs.map<VisibleModeStateType>(t => {
                return {
                    name: t.getName(),
                    defaultState: t.getVisible() ?? true,
                }
            });
            return allcontrols;
        }
        else {
            return null;
        }

    }, [executionContext]);

    const visibilityControlsSection = useMemo(async () => {
        if (executionContext) {

            const tabs: Xrm.Controls.Tab[] = Xrm.Page.ui.tabs.get();
            const sections: Xrm.Controls.Section[] = tabs.flatMap(t => t.sections.get());

            const allcontrols: VisibleModeStateType[] = sections.map<VisibleModeStateType>(s => {
                return {
                    name: s.getName(),
                    defaultState: s.getVisible() ?? true,
                }
            });
            // console.log("controls list:", allcontrols.map(c => c.name));
            return allcontrols;
        }
        else {
            // console.log("controls list: null");
            return null;
        }

    }, [executionContext]);

    const toggle = async () => {
        visibilityControlsFields.then((controls) => {
            controls?.forEach(c => {
                const controlTemp: any = Xrm.Page.getControl(c.name) as any;
                controlTemp.setVisible(visibleModeEnable || c.defaultState);
            });
        })
        visibilityControlsTabs.then((tabs) => {
            tabs?.forEach(t => {
                const tabControlTemp = Xrm.Page.ui.tabs.get(t.name);
                tabControlTemp.setVisible(visibleModeEnable || t.defaultState);
                visibilityControlsSection.then((sections) => {
                    sections?.forEach(s => {
                        const sectionControlTemp = tabControlTemp.sections.get(s.name);
                        if (sectionControlTemp) {
                            sectionControlTemp.setVisible(visibleModeEnable || s.defaultState)
                        }
                    })
                })
            });
        })
    }

    useEffect(() => {
        toggle();
    }, [visibleModeEnable, visibilityControlsFields, visibilityControlsTabs, visibilityControlsSection])


    return (
        <Tooltip title='Visible Mode' placement='left'>
            <Button
                variant="contained"
                onClick={onClick}
                startIcon={visibleModeEnable ? <VisibilityIcon /> : <VisibilityOffOutlinedIcon />}
            />
        </Tooltip>
    );
}

var formTools = new FormToolsButton();
export default formTools;