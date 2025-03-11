import { getSessionRules } from "../../utils/global/DeclarativeNetRequestManager";
import { ActiveUser } from "../../utils/types/ActiveUser";

const prefixId: number = 56850000;

const createImpersonationRule = async (azureObjectId: string, headerItem: string, url: string) => {
    const exitingRules = await getSessionRules() ?? [];

    const rule: chrome.declarativeNetRequest.Rule = {
        id: prefixId + Object.keys(exitingRules).length + 1,
        priority: 1,
        action: {
            type: chrome.declarativeNetRequest.RuleActionType?.MODIFY_HEADERS ?? 'modifyHeaders',
            requestHeaders: [
                {
                    operation: chrome.declarativeNetRequest.HeaderOperation?.SET ?? 'set',
                    header: headerItem,
                    value: azureObjectId
                },
            ]
        },
        condition: {
            urlFilter: url + '/api/*',
        }
    };
    return rule;
}

const updateImpersonationRules = async (azureObjectId: string, headerItem: string, url: string) => {
    const exitingRules = await getSessionRules() ?? [];

    const ruleByUrl = exitingRules.find(rule => rule.condition.urlFilter?.startsWith(url));

    if (!ruleByUrl) {
        const newRule = await createImpersonationRule(azureObjectId, headerItem, url);
        exitingRules.push(newRule);
    }
    else {
        ruleByUrl.action.requestHeaders!.at(0)!.value = azureObjectId;
        ruleByUrl.action.requestHeaders!.at(0)!.header = headerItem;
        ruleByUrl.condition.urlFilter = url + '/api/*';
    }

    return exitingRules;
}

const removeImpersonationRules = async (url: string) => {
    const exitingRules = await getSessionRules();

    const ruleByUrl = exitingRules?.find(rule => rule.condition.urlFilter?.startsWith(url));

    if (ruleByUrl) {
        ruleByUrl.condition.urlFilter = url + "/_RemovedAction_";
    }

    return exitingRules;
}


export async function manageImpersonation(data: { userSelected: ActiveUser, selectedon: Date, url: string, isOnPrem: boolean }, sender: chrome.runtime.MessageSender) {
    let ruleList: chrome.declarativeNetRequest.Rule[];
    if (!data.userSelected) {
        ruleList = await removeImpersonationRules(data.url) ?? [];
    }
    else {
        if (data.isOnPrem) {
            ruleList = await updateImpersonationRules(data.userSelected.systemuserid, "MSCRMCallerId", data.url);
        } else if (data.userSelected.azureObjectId) {
            ruleList = await updateImpersonationRules(data.userSelected.azureObjectId, "CallerObjectId", data.url);
        } else {
            return;
        }
    }

    chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: ruleList?.map(r => r.id), // remove existing rules
        addRules: ruleList
    }).then(() => {
        sender.tab && sender.tab.id && chrome.tabs.reload(sender.tab.id, { bypassCache: true });
    });
}