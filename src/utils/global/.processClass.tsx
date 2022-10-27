
// export interface ProcessParameter {
//     id: string;
//     name: string;
//     iconUrl: string;
//     width: number;
// }
import { GetUrl, waitForElm } from "./common";
import ReactDOM from "react-dom";
import React from "react";
import { Button, SvgIconProps } from '@mui/material';

export abstract class ProcessButton {
    id: string;
    name: string;
    icon: SvgIconProps;
    width: number;

    process?: React.FunctionComponent<ProcessProps>;

    constructor(id: string, name: string, icon: SvgIconProps, width: number) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.width = width;
        this.onClick = this.onClick.bind(this);
        // this.reStyleSidePane = this.reStyleSidePane.bind(this);
        // if (this.process === undefined)
        //     this.process = new ErrorProcess();
    }

    onClick(): void {
        this.openSidePane();
    }

    openSidePane(selected: boolean = true): void {
        if (Xrm.App.sidePanes.getPane(this.id))
            return;

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
            this.reStyleSidePane();
            ReactDOM.render(
                this.process ? <this.process id={this.id} /> : <ErrorProcess />,
                sidePane
            );
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