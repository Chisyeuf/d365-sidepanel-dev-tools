
const ObserveDOM = (function () {
    var MutationObserver = window.MutationObserver;
    //  || window.WebKitMutationObserver;

    return function (obj: Element | null | undefined, callback: (mutations: MutationRecord[], observer: MutationObserver) => void): MutationObserver | null {
        if (!obj || obj.nodeType !== 1) return null;

        // define a new observer
        var mutationObserver = new MutationObserver(callback);

        // have the observer observe for changes in children
        mutationObserver.observe(obj, { childList: true, subtree: true });
        return mutationObserver;
    }
})();

export default ObserveDOM;