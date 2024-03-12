
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
        this.onClickStandard = this.onClickStandard.bind(this);

        this.ref = React.createRef<ProcessRef>();

        // this.reStyleSidePane = this.reStyleSidePane.bind(this);
        // if (this.process === undefined)
        //     this.process = new ErrorProcess();
    }

    getConfiguration(): string {
        return this.id + ".conf";
    }



    getProcess(setBadge: (content: number | string | null) => void): React.JSX.Element {
        if (this.processContainer)
            return <this.processContainer>{this.process ? <this.process id={this.id} ref={this.ref} setBadge={setBadge} /> : <ErrorProcess />}</this.processContainer>;
        else
            return this.process ? <this.process id={this.id} ref={this.ref} setBadge={setBadge} /> : <ErrorProcess />;
    }

    getButton(onClick: (process: ProcessButton) => any): React.JSX.Element {
        return <Button variant="contained" size="medium" fullWidth onClick={() => onClick(this)} endIcon={this.icon} >{this.name}</Button>;
    }

    getButtonOpeningStandardPanel(): React.JSX.Element {
        return this.getButton(this.onClickStandard);
    }

    setBadgeStandard(content: number | string | null) {
        const pane: any = Xrm.App.sidePanes.getPane(this.id);
        if (pane) {
            if (typeof content === 'string') {
                pane.badge = content;
            } else if (content !== null) {
                pane.badge = content > 0 ? content : 0;
            } else {
                pane.badge = null;
            }
        }
    }

    onClickStandard(): void {
        this.openSidePane(true);
    }

    bindOnClose(callback: () => void): void {
        var closeButton = document.querySelector<HTMLElement>('#' + this.id + " div:first-child div:first-child button");
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                callback();
                const node = document.querySelector('#' + this.id + ' > div > div:last-child');
                if (node) {
                    try {
                        ReactDOM.unmountComponentAtNode(node);
                    }
                    catch {
                    }
                }
            });
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
            this._reStyleSidePane();
            ReactDOM.render(
                this.getProcess(this.setBadgeStandard),
                sidePane
            );
            this.ref.current?.onClose && this.bindOnClose(this.ref.current?.onClose);
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

    _reStyleSidePane(): void {
        const sidePane = document.querySelector<HTMLElement>('#' + this.id);
        const sidePaneContent = sidePane?.querySelector<HTMLElement>("div:first-child");
        const header = sidePaneContent?.querySelector<HTMLElement>("div:first-child");
        const h2 = header?.querySelector<HTMLElement>("h2");
        const button = header?.querySelector<HTMLElement>("button");

        if (this.width < 300) {
            if (sidePane) {
                sidePane.style.width = this.width + "px";
                if (sidePaneContent) {
                    sidePaneContent.style.minWidth = "100%";
                    if (header) {
                        header.style.flexDirection = "row";
                        header.style.paddingLeft = "5px";
                        header.style.paddingRight = "5px";
                        header.style.alignItems = "flex-end";
                        header.style.justifyContent = "flex-end";

                        if (h2) {
                            h2.style.width = "auto";
                        }

                        if (button) {
                            button.style.alignSelf = "unset";
                            button.style.marginRight = "8px";
                        }
                    }
                }
            }
        }
        this.reStyleSidePane(sidePane, sidePaneContent, header, h2, button);
    }

    reStyleSidePane(sidePane: HTMLElement | null, sidePaneContent?: HTMLElement | null, header?: HTMLElement | null, title?: HTMLElement | null, closeButton?: HTMLElement | null): void {
        return;
    }

    // render(): React.ReactNode {
    //     return this.getButton();
    //     // <Icon styles={ProcessButton.iconStyles} iconName={this.icon} />
    // }
}

function ErrorProcess() {
    return <div>Process not implemented.</div>
}

export interface ProcessProps {
    id: string;
    setBadge: (number: number | string | null) => void
}
export type ProcessRef = {
    onClose?: () => void,
    // onMessage?: () => void,
}