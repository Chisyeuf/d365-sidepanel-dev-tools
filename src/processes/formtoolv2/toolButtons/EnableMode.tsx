
import { useContext, useEffect, useMemo } from "react";
import { FormControlState, IToolButtonControlled, ToolButton } from "../ToolButton";

import VpnKeyOffOutlinedIcon from '@mui/icons-material/VpnKeyOffOutlined';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { FormToolContext } from "../context";


type EnableModeStateType = FormControlState<boolean>;
export function EnableMode(props: IToolButtonControlled) {

    const { enabled: enableModeEnable, setEnabled: setEnableMode } = props;

    const { formContext } = useContext(FormToolContext);


    const enableableControls = useMemo(async () => {
        if (!formContext) {
            return null;
        }
        const controls: Xrm.Controls.StandardControl[] = formContext.getControl() as Xrm.Controls.StandardControl[];

        const allcontrols: EnableModeStateType[] = controls?.map<EnableModeStateType>(c => {
            return {
                name: c.getName(),
                defaultState: (c.getDisabled && c.getDisabled()) ?? false,
            }
        });
        return allcontrols;

    }, [formContext]);
    

    useEffect(() => {
        if (!formContext) {
            return;
        }

        const toggle = async () => {
            enableableControls.then((controls: EnableModeStateType[] | null) => {
                controls?.forEach(c => {
                    const controlTemp: any = formContext.getControl(c.name) as any;
                    controlTemp.setDisabled?.(enableModeEnable ? false : c.defaultState);
                })
            });
        }

        toggle();
    }, [enableModeEnable, enableableControls, formContext]);


    return (
        <ToolButton
            controlled={true}
            icon={enableModeEnable ? <VpnKeyIcon /> : <VpnKeyOffOutlinedIcon />}
            tooltip='Enable Mode'
            setEnabled={setEnableMode}
        />
    );
}