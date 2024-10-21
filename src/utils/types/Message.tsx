export enum MessageType {
    REFRESHBYPASSCACHE = 'RefreshBypassCache',

    IMPERSONATE = 'impersonate',
    GETIMPERSONATION = 'getImpersonation',

    SETCONFIGURATION = 'setConfiguration',
    GETCONFIGURATION = 'getConfiguration',

    ENABLESCRIPTOVERRIDING = 'EnableScriptOverriding',
    DISABLESCRIPTOVERRIDING = 'DisableScriptOverriding',
    GETCURRENTSCRIPTOVERRIDING = 'GetCurrentScriptOverriding',
    ISDEBUGGERATTACHED = 'IsDebuggerAttached',

    OPENOPTIONS = 'OpenOptions',
}