import { ActiveUser } from "../../utils/types/ActiveUser";

interface ruleByEnvironment {
    [url: string]: {
        rule: chrome.declarativeNetRequest.Rule,
        activated: boolean
    }
}

// const rules: ruleByEnvironment = {};

const prefixId: number = 56850000;

const createImpersonationRule = async (azureObjectId: string, url: string) => {
    const exitingRules = await getSessionRules();

    const rule: chrome.declarativeNetRequest.Rule = {
        id: prefixId + Object.keys(exitingRules).length + 1,
        priority: 1,
        action: {
            type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
            requestHeaders: [
                {
                    operation: chrome.declarativeNetRequest.HeaderOperation.SET,
                    header: 'CallerObjectId',
                    value: azureObjectId
                },
            ]
        },
        condition: {
            urlFilter: url + '/api/*',
            // urlFilter: url + '/api/*/GetClientMetadata*',


            // resourceTypes: [chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST]
        }
    };
    // rules[url] = { rule: rule, activated: true };
    return rule;
}

const updateImpersonationRules = async (azureObjectId: string, url: string) => {
    const exitingRules = await getSessionRules();

    const ruleByUrl = exitingRules.find(rule => rule.condition.urlFilter?.startsWith(url));

    if (!ruleByUrl) {
        const newRule = await createImpersonationRule(azureObjectId, url);
        exitingRules.push(newRule);
    }
    else {
        ruleByUrl.action.requestHeaders!.at(0)!.value = azureObjectId;
        ruleByUrl.condition.urlFilter = url + '/api/*';
        // ruleByUrl.condition.urlFilter = url + '/api/*/GetClientMetadata*';
    }

    return exitingRules;
}

const removeImpersonationRules = async (url: string) => {
    const exitingRules = await getSessionRules();

    const ruleByUrl = exitingRules.find(rule => rule.condition.urlFilter?.startsWith(url));

    if (ruleByUrl) {
        ruleByUrl.condition.urlFilter = url + "/_RemovedAction_";
    }

    return exitingRules;
}

export function getSessionRules() {
    return chrome.declarativeNetRequest.getSessionRules();
}


export async function manageImpersonation(data: { userSelected: ActiveUser, selectedon: Date, url: string }, sender: chrome.runtime.MessageSender) {
    let ruleList: chrome.declarativeNetRequest.Rule[];
    if (!data.userSelected) {
        ruleList = await removeImpersonationRules(data.url);
    }
    else {
        ruleList = await updateImpersonationRules(data.userSelected.azureObjectId, data.url);
    }

    // chrome.declarativeNetRequest.updateSessionRules({
    //     removeRuleIds: [...removedRules, ...Object.values(rules).map((rule) => rule.id)], // remove existing rules
    //     addRules: Object.values(rules)
    chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: ruleList?.map(r => r.id), // remove existing rules
        addRules: ruleList
    }).then(() => {
        sender.tab && sender.tab.id && chrome.tabs.reload(sender.tab.id, { bypassCache: true });
        // chrome.tabs.query({ url: `${data.url}/*` }, (tabs) => {
        //     tabs.forEach((tab) => {
        //         tab && tab.id && chrome.tabs.reload(tab.id, { bypassCache: true });
        //     })
        // })
    });
}