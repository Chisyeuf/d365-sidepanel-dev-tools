import { ActiveUser } from "../../utils/types/ActiveUser";

interface ruleByEnvironment {
    [url: string]: {
        rule: chrome.declarativeNetRequest.Rule,
        activated: boolean
    }
}

const rules: ruleByEnvironment = {};

const prefixId: number = 56850000;

const createImpersonationRule = (azureObjectId: string, url: string) => {
    const rule: chrome.declarativeNetRequest.Rule = {
        id: prefixId + Object.keys(rules).length + 1,
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
            urlFilter: url + '/api/*/GetClientMetadata*',
            // resourceTypes: [chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST]
        }
    };
    rules[url] = { rule: rule, activated: true };
    return rules;
}

const updateImpersonationRules = (azureObjectId: string, url: string) => {
    if (!rules[url]) {
        createImpersonationRule(azureObjectId, url);
    }
    else {
        rules[url].rule.action.requestHeaders!.at(0)!.value = azureObjectId;
        rules[url].activated = true;
    }
}

const removeImpersonationRules = (url: string) => {
    if (rules[url]) {
        // removedRules.push(rules[url].rule.id);
        // delete rules[url];
        rules[url].activated = false;
    }

}

export function getSessionRules() {
    return chrome.declarativeNetRequest.getSessionRules();
}


export function manageImpersonation(data: { userSelected: ActiveUser, selectedon: Date, url: string }, sender: chrome.runtime.MessageSender) {
    if (!data.userSelected) {
        removeImpersonationRules(data.url);
    }
    else {
        updateImpersonationRules(data.userSelected.azureObjectId, data.url);
    }


    // chrome.declarativeNetRequest.updateSessionRules({
    //     removeRuleIds: [...removedRules, ...Object.values(rules).map((rule) => rule.id)], // remove existing rules
    //     addRules: Object.values(rules)
    chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: Object.values(rules)?.map(r => r.rule.id), // remove existing rules
        addRules: Object.values(rules).filter(r => r.activated)?.map(r => r.rule)
    }).then(() => {
        sender.tab && sender.tab.id && chrome.tabs.reload(sender.tab.id, { bypassCache: true });
        // chrome.tabs.query({ url: `${data.url}/*` }, (tabs) => {
        //     tabs.forEach((tab) => {
        //         tab && tab.id && chrome.tabs.reload(tab.id, { bypassCache: true });
        //     })
        // })
    });
}