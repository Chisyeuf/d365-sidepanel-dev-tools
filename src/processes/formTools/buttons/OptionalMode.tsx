
import { Tooltip, Button } from "@mui/material";
import React, { useEffect, useMemo } from "react";
import { FormControlState, GodModeSubProcess } from "../containers/GodMode";
import { SubProcessProps } from "../main";

import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudIcon from '@mui/icons-material/Cloud';

type OptionalModeStateType = FormControlState<Xrm.Attributes.RequirementLevel>;
export function OptionalMode(props: SubProcessProps & GodModeSubProcess) {

    const { currentFormContext, enabled: optionalModeEnable, setEnabled: setOptionalMode } = props;

    const toggleMode = () => {
        setOptionalMode(!optionalModeEnable);
    }

    useEffect(() => {
        toggle();
    }, [currentFormContext]);

    const fieldsControls = useMemo(async () => {
        if (currentFormContext) {
            const controls: Xrm.Controls.Control[] = currentFormContext.getControl();

            const allcontrols: OptionalModeStateType[] = controls?.map<OptionalModeStateType>(c => {
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

    }, [currentFormContext]);

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
            />
        </Tooltip>
    );
}