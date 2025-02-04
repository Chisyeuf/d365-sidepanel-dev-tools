
export type PluginTraceLog = {
    "organizationid": string,
    "requestid": string,
    "operationtype@OData.Community.Display.V1.FormattedValue": string,
    "operationtype": number,
    "primaryentity": string,
    "performanceexecutionduration@OData.Community.Display.V1.FormattedValue": string,
    "performanceexecutionduration": number,
    "correlationid": string,
    "issystemcreated@OData.Community.Display.V1.FormattedValue": string,
    "issystemcreated": true,
    "messageblock": string,
    "messagename": string,
    "performanceconstructorstarttime@OData.Community.Display.V1.FormattedValue": string,
    "performanceconstructorstarttime": string,
    "depth@OData.Community.Display.V1.FormattedValue": string,
    "depth": number,
    "plugintracelogid": string,
    "mode@OData.Community.Display.V1.FormattedValue": string,
    "mode": number,
    "performanceexecutionstarttime@OData.Community.Display.V1.FormattedValue": string,
    "performanceexecutionstarttime": string,
    "exceptiondetails": string,
    "typename": string,
    "pluginstepid": string,
    "persistencekey": string,
    "createdon@OData.Community.Display.V1.FormattedValue": string,
    "createdon": string,
    "performanceconstructorduration@OData.Community.Display.V1.FormattedValue": string,
    "performanceconstructorduration": number,
    "_createdby_value@OData.Community.Display.V1.FormattedValue": string,
    "_createdby_value@Microsoft.Dynamics.CRM.lookuplogicalname": string,
    "_createdby_value": string,
    "secureconfiguration": unknown,
    "_createdonbehalfby_value": unknown,
    "configuration": unknown,
    "profile": unknown,
}

export interface SdkMessageProcessingStep {
    "supporteddeployment@OData.Community.Display.V1.FormattedValue": string,
    "supporteddeployment": number,
    "stage@OData.Community.Display.V1.FormattedValue": string,
    "stage": number,
    "statuscode@OData.Community.Display.V1.FormattedValue": string,
    "statuscode": number,
    "customizationlevel@OData.Community.Display.V1.FormattedValue": string,
    "customizationlevel": number,
    "createdon@OData.Community.Display.V1.FormattedValue": string,
    "createdon": string,
    "configuration"?: string | null,
    "statecode@OData.Community.Display.V1.FormattedValue": string,
    "statecode": number,
    "_sdkmessagefilterid_value@Microsoft.Dynamics.CRM.associatednavigationproperty"?: string | null,
    "_sdkmessagefilterid_value@Microsoft.Dynamics.CRM.lookuplogicalname"?: string | null,
    "_sdkmessagefilterid_value"?: string | null,
    "rank@OData.Community.Display.V1.FormattedValue": string,
    "rank": number,
    "_sdkmessageid_value@OData.Community.Display.V1.FormattedValue": string,
    "_sdkmessageid_value@Microsoft.Dynamics.CRM.associatednavigationproperty": string,
    "_sdkmessageid_value@Microsoft.Dynamics.CRM.lookuplogicalname": string,
    "_sdkmessageid_value": string,
    "asyncautodelete@OData.Community.Display.V1.FormattedValue": string,
    "asyncautodelete": boolean,
    "modifiedon@OData.Community.Display.V1.FormattedValue": string,
    "modifiedon": string,
    "sdkmessageprocessingstepid": string,
    "solutionid": string,
    "ismanaged@OData.Community.Display.V1.FormattedValue": string,
    "ismanaged": boolean,
    "versionnumber@OData.Community.Display.V1.FormattedValue": string,
    "versionnumber": number,
    "name": string,
    "mode@OData.Community.Display.V1.FormattedValue": string,
    "mode": number,
    "introducedversion": string,
    "sdkmessageprocessingstepidunique": string,
    "_modifiedby_value@OData.Community.Display.V1.FormattedValue": string,
    "_modifiedby_value@Microsoft.Dynamics.CRM.lookuplogicalname": string,
    "_modifiedby_value": string,
    "componentstate@OData.Community.Display.V1.FormattedValue": string,
    "componentstate": number,
    "_eventhandler_value@OData.Community.Display.V1.FormattedValue": string,
    "_eventhandler_value@Microsoft.Dynamics.CRM.associatednavigationproperty": string,
    "_eventhandler_value@Microsoft.Dynamics.CRM.lookuplogicalname": string,
    "_eventhandler_value": string,
    "_createdonbehalfby_value@OData.Community.Display.V1.FormattedValue"?: string | null,
    "_createdonbehalfby_value@Microsoft.Dynamics.CRM.lookuplogicalname"?: string | null,
    "_createdonbehalfby_value"?: string | null,
    "_createdby_value@OData.Community.Display.V1.FormattedValue": string,
    "_createdby_value@Microsoft.Dynamics.CRM.lookuplogicalname": string,
    "_createdby_value": string,
    "_organizationid_value@Microsoft.Dynamics.CRM.associatednavigationproperty": string,
    "_organizationid_value@Microsoft.Dynamics.CRM.lookuplogicalname": string,
    "_organizationid_value": string,
    "overwritetime@OData.Community.Display.V1.FormattedValue": string,
    "overwritetime": string,
    "canusereadonlyconnection@OData.Community.Display.V1.FormattedValue": string,
    "canusereadonlyconnection": boolean,
    "enablepluginprofiler"?: boolean | null,
    "_impersonatinguserid_value"?: string | null,
    "_fxexpressionid_value"?: null,
    "_sdkmessageprocessingstepsecureconfigid_value"?: null,
    "eventexpander"?: null,
    "filteringattributes"?: string | null,
    "_modifiedonbehalfby_value"?: string | null,
    "category"?: string | null,
    "runtimeintegrationproperties"?: null,
    "_powerfxruleid_value"?: null,
    "description"?: string | null,
    "ishidden": IshiddenOrIscustomizable,
    "iscustomizable": IshiddenOrIscustomizable,
    "_modifiedonbehalfby_value@OData.Community.Display.V1.FormattedValue"?: string | null,
    "_modifiedonbehalfby_value@Microsoft.Dynamics.CRM.lookuplogicalname"?: string | null,
    "_impersonatinguserid_value@OData.Community.Display.V1.FormattedValue"?: string | null,
    "_impersonatinguserid_value@Microsoft.Dynamics.CRM.lookuplogicalname"?: string | null,
    "enablepluginprofiler@OData.Community.Display.V1.FormattedValue"?: string | null,
}
export interface IshiddenOrIscustomizable {
    Value: boolean;
    CanBeChanged: boolean;
    ManagedPropertyLogicalName: string;
}

export interface SdkMessageProcessingStepImage {
    "overwritetime@OData.Community.Display.V1.FormattedValue": string,
    "overwritetime": string,
    "messagepropertyname": string,
    "_organizationid_value@Microsoft.Dynamics.CRM.associatednavigationproperty": string,
    "_organizationid_value@Microsoft.Dynamics.CRM.lookuplogicalname": string,
    "_organizationid_value": string,
    "solutionid": string,
    "introducedversion": string,
    "_sdkmessageprocessingstepid_value@Microsoft.Dynamics.CRM.associatednavigationproperty": string,
    "_sdkmessageprocessingstepid_value@Microsoft.Dynamics.CRM.lookuplogicalname": string,
    "_sdkmessageprocessingstepid_value": string,
    "customizationlevel@OData.Community.Display.V1.FormattedValue": string,
    "customizationlevel": number,
    "sdkmessageprocessingstepimageidunique": string,
    "ismanaged@OData.Community.Display.V1.FormattedValue": string,
    "ismanaged": boolean,
    "imagetype@OData.Community.Display.V1.FormattedValue": string,
    "imagetype": number,
    "componentstate@OData.Community.Display.V1.FormattedValue": string,
    "componentstate": number,
    "_modifiedby_value@OData.Community.Display.V1.FormattedValue": string,
    "_modifiedby_value@Microsoft.Dynamics.CRM.lookuplogicalname": string,
    "_modifiedby_value": string,
    "sdkmessageprocessingstepimageid": string,
    "createdon@OData.Community.Display.V1.FormattedValue": string,
    "createdon": string,
    "versionnumber@OData.Community.Display.V1.FormattedValue": string,
    "versionnumber": number,
    "modifiedon@OData.Community.Display.V1.FormattedValue": string,
    "modifiedon": string,
    "name": string,
    "_createdby_value@OData.Community.Display.V1.FormattedValue": string,
    "_createdby_value@Microsoft.Dynamics.CRM.lookuplogicalname": string,
    "_createdby_value": string,
    "entityalias": string,
    "_modifiedonbehalfby_value"?: string | null,
    "_createdonbehalfby_value"?: string | null,
    "description"?: null,
    "relatedattributename"?: null,
    "attributes"?: string | null,
    "iscustomizable": Iscustomizable,
    "_modifiedonbehalfby_value@OData.Community.Display.V1.FormattedValue"?: string | null,
    "_modifiedonbehalfby_value@Microsoft.Dynamics.CRM.lookuplogicalname"?: string | null,
    "_createdonbehalfby_value@OData.Community.Display.V1.FormattedValue"?: string | null,
    "_createdonbehalfby_value@Microsoft.Dynamics.CRM.lookuplogicalname"?: string | null,
}
export interface Iscustomizable {
    "Value": boolean;
    "CanBeChanged": boolean;
    "ManagedPropertyLogicalName": string;
}



export enum OperationType {
    PlugIn = 1,
    WorkflowActivity = 2
}


export interface IPluginTraceLogControllerContext {
    detailsDialogOpened: boolean,
    openDialog: (selectedPluginTraceLog: PluginTraceLog, relatedSdkMessageProcessingStep: SdkMessageProcessingStep | null, sdkMessageProcessingStepImages: SdkMessageProcessingStepImage[] | null) => void,
    closeDialog: () => void,
    selectedPluginTraceLog: PluginTraceLog | null,
    selectedSdkMessageProcessingStep: SdkMessageProcessingStep | null,
    selectedSdkMessageProcessingStepImages: SdkMessageProcessingStepImage[]
}


export interface ITraceLogsAPI {
    pluginTraceLogs: PluginTraceLog[],
    isFetchingPluginTraceLogs: boolean,
    refreshPluginTraceLogs: () => void,

    sdkMessageProcessingSteps: { [key: string]: SdkMessageProcessingStep },
    sdkMessageProcessingStepImages: { [key: string]: SdkMessageProcessingStepImage[] },
    isFetchingSteps: boolean,
    addStepToFetchingQueue: (pluginTraceLog: PluginTraceLog) => void
    // addMessageProcessingSteps: (key: string, value: SdkMessageProcessingStep) => void,
    // addMessageProcessingStepImages: (key: string, value: SdkMessageProcessingStepImage[]) => void,
}