const allowedScripts = ['/uclient/scripts/cdnEndpointCheck.js', '/uclient/scripts/MicrosoftAjax.js'];

window.onload = async () => {
    const isCRMD365 = Array.from(document.scripts).some(
        (script) =>
            allowedScripts.some(src => script.src.indexOf(src) !== -1)
    );
    console.log('This page is CRM:', isCRMD365);
    if (isCRMD365) {
        injectScript(chrome.runtime.getURL("static/js/spdevtools.js"));
        SaveData(chrome.runtime.getURL(""), "extensionURL");
    }
}

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

export { }