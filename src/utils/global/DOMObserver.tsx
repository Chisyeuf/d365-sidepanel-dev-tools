
// const ObserveDOM = (function () {
//     var MutationObserver = window.MutationObserver;
//     //  || window.WebKitMutationObserver;

//     return function (obj: Element | null | undefined, callback: (mutations: MutationRecord[], observer: MutationObserver) => void): MutationObserver | null {
//         if (!obj || obj.nodeType !== 1) return null;

//         // define a new observer
//         var mutationObserver = new MutationObserver(callback);

//         // have the observer observe for changes in children
//         mutationObserver.observe(obj, { childList: true, subtree: true });
//         return mutationObserver;
//     }
// })();


export default class DOMObserver {

    eventName: string;
    mutationOptions: MutationObserverInit | undefined;

    constructor(eventName: string, obj: Element | null | undefined, mutationOptions?: MutationObserverInit) {
        this.eventName = eventName;
        this.mutationOptions = mutationOptions;
        this.ObservePageChanges(obj);
    }

    ObservePageChanges(obj: Element | null | undefined) {
        if (obj) {
            const observer = new MutationObserver(mutations => {
                document.dispatchEvent(new CustomEvent(this.eventName));
            });
            observer.observe(obj, this.mutationOptions);
        }
    }

    addListener(callback: () => void) {
        callback && document.addEventListener(this.eventName, callback, false);
    }

    removeListener(callback: () => void) {
        callback && document.removeEventListener(this.eventName, callback, false);
    }

}