import { MESSAGE_SOURCE_Content, MESSAGE_SOURCE_WebPage } from "./utils/global/var";

const allowedScripts = ['/uclient/scripts/cdnEndpointCheck.js', '/uclient/scripts/MicrosoftAjax.js'];

// window.onload = async () => {
//     const isCRMD365 = Array.from(document.scripts).some(
//         (script) =>
//             allowedScripts.some(src => script.src.indexOf(src) !== -1)
//     );
//     console.log('This page is CRM:', isCRMD365);
//     if (isCRMD365) {
//         injectScript(chrome.runtime.getURL("static/js/d365-sidekick.js"));
//         SaveData(chrome.runtime.getURL(""), "extensionURL");
//     }
// }

const fileName = "d365-sidekick";

var injectScript = function (file: string): void {
    var existingScript = document.querySelector("script[src='" + file + "']");
    if (existingScript) {
        console.log("Script " + file + " removed");
        existingScript.parentElement?.removeChild(existingScript);
    }
    var scriptTag = document.createElement('script');
    scriptTag.setAttribute('type', 'text/javascript');
    scriptTag.setAttribute('src', file);
    document.body.appendChild(scriptTag);
};

function SaveData(data: string, id: string): void {
    var existingNode = document.querySelector("#" + id);
    if (existingNode) {
        console.log("Node " + id + " removed");
        existingNode.parentElement?.removeChild(existingNode);
    }
    var imageElement = document.createElement("saving");
    imageElement.setAttribute("data", data);
    imageElement.setAttribute("style", "display:none;");
    imageElement.setAttribute("id", id);
    document.body.appendChild(imageElement);
}

setTimeout(async () => {
    const isCRMD365 = Array.from(document.scripts).some(
        (script) =>
            allowedScripts.some(src => script.src.indexOf(src) !== -1)
    );
    console.log('This page is CRM:', isCRMD365);
    if (isCRMD365) {
        injectScript(chrome.runtime.getURL(`static/js/${fileName}.js`));
        SaveData(chrome.runtime.getURL(""), "extensionURL");
    }
}, 2000);

window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    if (event.data.source !== MESSAGE_SOURCE_WebPage) return;

    const messageId = event.data.id;
    
    chrome.runtime.sendMessage({ type: event.data.type, data: event.data.data },
        function (response: any) {
            window.postMessage({ id: messageId, source: MESSAGE_SOURCE_Content, response }, '*');
        }
    );
});


export { }