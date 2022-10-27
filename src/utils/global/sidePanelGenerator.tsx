export async function createPane(paneOptions: Xrm.App.PaneOptions, pageInput: 
    | Xrm.Navigation.PageInputEntityRecord
    | Xrm.Navigation.PageInputEntityList
    | Xrm.Navigation.CustomPage
    | Xrm.Navigation.PageInputHtmlWebResource
    | Xrm.Navigation.Dashboard) {
    var sidePane = await Xrm.App.sidePanes.createPane(paneOptions);
    sidePane.navigate(pageInput);
    // if (paneOptions.currentScreenOnly) {
    //     setSidePaneForCurrentScreen(sidePane);
    // }
    return sidePane;
}

export function definePaneOptions(
    paneId = "",
    title = "",
    currentScreenOnly = false,
    canClose = true,
    imageSrc = "",
    hideHeader = false,
    isSelected = false,
    width = -1,
    hidden = false,
    alwaysRender = false,
    keepBadgeOnSelect = true
): Xrm.App.PaneOptions {
    if (paneId === "" || paneId == null) {
        throw new Error("Argument : paneId can't be empty.");
    }

    let paneOptions:Xrm.App.PaneOptions  = {};
    paneOptions.paneId = paneId;
    if (title !== "" && title != null) {
        paneOptions.title = title;
    }
    paneOptions.canClose = canClose;
    paneOptions.hideHeader = hideHeader;
    paneOptions.isSelected = isSelected;
    paneOptions.hidden = hidden;
    paneOptions.alwaysRender = alwaysRender;
    paneOptions.keepBadgeOnSelect = keepBadgeOnSelect;
    // paneOptions.currentScreenOnly = currentScreenOnly;
    if (imageSrc !== "" && imageSrc != null) {
        paneOptions.imageSrc = imageSrc;
    }
    if (width !== -1 && width != null) {
        paneOptions.width = width;
    }
    return paneOptions;
}

export function createRecordSidePane(paneOptions: Xrm.App.PaneOptions, entityName = "", entityId = "") {
    let pageInput: Xrm.Navigation.PageInputEntityRecord = {
        pageType: "entityrecord",
        entityName: entityName,
        entityId: entityId
    };
    return createPane(paneOptions, pageInput);
}

export function createListSidePane(paneOptions: Xrm.App.PaneOptions, entityName = "", viewId = "") {
    let pageInput: Xrm.Navigation.PageInputEntityList = {
        pageType: "entitylist",
        entityName: entityName,
        viewId: viewId
    };
    return createPane(paneOptions, pageInput);
}

export function createWebressourceSidePane(paneOptions: Xrm.App.PaneOptions, webresourceName = "") {
    let pageInput: Xrm.Navigation.PageInputHtmlWebResource = {
        pageType: "webresource",
        webresourceName: webresourceName
    };
    return createPane(paneOptions, pageInput);
}

export function createDashboardSidePane(paneOptions: Xrm.App.PaneOptions, dashboardId = "") {
    let pageInput: Xrm.Navigation.Dashboard = {
        pageType: "dashboard",
        dashboardId: dashboardId
    };
    return createPane(paneOptions, pageInput);
}

// export function setSidePaneForCurrentScreen(sidePane) {
//     history.pushState = ((f) =>
//         function pushState() {
//             var ret = f.apply(this, arguments);
//             window.dispatchEvent(new Event("pushstate"));
//             window.dispatchEvent(new Event("locationchange"));
//             return ret;
//         })(history.pushState);
//     history.replaceState = ((f) =>
//         function replaceState() {
//             var ret = f.apply(this, arguments);
//             window.dispatchEvent(new Event("replacestate"));
//             window.dispatchEvent(new Event("locationchange"));
//             return ret;
//         })(history.replaceState);
//     window.addEventListener("popstate", () => {
//         window.dispatchEvent(new Event("locationchange"));
//     });
//     window.addEventListener(
//         "locationchange",
//         function () {
//             console.log(sidePane.paneId);
//             Xrm.App.sidePanes.getPane(sidePane.paneId)?.close();
//         },
//         { once: true }
//     );
// }
