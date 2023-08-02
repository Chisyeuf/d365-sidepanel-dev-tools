import { ProcessButton } from './.processClass';
import { MSType } from '../types/requestsType';
import { Env } from './var';


export function setStyle(selector: string, style: { [querySelector: string]: string[] }) {
    var styleNode = document.querySelector<HTMLStyleElement>("#" + selector);
    if (styleNode == null) {
        styleNode = document.createElement("style");
        styleNode.id = selector;
        document.head.appendChild(styleNode);
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

export function waitForElm<T extends HTMLElement>(selector: string) {
    return new Promise<T | null>(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector<T>(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector<T>(selector));
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


export async function GetPrimaryIdAttribute(entityname: string) {
    return (await Xrm.Utility.getEntityMetadata(entityname)).PrimaryIdAttribute;
}
export async function GetPrimaryNameAttribute(entityname: string) {
    return (await Xrm.Utility.getEntityMetadata(entityname)).PrimaryNameAttribute;
}