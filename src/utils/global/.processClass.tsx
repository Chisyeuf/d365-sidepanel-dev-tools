
// export interface ProcessParameter {
//     id: string;
//     name: string;
//     iconUrl: string;
//     width: number;
// }
import { GetUrl, waitForElm } from "./common";
import ReactDOM from "react-dom";
import React from "react";
import { Button } from '@mui/material';

export abstract class ProcessButton {
    static prefixId: string = 'sidepaneldevtools-';

    id: string;
    name: string;
    icon: JSX.Element;
    width: number;

    process?: React.ForwardRefExoticComponent<ProcessProps & React.RefAttributes<ProcessRef>>;
    // process?: React.FunctionComponent<ProcessProps>;
    processContainer?: React.FunctionComponent<{ children: React.ReactNode | React.ReactNode[] }>;

    ref: React.RefObject<ProcessRef>;
    // xrmUpdatedCallback?: () => void

    constructor(id: string, name: string, icon: JSX.Element, width: number) {
        this.id = ProcessButton.prefixId + id;
        this.name = name;
        this.icon = icon;
        this.width = width;
        this.onClick = this.onClick.bind(this);

        this.ref = React.createRef<ProcessRef>();

        // this.reStyleSidePane = this.reStyleSidePane.bind(this);
        // if (this.process === undefined)
        //     this.process = new ErrorProcess();
    }

    getConfiguration(): string {
        return this.id + ".conf";
    }

    onClick(): void {
        this.openSidePane(true);
    }

    bindOnClose(callback: () => void): void {
        var closeButton = document.querySelector<HTMLElement>('#' + this.id + " div:first-child div:first-child button");
        if (closeButton) {
            closeButton.addEventListener('click', callback);
        }
    }


    openSidePane(selected: boolean = true): void {
        const paneExist = Xrm.App.sidePanes.getPane(this.id);
        if (paneExist) {
            paneExist.select();
            return;
        }

        var paneOption: Xrm.App.PaneOptions = {
            paneId: this.id,
            title: this.name,
            canClose: true,
            imageSrc: GetUrl("icons/favicon.ico"),
            hideHeader: false,
            isSelected: selected,
            width: this.width,
            hidden: false,
            alwaysRender: true,
            keepBadgeOnSelect: true
        }

        Xrm.App.sidePanes.createPane(paneOption);

        waitForElm('#' + this.id + ' > div > div:last-child').then((sidePane) => {
            let nodeToRender;
            if (this.processContainer)
                nodeToRender = <this.processContainer>{this.process ? <this.process id={this.id} ref={this.ref} /> : <ErrorProcess />}</this.processContainer>
            else
                nodeToRender = this.process ? <this.process id={this.id} ref={this.ref} /> : <ErrorProcess />

            this.reStyleSidePane();
            ReactDOM.render(
                nodeToRender,
                sidePane
            );
            this.ref.current?.onClose && this.bindOnClose(this.ref.current?.onClose)
        });

        waitForElm('button[aria-controls=' + this.id + '] > span').then((sidePaneOpenButton) => {
            if (sidePaneOpenButton) {
                var iconContainer = document.createElement("div");
                var rawicon = sidePaneOpenButton.querySelector("img");
                if (rawicon) rawicon.style.display = "none";
                sidePaneOpenButton.appendChild(iconContainer);

                ReactDOM.render(
                    <>{this.icon}</>,
                    iconContainer
                );
            }
        });
    };

    reStyleSidePane(): void {
        return;
    }
    render(): React.ReactNode {
        return <Button variant="contained" size="medium" fullWidth onClick={this.onClick} endIcon={this.icon} >{this.name}</Button>
        // <Icon styles={ProcessButton.iconStyles} iconName={this.icon} />
    }
}

function ErrorProcess() {
    return <div>Process not implemented.</div>
}

export interface ProcessProps {
    id: string;
}
export type ProcessRef = {
    onClose?: () => void,
    // onMessage?: () => void,
}