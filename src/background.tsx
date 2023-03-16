
// chrome.storage.onChanged.addListener((changes, area) => {
//     if (area === 'sync' && changes.options?.newValue) {
//         const debugMode = Boolean(changes.options.newValue.debug);
//         console.log('enable debug mode?', debugMode);
//     }
// });

import { getSessionRules, manageImpersonation } from "./processes/impersonation/background";
import { getExtensionConfiguration, setExtensionConfiguration } from "./processes/setConfiguration/background";
import { MessageType } from "./utils/types/Message";

chrome.runtime.onMessageExternal.addListener(messagesStation);

function messagesStation(message: { type: string, data: any }, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) {
    console.log("background onMessageExternal", message);

    switch (message.type) {
        case MessageType.IMPERSONATE:
            manageImpersonation(message.data, sender);
            return false;
        case MessageType.GETIMPERSONATION:
            getSessionRules().then(sendResponse);
            return true;
        case MessageType.SETCONFIGURATION:
            setExtensionConfiguration(message.data)
            return false;
        case MessageType.GETCONFIGURATION:
            getExtensionConfiguration(message.data).then(sendResponse);
            return true;
    }

    return false;
}

