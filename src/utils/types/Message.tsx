export enum MessageType {
    IMPERSONATE = 'impersonate',
    GETIMPERSONATION = 'getImpersonation',
    SETCONFIGURATION = 'setConfiguration',
    GETCONFIGURATION = 'getConfiguration',
    ENABLEREQUESTINTERCEPTION = 'EnableRequestInterception',
    DISABLEREQUESTINTERCEPTION = 'DisableRequestInterception',
    REGISTERMESSAGECALLBACK = "RegisterMessageCallback",
    CALLMESSAGECALLBACK = "CallMessageCallback",
}