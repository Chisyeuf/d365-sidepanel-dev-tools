import { Env } from './var';


export function setStyle(_document: Document, stylesheetid: string, style: { [querySelector: string]: string[] }) {
    var styleNode = _document.querySelector<HTMLStyleElement>("#" + stylesheetid);
    if (styleNode == null) {
        styleNode = _document.createElement("style");
        styleNode.id = stylesheetid;
        _document.head.appendChild(styleNode);
    }
    let styleText = '';
    for (var key in style) {
        var value = style[key];
        var styleElementsText = "";
        for (let i = 0; i < value.length; i++) {
            const styleElement = value[i];
            styleElementsText += styleElement + ";";
        }
        styleText += key + "{" + styleElementsText + "}";
    }
    styleNode.innerText = styleText;
}

export function waitForElm<T extends HTMLElement>(_document: Document, selector: string, options: { infiniteWait?: boolean, waitingTime?: number, signal?: AbortSignal } = {}) {
    return new Promise<T | null>((resolve, reject) => {
        const { infiniteWait = false, waitingTime = 4000, signal } = options;

        if (signal?.aborted) {
            return reject(new DOMException(`waitForElm ${selector} - Aborted when starting`));
        }

        const existing = _document.querySelector<T>(selector);
        if (existing) {
            return resolve(existing);
        }

        let timeout: NodeJS.Timeout;
        const observer = new MutationObserver(mutations => {
            if (signal?.aborted) {
                observer.disconnect();
                return reject(new DOMException(`waitForElm ${selector} - Aborted after mutation`));
            }
            if (_document.querySelector(selector)) {
                clearTimeout(timeout);
                observer.disconnect();
                resolve(_document.querySelector<T>(selector));
            }
        });

        if (!infiniteWait) {
            timeout = setTimeout(() => {
                console.warn("SidePanel Tools - waitForElm: the DOM element", selector, "is not found on document", _document);
                observer.disconnect();
                resolve(null);
            }, waitingTime);
        }

        signal?.addEventListener("abort", () => {
            clearTimeout(timeout);
            observer.disconnect();
            reject(new DOMException(`waitForElm ${selector} - Aborted with signal event`));
        });

        observer.observe(_document.body, {
            childList: true,
            subtree: true
        });
    });
}

export function waitForElmList<T extends HTMLElement>(selector: string) {
    return new Promise<NodeListOf<T> | null>(resolve => {
        if (document.querySelectorAll(selector).length > 0) {
            return resolve(document.querySelectorAll<T>(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelectorAll(selector).length > 0) {
                resolve(document.querySelectorAll<T>(selector));
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

export function GetExtensionId(): string {
    var extensionUrl = GetData("extensionURL");
    return extensionUrl.split('/')[2];
}

export function GetUrl(url: string): string {
    var extensionUrl = GetData("extensionURL");
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
    return getDifferenceInArrays(a, b).length === 0
}

export function isObjectEquals(object1: any, object2: any) {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (const key of keys1) {
        const val1 = object1[key];
        const val2 = object2[key];
        const areObjects = isObject(val1) && isObject(val2);
        if (
            (areObjects && !isObjectEquals(val1, val2)) ||
            (!areObjects && val1 !== val2)
        ) {
            return false;
        }
    }

    return true;
}

export function isObject(object: any) {
    return object != null && typeof object === 'object';
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

export function actionWithDisabledSaving(action?: () => any) {
    if (!Xrm.Page.getAttribute)
        return;

    const attributes = Xrm.Page.getAttribute();

    const attributesSubmitModeStorage = attributes.map(a => { return { attribute: a, submitMode: a.getSubmitMode() } });

    attributes.forEach(a => {
        a.setSubmitMode('never');
    });

    let result;
    if (action)
        result = action();

    setTimeout(() => {
        attributesSubmitModeStorage.forEach(a => {
            a.attribute.setSubmitMode(a.submitMode);
        });
    }, 500);
    return result;
}

export function debugLog(...args: any[]) {
    if (Env.DEBUG) {
        console.log(...args);
    }
}
export function debugError(...args: any[]) {
    if (Env.DEBUG) {
        console.error(...args);
    }
}


export async function GetPrimaryIdAttribute(entityname: string) {
    return (await Xrm.Utility.getEntityMetadata(entityname)).PrimaryIdAttribute;
}
export async function GetPrimaryNameAttribute(entityname: string) {
    return (await Xrm.Utility.getEntityMetadata(entityname)).PrimaryNameAttribute;
}

export function getCurrentDynamics365DateTimeFormat() {
    const dateFormattingInfo = Xrm.Utility.getGlobalContext().userSettings.dateFormattingInfo;
    const shortDatePattern = dateFormattingInfo.ShortDatePattern.replace(/\byyyy\b/, 'YYYY').replace(/\bdd\b/, 'DD').replace(/\bd\b/, 'DD');
    return {
        ShortDatePattern: shortDatePattern,
        ShortDateTimePattern: shortDatePattern + " " + dateFormattingInfo.ShortTimePattern.replace(/\btt\b/, 'A'),
        is12hours: dateFormattingInfo.ShortTimePattern.includes('tt'),
        FullDateTimePattern: dateFormattingInfo.FullDateTimePattern.replace(/\byyyy\b/, 'YYYY').replace(/\bdd\b/, 'DD').replace(/\bd\b/, 'DD'),
    }
}

export function yieldToMain() {
    return new Promise(resolve => {
        setTimeout(resolve, 0);
    });
}

export const noOperation = () => {
    return '' as any;
};

export type StringKeys<T> = {
    [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];