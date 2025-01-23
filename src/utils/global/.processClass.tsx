
import React from "react";
import { Button } from '@mui/material';
import { ProviderContext as SnackbarProviderContext, useSnackbar } from "notistack";
import { projectPrefix } from "./var";
import { useEffectOnce } from "../hooks/use/useEffectOnce";

export abstract class ProcessButton {
    static prefixId: string = projectPrefix;

    id: string;
    menuButtonName: string | JSX.Element;
    panelButtonName: string | JSX.Element;
    menuButtonIcon: JSX.Element;
    panelButtonIcon: JSX.Element;
    width: number | string;
    widthNumber: number;
    openable: boolean;
    isPanelProcess: boolean;

    process?: React.ForwardRefExoticComponent<ProcessProps & React.RefAttributes<ProcessRef>>;
    processContainer?: React.FunctionComponent<{ children: React.ReactNode | React.ReactNode[] }>;

    ref: React.RefObject<ProcessRef>;

    constructor(id: string, name: string | JSX.Element | (() => string | JSX.Element), icon: JSX.Element | (() => JSX.Element), width: number | string, isPanelProcess: boolean = true) {
        this.id = ProcessButton.prefixId + id;
        this.menuButtonName = typeof name === 'function' ? name() : name;
        this.panelButtonName = this.menuButtonName;
        this.menuButtonIcon = typeof icon === 'function' ? icon() : icon;
        this.panelButtonIcon = this.menuButtonIcon;
        this.width = width;
        this.widthNumber = typeof this.width === 'string' ? (this.width.endsWith('px') ? parseInt(this.width) : -1) : this.width;
        this.openable = true;
        this.isPanelProcess = isPanelProcess;

        this.ref = React.createRef<ProcessRef>();
    }

    getConfiguration(): string {
        return this.id + ".conf";
    }



    getProcess(setBadge: (content: React.ReactNode | null,) => void, snackbarProvider: SnackbarProviderContext): React.JSX.Element {
        if (this.processContainer)
            return <this.processContainer>{this.process ? <this.process id={this.id} ref={this.ref} setBadge={setBadge} snackbarProvider={snackbarProvider} /> : <ErrorProcess />}</this.processContainer>;
        else
            return this.process ? <this.process id={this.id} ref={this.ref} setBadge={setBadge} snackbarProvider={snackbarProvider} /> : <ErrorProcess />;
    }

    getOpeningButton(onClick: (process: ProcessButton) => any): React.JSX.Element {
        return <ButtonProcess_Bis icon={this.menuButtonIcon} name={this.menuButtonName} onClick={() => onClick(this)} processButton={this} />
    }

    getFunctionButton(): React.JSX.Element {
        return this.getOpeningButton(this.execute);
    }

    execute(): void {
    }

    onProcessClose(): void {
        this.ref.current?.onClose?.();
    }

    onExtensionLoad(snackbarProviderContext: SnackbarProviderContext): void {
    }
}

const ButtonProcess_Bis = (props: { processButton: ProcessButton, onClick: (process: ProcessButton) => any, icon: React.ReactNode, name: string | JSX.Element }) => {
    const { icon, name, onClick, processButton } = props;

    const snackbarProviderContext = useSnackbar();

    useEffectOnce(() => {
        processButton.onExtensionLoad(snackbarProviderContext);
    });

    return (
        <Button variant="contained" size="medium" sx={{ whiteSpace: 'nowrap' }} fullWidth onClick={() => onClick(processButton)} endIcon={icon} >{name}</Button>
    );
}

function ErrorProcess() {
    return <div>Process not implemented.</div>
}

export interface ProcessProps {
    id: string;
    setBadge: (number: React.ReactNode | null) => void;
    snackbarProvider: SnackbarProviderContext
}
export type ProcessRef = {
    onClose?: () => void,
}