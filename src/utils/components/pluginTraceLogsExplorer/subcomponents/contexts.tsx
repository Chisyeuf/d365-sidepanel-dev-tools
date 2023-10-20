import { createContext } from "react";
import { IPluginTraceLogControllerContext, ITraceLogsAPI, PluginTraceLog } from "../type";

// export const TraceLogsContext = createContext<PluginTraceLog[]>([]);

const defaultPluginTraceLogController: IPluginTraceLogControllerContext = {
    dialogOpened: false,
    openDialog() { },
    closeDialog() { },
    selectedPluginTraceLog: null,
    relatedSdkMessageProcessingStep: null,
    relatedSdkMessageProcessingStepImages: []
};
export const TraceLogControllerContext = createContext<IPluginTraceLogControllerContext>(defaultPluginTraceLogController);

export const defaultTraceLogsAPI: ITraceLogsAPI = {
    pluginTraceLogs: [],
    sdkMessageProcessingStepImages: [],
    sdkMessageProcessingSteps: [],
}
export const TraceLogsAPI = createContext<ITraceLogsAPI>(defaultTraceLogsAPI);