
import { Button, createTheme, IconButton, ThemeProvider, Tooltip, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import HandymanIcon from '@mui/icons-material/Handyman';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudIcon from '@mui/icons-material/Cloud';
import VpnKeyOffOutlinedIcon from '@mui/icons-material/VpnKeyOffOutlined';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import AutoFixOffIcon from '@mui/icons-material/AutoFixOff';
import { SubProcessProps } from '../main';
import ComponentContainer from '../../../utils/components/ComponentContainer';

import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import { debugLog } from '../../../utils/global/common';

type GodModeSubProcess = {
    enabled: boolean,
    setEnabled: React.Dispatch<React.SetStateAction<boolean>>
}
function GodMode(props: SubProcessProps) {

    const [allModeEnabled, setAllModeEnabled] = useState<boolean>(false);

    const [enableModeEnable, setEnableMode] = useState<boolean>(false);
    const [optionalModeEnable, setOptionalMode] = useState<boolean>(false);
    const [visibleModeEnable, setVisibleMode] = useState<boolean>(false);

    useEffect(() => {
        if (!allModeEnabled && enableModeEnable && optionalModeEnable && visibleModeEnable) {
            setAllModeEnabled(true);
            return;
        }
        if (allModeEnabled && (!enableModeEnable || !optionalModeEnable || !visibleModeEnable)) {
            setAllModeEnabled(false);
            return;
        }
    }, [enableModeEnable, optionalModeEnable, visibleModeEnable]);

    const toggleAll = useCallback(() => {
        const newAllMode = !allModeEnabled;
        setEnableMode(newAllMode);
        setOptionalMode(newAllMode);
        setVisibleMode(newAllMode);
    }, [allModeEnabled]);


    return (
        <ComponentContainer
            width='100%'
            Legends={
                {
                    top: {
                        component: (
                            <Tooltip title='Toggle all' placement='left'>
                                <IconButton color='primary' onClick={toggleAll} size='small'>
                                    {allModeEnabled ? <TipsAndUpdatesIcon fontSize="large" /> : <TipsAndUpdatesOutlinedIcon fontSize="large" />}
                                </IconButton>
                            </Tooltip>
                        ),
                        margin: '15px',
                        padding: '15px'
                    },
                    left: {
                        component: <div style={{ writingMode: 'vertical-rl' }}>GodMode</div>
                    }
                }
            }
        >
            <Stack spacing={1} width='calc(100% - 10px)' padding='5px'>
                <OptionalMode
                    executionContext={props.executionContext}
                    executionContextUpdated={props.executionContextUpdated}
                    enabled={optionalModeEnable}
                    setEnabled={setOptionalMode} />
                <EnableMode
                    executionContext={props.executionContext}
                    executionContextUpdated={props.executionContextUpdated}
                    enabled={enableModeEnable}
                    setEnabled={setEnableMode} />
                <VisibleMode
                    executionContext={props.executionContext}
                    executionContextUpdated={props.executionContextUpdated}
                    enabled={visibleModeEnable}
                    setEnabled={setVisibleMode} />
            </Stack>
        </ComponentContainer>
    );
}

type FormControlState<T> = {
    name: string
    defaultState: T
}
type EnableModeStateType = FormControlState<boolean>;
export function EnableMode(props: SubProcessProps & GodModeSubProcess) {

    const { executionContext, executionContextUpdated, enabled: enableModeEnable, setEnabled: setEnableMode } = props;

    // const [enableModeEnable, setEnableMode] = useState(false);

    useEffect(() => {
        toggle();
    }, [executionContextUpdated]);

    const enableableControls = useMemo(async () => {
        if (executionContext) {
            const formContext = executionContext.getFormContext();
            const controls: Xrm.Controls.StandardControl[] = formContext.getControl() as Xrm.Controls.StandardControl[];

            const allcontrols: EnableModeStateType[] = controls.map<EnableModeStateType>(c => {
                return {
                    name: c.getName(),
                    defaultState: (c.getDisabled && c.getDisabled()) ?? false,
                }
            });
            return allcontrols;
        }
        else {
            return null;
        }

    }, [executionContextUpdated]);


    const toggleEnableMode = () => {
        setEnableMode((prev) => !prev);
    }

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
                variant='contained'
                onClick={toggleEnableMode}
                startIcon={enableModeEnable ? <VpnKeyIcon /> : <VpnKeyOffOutlinedIcon />}
            // disabled={!executionContext}
            />
        </Tooltip>
    );
}

type OptionalModeStateType = FormControlState<Xrm.Attributes.RequirementLevel>;
export function OptionalMode(props: SubProcessProps & GodModeSubProcess) {

    const { executionContext, executionContextUpdated, enabled: optionalModeEnable, setEnabled: setOptionalMode } = props;

    // const [optionalModeEnable, setOptionalMode] = useState(false);

    const toggleMode = () => {
        setOptionalMode((prev) => !prev);
    }

    useEffect(() => {
        toggle();
    }, [executionContextUpdated]);

    const fieldsControls = useMemo(async () => {
        if (executionContext) {
            const formContext = executionContext.getFormContext();
            const controls: Xrm.Controls.Control[] = formContext.getControl();

            const allcontrols: OptionalModeStateType[] = controls.map<OptionalModeStateType>(c => {
                return {
                    name: c.getName(),
                    defaultState: Xrm.Page.getAttribute(c.getName())?.getRequiredLevel(),
                }
            });
            return allcontrols;
        }
        else {
            return null;
        }

    }, [executionContextUpdated]);

    const toggle = async () => {
        fieldsControls.then((controls: OptionalModeStateType[] | null) => {
            controls?.forEach(c => {
                const attr = Xrm.Page.getAttribute(c.name);
                c.defaultState && attr?.setRequiredLevel(optionalModeEnable ? 'none' : c.defaultState);
                const contr = Xrm.Page.getControl<Xrm.Controls.StandardControl>(c.name);
                optionalModeEnable && contr?.clearNotification?.();
            })
        });
    }


    useEffect(() => {
        toggle();
    }, [optionalModeEnable, fieldsControls]);

    return (
        <Tooltip title='Optional Mode' placement='left'>
            <Button
                variant='contained'
                onClick={toggleMode}
                startIcon={optionalModeEnable ? <CloudIcon /> : <CloudOffIcon />}
            // disabled={!executionContext}
            />
        </Tooltip>
    );
}

type VisibleModeStateType = FormControlState<boolean>;
export function VisibleMode(props: SubProcessProps & GodModeSubProcess) {

    const { executionContext, executionContextUpdated, enabled: visibleModeEnable, setEnabled: setVisibleMode } = props;

    // const [visibleModeEnable, setVisibleMode] = useState(false);

    const onClick = () => {
        setVisibleMode((prev) => !prev);
    }

    useEffect(() => {
        toggle();
    }, [executionContextUpdated]);


    const visibilityControlsFields = useMemo(async () => {
        if (executionContext) {
            const formContext = executionContext.getFormContext();
            const controls: Xrm.Controls.Control[] = formContext.getControl();

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

    }, [executionContextUpdated]);

    const visibilityControlsTabs = useMemo(async () => {
        if (executionContext) {
            const formContext = executionContext.getFormContext();
            const tabs: Xrm.Controls.Tab[] = formContext.ui.tabs.get();

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

    }, [executionContextUpdated]);

    const visibilityControlsSection = useMemo(async () => {
        if (executionContext) {
            const formContext = executionContext.getFormContext();
            const tabs: Xrm.Controls.Tab[] = formContext.ui.tabs.get();
            const sections: Xrm.Controls.Section[] = tabs.flatMap(t => t.sections.get());

            const allcontrols: VisibleModeStateType[] = sections.map<VisibleModeStateType>(s => {
                return {
                    name: s.getName(),
                    defaultState: s.getVisible() ?? true,
                }
            });
            return allcontrols;
        }
        else {
            return null;
        }

    }, [executionContextUpdated]);

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
                variant='contained'
                onClick={onClick}
                startIcon={visibleModeEnable ? <VisibilityIcon /> : <VisibilityOffOutlinedIcon />}
            // disabled={!executionContext}
            />
        </Tooltip>
    );
}


export default GodMode;