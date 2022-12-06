import { waitForElm } from "./common";


export default class XrmObserver {

    Xrm: Xrm.XrmStatic;

    constructor() {
        this.ObservePageChanges();
        this.Xrm = Xrm;
    }

    ObservePageChanges() {
        const selector: string = "#panels > [role=main]";
        waitForElm(selector).then((mainContainer) => {
            const observer = new MutationObserver(mutations => {
                this.Xrm = Xrm;
                document.dispatchEvent(new CustomEvent('xrmupdated', { detail: { Xrm } }));
            });
            observer.observe(mainContainer!, {
                childList: false,
                subtree: false,
                attributes: true
            });
        });
    }

    static addListener(xrmUpdatedCallback: () => void) {
        document.addEventListener('xrmupdated', (e) => {
            xrmUpdatedCallback && xrmUpdatedCallback();
        }, false);
    }

}