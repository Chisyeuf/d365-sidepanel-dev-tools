import { waitForElm } from "./common";

export const XrmObserverSelector: string = "#navigationcontextprovider";
export default class XrmObserver {

    Xrm: Xrm.XrmStatic;

    constructor() {
        this.ObservePageChanges();
        this.Xrm = Xrm;
    }

    ObservePageChanges() {
        waitForElm(document, XrmObserverSelector, true).then((mainContainer) => {
            const observer = new MutationObserver(mutations => {
                this.Xrm = Xrm;
                document.dispatchEvent(new CustomEvent('xrmupdated', { detail: { Xrm } }));
            });
            observer.observe(mainContainer!, {
                childList: false,
                subtree: false,
                attributes: true,
                attributeFilter: ["route"],
            });
        });
    }

    static addListener(xrmUpdatedCallback: () => void) {
        xrmUpdatedCallback && document.addEventListener('xrmupdated', xrmUpdatedCallback, false);
    }

    static removeListener(xrmUpdatedCallback: () => void) {
        xrmUpdatedCallback && document.removeEventListener('xrmupdated', xrmUpdatedCallback, false);
    }

    static getPageType() {
        return Xrm.Utility.getPageContext().input?.pageType;
    }
    static isEntityList() {
        return this.getPageType() === 'entitylist';
    }
    static isEntityRecord() {
        return this.getPageType() === 'entityrecord';
    }

}