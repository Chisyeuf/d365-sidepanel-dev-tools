export enum MessageType {
    REFRESHBYPASSCACHE = 'RefreshBypassCache',

    IMPERSONATE = 'impersonate',
    GETIMPERSONATION = 'getImpersonation',

    SETCONFIGURATION = 'setConfiguration',
    GETCONFIGURATION = 'getConfiguration',

    ENABLEREQUESTINTERCEPTION = 'EnableRequestInterception',
    DISABLEREQUESTINTERCEPTION = 'DisableRequestInterception',
    GETCURRENTREQUESTINTERCEPTION = 'GetCurrentRequestInterception',
    ISDEBUGGERATTACHED = 'IsDebuggerAttached',

    // REGISTERMESSAGECALLBACK = "RegisterMessageCallback",
    // CALLMESSAGECALLBACK = "CallMessageCallback",
}