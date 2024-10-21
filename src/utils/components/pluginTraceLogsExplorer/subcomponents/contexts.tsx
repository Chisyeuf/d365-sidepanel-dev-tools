import { createContext } from "react";
import { IPluginTraceLogControllerContext, ITraceLogsAPI, PluginTraceLog, SdkMessageProcessingStep, SdkMessageProcessingStepImage } from "../type";

const defaultPluginTraceLogController: IPluginTraceLogControllerContext = {
    dialogOpened: false,
    openDialog() { },
    closeDialog() { },
    selectedPluginTraceLog: null,
    selectedSdkMessageProcessingStep: null,
    selectedSdkMessageProcessingStepImages: []
};
export const TraceLogControllerContext = createContext<IPluginTraceLogControllerContext>(defaultPluginTraceLogController);

export const defaultTraceLogsAPI: ITraceLogsAPI = {
    pluginTraceLogs: [],
    sdkMessageProcessingStepImages: {},
    sdkMessageProcessingSteps: {},
    addMessageProcessingSteps: function (key: string, value: SdkMessageProcessingStep): void {
        throw new Error("Function not implemented.");
    },
    addMessageProcessingStepImages: function (key: string, value: SdkMessageProcessingStepImage[]): void {
        throw new Error("Function not implemented.");
    }
}
export const TraceLogsAPI = createContext<ITraceLogsAPI>(defaultTraceLogsAPI);