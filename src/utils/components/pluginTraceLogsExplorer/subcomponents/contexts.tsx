import { createContext } from "react";
import { IPluginTraceLogControllerContext, PluginTraceLog } from "../type";

export const PluginTraceLogsContext = createContext<PluginTraceLog[]>([]);

export const defaultPluginTraceLogController: IPluginTraceLogControllerContext = {
    dialogOpened: false,
    openDialog() {},
    closeDialog() {},
    selectedPluginTraceLog: null,
    relatedSdkMessageProcessingStep: null,
    relatedSdkMessageProcessingStepImages: []
};
export const PluginTraceLogControllerContext = createContext<IPluginTraceLogControllerContext>(defaultPluginTraceLogController);