import { ScriptOverride } from "../../utils/types/ScriptOverride"


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
    });

    chrome.debugger.onEvent.addListener((source, method, params: any) => {
        // console.log(params);
        if (!params) {
            return;
        }
        var request = params.request;
        // var continueParams: ResponseContinue = {
        //     requestId: params.requestId,
        // };
        // var fulfillParams: ResponseOverride = {
        //     requestId: params.requestId,
        //     responseCode: 0,
        // };
        if (source.tabId === target.id) {
            if (method === "Fetch.requestPaused") {
                console.log(request.url);
                if (request.url === 'https://dev-crm.crm12.dynamics.com/%7b638173226750000200%7d/webresources/tls_account_dis.js') {
                        console.log("OK");
                    }
                if (Object.keys(scriptOverride).includes(request.url)) {
                    const response: ResponseOverride = {
                        requestId: params.requestId,
                        responseCode: 200,
                        body: btoa(unescape(encodeURIComponent(scriptOverride[request.url]))),
                    }
                    chrome.debugger.sendCommand(debugee, 'Fetch.fulfillRequest', response);
                    // ajaxMe(request.url, request.headers, request.method, request.postData, (data) => {
                    //     fulfillParams.responseHeaders = data.headers;
                    //     // fulfillParams.binaryResponseHeaders = btoa(unescape(encodeURIComponent(data.headersString.replace(/(?:\r\n|\r|\n)/g, '\0'))));
                    // }, (status) => {
                    //     chrome.debugger.sendCommand(debugee, 'Fetch.continueRequest', continueParams);
                    // });
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
}

export function disbaleScriptOverride(sender: chrome.runtime.MessageSender) {
    const target = sender.tab;
    if (!target) return;

    const debugee = { tabId: target.id };

    chrome.debugger.detach(debugee);
}


// type ResponseCallBack = (response: FetchResponse) => void;
// interface FetchResponse {
//     response: string,
//     headersString: string,
//     headers?: Headers
// }


// async function ajaxMe(url: RequestInfo, headers?: HeadersInit, method?: string, postData?: BodyInit | null, success?: ResponseCallBack, error?: ResponseCallBack): Promise<void> {
//     let finalResponse: FetchResponse = { headersString: '', response: '' };
//     let response = await fetch(url, {
//         method,
//         mode: 'cors',
//         headers,
//         redirect: 'follow',
//         body: postData
//     });
//     finalResponse.response = await response.text();
//     finalResponse.headersString = getHeaderString(response.headers);
//     finalResponse.headers = response.headers;
//     if (response.ok) {
//         success?.(finalResponse);
//     } else {
//         error?.(finalResponse);
//     }
// }

// function getHeaderString(headers: Headers): string {
//     let responseHeader = '';
//     headers.forEach((header, key) => {
//         responseHeader += key + ':' + header + '\n';
//     });
//     return responseHeader;
// }