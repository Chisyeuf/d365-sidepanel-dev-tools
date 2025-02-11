import { waitForElm } from "./common";



export default class DOMObserver {

    eventName: string;
    mutationOptions: MutationObserverInit | undefined;
    _document: Document;
    observer: MutationObserver | null;

    isMutate: boolean;

    constructor(eventName: string, selector: string, _document: Document = document, mutationOptions: MutationObserverInit = { childList: true, subtree: true, attributes: false }) {
        this.eventName = eventName;
        this.mutationOptions = mutationOptions;
        this._document = _document;
        this.observer = null;
        this.isMutate = false;
        this.ObservePageChanges(selector);
    }

    ObservePageChanges(selector: string) {
        waitForElm(this._document, selector).then((element) => {
            if (!element) return;
            this.observer = new MutationObserver(mutations => {
                if (!this.isMutate && mutations.length > 0) {
                    this.isMutate = true;
                }
            });
            this.observer.observe(element, this.mutationOptions);
        });
    }

    addListener(callback: () => void) {
        callback && this._document.addEventListener(this.eventName, callback, false);
    }

    removeListener(callback: () => void) {
        callback && this._document.removeEventListener(this.eventName, callback, false);
    }

    hasMutate() {
        if (this.isMutate) {
            this.isMutate = false;
            return true;
        }
        return false;
    }

    disconnect() {
        this.observer?.disconnect();
    }

}