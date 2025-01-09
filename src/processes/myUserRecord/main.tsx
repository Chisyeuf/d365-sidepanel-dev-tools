
import React, { } from 'react';
import { ProcessButton } from '../../utils/global/.processClass';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { GetUrl, waitForElm } from '../../utils/global/common';
import ReactDOM from 'react-dom';
import { createRecordSidePane } from '../../utils/global/sidePanelGenerator';

class MyUserRecordButton extends ProcessButton {
    constructor() {
        super(
            'myuserrecord',
            'My User Record',
            <AccountCircleIcon />,
            350
        );
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
        };

        const userSettings = Xrm.Utility.getGlobalContext().userSettings;

        createRecordSidePane(paneOption, "systemuser", userSettings.userId);

        waitForElm(document, 'button[aria-controls=' + this.id + '] > span').then((sidePaneOpenButton) => {
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
}





const myUserRecord = new MyUserRecordButton();
export default myUserRecord;