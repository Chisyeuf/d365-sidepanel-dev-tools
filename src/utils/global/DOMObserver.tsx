
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