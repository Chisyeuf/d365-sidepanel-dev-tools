
export const DECLARATIVE_NET_REQUEST_PREFIX_ID: number = 56850000;

export function getSessionRules(): Promise<chrome.declarativeNetRequest.Rule[] | null> {
    return chrome.declarativeNetRequest.getSessionRules();
}


// export async function manageImpersonation(data: { userSelected: ActiveUser, selectedon: Date, url: string, isOnPrem: boolean }, sender: chrome.runtime.MessageSender) {
//     let ruleList: chrome.declarativeNetRequest.Rule[];
//     if (!data.userSelected) {
//         ruleList = await removeImpersonationRules(data.url) ?? [];
//     }
//     else {
//         if (data.isOnPrem) {
//             ruleList = await updateImpersonationRules(data.userSelected.systemuserid, "MSCRMCallerId", data.url);
//         } else if (data.userSelected.azureObjectId) {
//             ruleList = await updateImpersonationRules(data.userSelected.azureObjectId, "CallerObjectId", data.url);
//         } else {
//             return;
//         }
//     }

//     chrome.declarativeNetRequest.updateSessionRules({
//         removeRuleIds: ruleList?.map(r => r.id), // remove existing rules
//         addRules: ruleList
//     }).then(() => {
//         sender.tab && sender.tab.id && chrome.tabs.reload(sender.tab.id, { bypassCache: true });
//     });
// }