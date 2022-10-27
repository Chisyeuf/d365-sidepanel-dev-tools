import { MSType } from './requestsType';

export function waitForElm(selector: string) {
    return new Promise<HTMLElement | null>(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector<HTMLElement>(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector<HTMLElement>(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

export function GetData(id: string): string {
    var data = document.getElementById(id);
    return data?.getAttribute("data") ?? "";
}

export function GetUrl(url: string): string {
    var extensionUrl = GetData("extensionid");
    return extensionUrl + url;
}

export function formatId(guid: string) {
    return guid.replace('{', '').replace('}', '');
}