
import { useContext, useEffect, useMemo } from "react";
import { FormControlState, IToolButtonControlled, ToolButton } from "../ToolButton";

import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudIcon from '@mui/icons-material/Cloud';
import { FormToolContext } from "../context";

type OptionalModeStateType = FormControlState<Xrm.Attributes.RequirementLevel>;
export function OptionalMode(props: IToolButtonControlled) {

    const { enabled: optionalModeEnable, setEnabled: setOptionalMode } = props;

    const { formContext } = useContext(FormToolContext);


    const fieldsControls = useMemo(async () => {
        if (!formContext) {
            return null;
        }
        const controls: Xrm.Controls.Control[] = formContext.getControl();

        const allcontrols: OptionalModeStateType[] = controls?.map<OptionalModeStateType>(c => {
            return {
                name: c.getName(),
                defaultState: formContext.getAttribute(c.getName())?.getRequiredLevel() ?? 'none',
            }
        });
        return allcontrols;

    }, [formContext]);


    useEffect(() => {
        if (!formContext) {
            return;
        }

        const toggle = async () => {
            fieldsControls.then((controls: OptionalModeStateType[] | null) => {
                controls?.forEach(c => {
                    const attribute = formContext.getAttribute(c.name);
                    c.defaultState && attribute?.setRequiredLevel(optionalModeEnable ? 'none' : c.defaultState);
                    const contr = formContext.getControl<Xrm.Controls.StandardControl>(c.name);
                    optionalModeEnable && contr?.clearNotification?.();
                })
            });
        }

        toggle();
    }, [optionalModeEnable, fieldsControls, formContext]);


    return (
        <ToolButton
            controlled={true}
            icon={optionalModeEnable ? <CloudIcon /> : <CloudOffIcon />}
            tooltip='Optional Mode'
            setEnabled={setOptionalMode}
        />
    );
}