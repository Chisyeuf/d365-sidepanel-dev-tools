
// chrome.storage.onChanged.addListener((changes, area) => {
//     if (area === 'sync' && changes.options?.newValue) {
//         const debugMode = Boolean(changes.options.newValue.debug);
//         console.log('enable debug mode?', debugMode);
//     }
// });

// import puppeteer from "puppeteer";
import { getSessionRules, manageImpersonation } from "./processes/impersonation/background";
import { getExtensionConfiguration, setExtensionConfiguration } from "./processes/setConfiguration/background";
import { disbaleScriptOverride, enableScriptOverride } from "./processes/webRessourceEditor/background";
import { MessageType } from "./utils/types/Message";

// (async function () {

//     const browser = await puppeteer.launch({ headless: false });
//     const page = await browser.newPage();
//     await page.setRequestInterception(true);

//     page.on('request', request => {
//         let url = request.url().replace(/\/$/g, "");
//         console.log("REQUEST:", url);
//         if (url === "https://dev-crm.crm12.dynamics.com/%7b638169698030000184%7d/webresources/tls_account_dis.js") {
//             request.respond({
//                 status: 200,
//                 contentType: 'application/javascript; charset=utf-8',
//                 body: `/**
//                 * Name : tls_account_dis.js
//                 * JS File which has a dependency with the entity Account
//                 * into the CRM MDS365 DIS Sales
//                 */

//                /**
//                 * @description : Function that runs when the page is loaded
//                 * @param {*} executionContext
//                 */
//                function onLoad(executionContext) {
//                    alert("onload WIN!!!");
//                }

//                /**
//                 * @description Function that runs when the page is saved
//                 * @param {*} executionContext
//                 */
//                function onSave(executionContext) {
//                    alert("onSave WIN !!!");
//                }
//                `,
//             });
//         }
//         else {
//             request.continue();
//         }
//     });

//     await page.goto("https://dev-crm.crm12.dynamics.com/main.aspx?appid=2422b58b-4a1e-4d31-8d32-86cce6a95cda&pagetype=entityrecord&etn=account&id=e9b0e879-bf17-ed11-b83c-000d3a958672");
// })();

chrome.runtime.onMessageExternal.addListener(messagesStation);

function messagesStation(message: { type: string, data: any }, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) {
    console.log("background onMessageExternal", message);

    switch (message.type) {
        case MessageType.IMPERSONATE:
            manageImpersonation(message.data, sender).then(sendResponse);
            return true;
        case MessageType.GETIMPERSONATION:
            getSessionRules().then(sendResponse);
            return true;
        case MessageType.SETCONFIGURATION:
            setExtensionConfiguration(message.data)
            return false;
        case MessageType.GETCONFIGURATION:
            getExtensionConfiguration(message.data).then(sendResponse);
            return true;
        case MessageType.ENABLEREQUESTINTERCEPTION:
            enableScriptOverride(message.data, sender);
            return false;
        case MessageType.DISABLEREQUESTINTERCEPTION:
            disbaleScriptOverride(sender);
            return false;
    }

    return false;
}

