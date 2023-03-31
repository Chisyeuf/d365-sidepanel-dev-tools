
import { Tooltip, Button } from "@mui/material";
import React, { useEffect, useMemo } from "react";
import { FormControlState, GodModeSubProcess } from "../containers/GodMode";
import { SubProcessProps } from "../main";

import VpnKeyOffOutlinedIcon from '@mui/icons-material/VpnKeyOffOutlined';
import VpnKeyIcon from '@mui/icons-material/VpnKey';


type EnableModeStateType = FormControlState<boolean>;
export function EnableMode(props: SubProcessProps & GodModeSubProcess) {

    const { currentFormContext, enabled: enableModeEnable, setEnabled: setEnableMode } = props;

    // const [enableModeEnable, setEnableMode] = useState(false);

    useEffect(() => {
        toggle();
    }, [currentFormContext]);

    const enableableControls = useMemo(async () => {
        if (currentFormContext) {
            const controls: Xrm.Controls.StandardControl[] = currentFormContext.getControl() as Xrm.Controls.StandardControl[];

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

    }, [currentFormContext]);


    const toggleEnableMode = () => {
        setEnableMode(!enableModeEnable);
    }

    const toggle = async () => {
        enableableControls.then((controls: EnableModeStateType[] | null) => {
            controls?.forEach(c => {
                const controlTemp: any = Xrm.Page.getControl(c.name) as any;
                controlTemp.setDisabled?.(enableModeEnable ? false : c.defaultState);
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