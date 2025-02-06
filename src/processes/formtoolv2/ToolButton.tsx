import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import { Dispatch, SetStateAction, useCallback, useContext } from "react";
import { FormToolContext } from "./main";

type ToolButtonStandardIdentifier = { controlled: false; }
type ToolButtonControlledIdentifier = { controlled: true; }

export type IToolButtonStandard = {
    onClick: () => void;
} & ToolButtonStandardIdentifier;

export type IToolButtonControlled = {
    enabled: boolean;
    setEnabled: Dispatch<SetStateAction<boolean>>;
} & ToolButtonControlledIdentifier;

export type IToolButton = {
    icon: React.ReactNode;
    tooltip: React.ReactNode;

    controlled: boolean;
} & (IToolButtonStandard | Omit<IToolButtonControlled, 'enabled'>);

export function ToolButton(props: IToolButton) {
    const { controlled } = props;

    return (
        controlled ?
            <ToolButtonControlled {...props} />
            :
            <ToolButtonStandard {...props} />
    );
}

function ToolButtonStandard(props: IToolButton & { controlled: false }) {
    const { icon, tooltip, onClick } = props;
    const { refresh } = useContext(FormToolContext);

    const refreshContextThenClick = useCallback(() => {
        refresh().then(onClick);
    }, [onClick, refresh]);


    return (
        <Tooltip title={tooltip} placement='left' disableInteractive arrow>
            <Button
                variant='contained'
                onClick={refreshContextThenClick}
                startIcon={icon}
            />
        </Tooltip>
    );
}

function ToolButtonControlled(props: IToolButton & { controlled: true }) {
    const { icon, tooltip, setEnabled } = props;
    const { refresh } = useContext(FormToolContext);

    const toggle = useCallback(() => {
        refresh().then(() => setEnabled((prev) => !prev));
    }, [refresh, setEnabled]);

    return (
        <Tooltip title={tooltip} placement='left' disableInteractive arrow>
            <Button
                variant='contained'
                onClick={toggle}
                startIcon={icon}
            />
        </Tooltip>
    );
}

export type FormControlState<T> = {
    name: string
    defaultState: T
}