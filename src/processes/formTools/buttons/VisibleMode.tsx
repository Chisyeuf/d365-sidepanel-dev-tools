import { Tooltip, Button } from "@mui/material";
import React, { useEffect, useMemo } from "react";
import { FormControlState, GodModeSubProcess } from "../containers/GodMode";
import { SubProcessProps } from "../main";

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

type VisibleModeStateType = FormControlState<boolean>;
function VisibleMode(props: SubProcessProps & GodModeSubProcess) {

    const { currentFormContext, enabled: visibleModeEnable, setEnabled: setVisibleMode } = props;


    const onClick = () => {
        setVisibleMode(!visibleModeEnable);
    }

    useEffect(() => {
        toggle();
    }, [currentFormContext]);


    const visibilityControlsFields = useMemo(async () => {
        if (!currentFormContext) {
            return null;
        }
        const controls: Xrm.Controls.Control[] = currentFormContext.getControl();

        const allcontrols: VisibleModeStateType[] = controls?.map<VisibleModeStateType>(c => {
            return {
                name: c.getName(),
                defaultState: c.getVisible() ?? true,
            }
        });
        return allcontrols;

    }, [currentFormContext]);

    const visibilityControlsTabs = useMemo(async () => {
        if (!currentFormContext) {
            return null;
        }
        const tabs: Xrm.Controls.Tab[] = currentFormContext.ui.tabs?.get();

        const allcontrols: VisibleModeStateType[] = tabs?.map<VisibleModeStateType>(t => {
            return {
                name: t.getName(),
                defaultState: t.getVisible() ?? true,
            }
        });
        return allcontrols;

    }, [currentFormContext]);

    const visibilityControlsSection = useMemo(async () => {
        if (!currentFormContext) {
            return null;
        }
        const tabs: Xrm.Controls.Tab[] = currentFormContext.ui.tabs?.get();
        const sections: Xrm.Controls.Section[] = tabs?.flatMap(t => t.sections?.get());

        const allcontrols: VisibleModeStateType[] = sections?.map<VisibleModeStateType>(s => {
            return {
                name: s.getName(),
                defaultState: s.getVisible() ?? true,
            }
        });
        return allcontrols;


    }, [currentFormContext]);

    const toggle = async () => {
        visibilityControlsFields.then((controls) => {
            controls?.forEach(c => {
                const controlTemp: any = Xrm.Page.getControl(c.name) as any;
                controlTemp.setVisible?.(visibleModeEnable || c.defaultState);
            });
        })
        visibilityControlsTabs.then((tabs) => {
            tabs?.forEach(t => {
                const tabControlTemp = Xrm.Page.ui.tabs?.get(t.name);
                tabControlTemp.setVisible(visibleModeEnable || t.defaultState);
                visibilityControlsSection.then((sections) => {
                    sections?.forEach(s => {
                        const sectionControlTemp = tabControlTemp.sections?.get(s.name);
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
            />
        </Tooltip>
    );
}

export default VisibleMode;