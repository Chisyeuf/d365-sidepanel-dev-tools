import { ScriptOverride } from "../../utils/types/ScriptOverride"

const TAB_IN_DEBUG_MODE: { [tabId: number]: boolean } = {};

const SCRIPT_OVERRIDED: { [tabId: number]: ScriptOverride } = {};


interface ResponseContinue {
    requestId: any
}
interface ResponseOverride {
    requestId: any
    responseCode: number
    responseHeaders?: Headers
    binaryResponseHeaders?: string
    body?: string
}

export function enableScriptOverride(scriptOverride: ScriptOverride, sender: chrome.runtime.MessageSender) {

    if (!scriptOverride) return;

    const target = sender.tab;
    if (!target) return;

    const debugee = { tabId: target.id };

    chrome.debugger.attach(debugee, "1.0", () => {
        chrome.debugger.sendCommand(debugee, "Fetch.enable", { patterns: [{ urlPattern: '*' }], });
        if (debugee.tabId) {
            TAB_IN_DEBUG_MODE[debugee.tabId] = true;
            SCRIPT_OVERRIDED[debugee.tabId] = scriptOverride;
        }
    });

}

export function disbaleScriptOverride(sender: chrome.runtime.MessageSender) {
    const target = sender.tab;
    if (!target) return;

    const debugee = { tabId: target.id };

    chrome.debugger.detach(debugee);
}

chrome.debugger.onDetach.addListener((debugee, reason) => {
    if (debugee.tabId) {
        TAB_IN_DEBUG_MODE[debugee.tabId] = false;
        SCRIPT_OVERRIDED[debugee.tabId] = {};
    }
});
chrome.debugger.onEvent.addListener((debugee, method, params: any) => {
    if (!params) {
        return;
    }

    var request = params.request;

    if (debugee.tabId && TAB_IN_DEBUG_MODE[debugee.tabId]) {
        if (method === "Fetch.requestPaused") {
            const scriptOverridedUrlRegex = Object.keys(SCRIPT_OVERRIDED[debugee.tabId]).find(urlRegex => new RegExp(urlRegex).test(request.url));
            if (scriptOverridedUrlRegex) {
                const response: ResponseOverride = {
                    requestId: params.requestId,
                    responseCode: 200,
                    body: btoa(unescape(encodeURIComponent(SCRIPT_OVERRIDED[debugee.tabId][scriptOverridedUrlRegex].modified))),
                }
                chrome.debugger.sendCommand(debugee, 'Fetch.fulfillRequest', response);
            }
            else {
                const response: ResponseContinue = {
                    requestId: params.requestId,
                };
                chrome.debugger.sendCommand(debugee, 'Fetch.continueRequest', response);
            }
        }
    }
});

export async function getScriptOverride(sender: chrome.runtime.MessageSender): Promise<ScriptOverride | null> {
    const target = sender.tab;
    if (!target) return null;
    const tabId = target.id;
    if (!tabId) return null;
    return SCRIPT_OVERRIDED[tabId];
}

export async function debuggerAttached(sender: chrome.runtime.MessageSender): Promise<boolean> {
    const target = sender.tab;
    if (!target) return false;
    const tabId = target.id;
    if (!tabId) return false;
    return TAB_IN_DEBUG_MODE[tabId];
}