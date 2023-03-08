const rules: chrome.declarativeNetRequest.Rule[] = [
    {
        id: 1,
        priority: 1,
        action: {
            type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
            requestHeaders: [
                {
                    operation: chrome.declarativeNetRequest.HeaderOperation.SET,
                    header: 'CallerObjectId',
                    value: '9657cf37-b711-4d3b-b094-f2d3e43542c5'
                },
            ]
        },
        condition: {
            urlFilter: 'https://*.dynamics.com/api/*/GetClientMetadata*',
            resourceTypes: [chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST]
        }
    },
];

chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: rules.map((rule) => rule.id), // remove existing rules
    // addRules: rules
});