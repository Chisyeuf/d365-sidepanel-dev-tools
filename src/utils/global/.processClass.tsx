
// export interface ProcessParameter {
//     id: string;
//     name: string;
//     iconUrl: string;
//     width: number;
// }
import React from "react";
import { Button } from '@mui/material';
import { ProviderContext as SnackbarProviderContext, useSnackbar } from "notistack";
import { projectPrefix } from "./var";
import { useEffectOnce } from "usehooks-ts";
// import { SnackbarProviderContextInterface } from "../types/Snackbar";

export abstract class ProcessButton {
    static prefixId: string = projectPrefix;
    // static prefixId: string = 'sidepaneldevtools-';

    id: string;
    name: string;
    icon: JSX.Element;
    width: number;
    openable: boolean;

    process?: React.ForwardRefExoticComponent<ProcessProps & React.RefAttributes<ProcessRef>>;
    // process?: React.FunctionComponent<ProcessProps>;
    processContainer?: React.FunctionComponent<{ children: React.ReactNode | React.ReactNode[] }>;

    ref: React.RefObject<ProcessRef>;
    // xrmUpdatedCallback?: () => void

    constructor(id: string, name: string | (() => string), icon: JSX.Element, width: number, openable: boolean = true) {
        this.id = ProcessButton.prefixId + id;
        this.name = typeof name === 'string' ? name : name();
        this.icon = icon;
        this.width = width;
        this.openable = openable;
        // this.onClickStandard = this.onClickStandard.bind(this);

        this.ref = React.createRef<ProcessRef>();

        // this.reStyleSidePane = this.reStyleSidePane.bind(this);
        // if (this.process === undefined)
        //     this.process = new ErrorProcess();
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
        // this.onExtensionLoad(snackbarProviderContext);
        // return <Button variant="contained" size="medium" fullWidth onClick={() => onClick(this)} endIcon={this.icon} >{this.name}</Button>;
        return <ButtonProcess_Bis icon={this.icon} name={this.name} onClick={() => onClick(this)} processButton={this} />
        // return <Button variant="contained" size="medium" fullWidth onClick={() => onClick(this)} endIcon={this.icon} >{this.name}</Button>;
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

const ButtonProcess_Bis = (props: { processButton:ProcessButton, onClick: (process: ProcessButton) => any, icon: React.ReactNode, name: string }) => {
    const { icon, name, onClick, processButton } = props;
    
    const snackbarProviderContext = useSnackbar();

    useEffectOnce(() => {
        processButton.onExtensionLoad(snackbarProviderContext);
    });
    
    return (
        <Button variant="contained" size="medium" fullWidth onClick={() => onClick(processButton)} endIcon={icon} >{name}</Button>
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
    // onMessage?: () => void,
}