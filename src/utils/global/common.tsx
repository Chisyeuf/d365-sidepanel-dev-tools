import { ProcessButton } from './.processClass';
import { MSType } from './requestsType';

// export function setStorage(processListOrdered : ProcessButton[]) {
//     chrome.storage.sync.set({processListOrdered: processListOrdered});
// }

// export function getStorage(): ProcessButton[] {
//     return (await chrome.storage.sync.get(['processListOrdered']))['processListOrdered'] as ProcessButton[]
// }

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
    return data?.getAttribute("data") ?? '';
}

export function GetUrl(url: string): string {
    var extensionUrl = GetData("extensionid");
    return extensionUrl + url;
}

export function formatId(guid: string) {
    return guid?.replace('{', '').replace('}', '');
}

export function getDifferenceInArrays<T>(a: T[], b: T[]): T[] {
    return [
        ...a.filter((element) => {
            return !b.includes(element);
        }),
        ...b.filter((element) => {
            return !a.includes(element);
        })
    ]
}

export function isArraysEquals<T>(a: T[], b: T[]): boolean {
    return getDifferenceInArrays(a, b).length == 0
}

export function capitalizeFirstLetter(str: string) {
    if (!str) return '';

    var firstCodeUnit = str[0];

    if (firstCodeUnit < '\uD800' || firstCodeUnit > '\uDFFF') {
        return str[0].toUpperCase() + str.slice(1);
    }

    return str.slice(0, 2).toUpperCase() + str.slice(2);
}

export const groupBy = function (xs: any[], key: string): { [key: string]: any[] } {
    return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};

export function debugLog(...args: any[]) {
    if (true) {
        console.log(...args);
    }
}