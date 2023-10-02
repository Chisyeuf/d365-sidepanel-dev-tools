import React, { useState } from "react"
import PluginTraceLogsList from "./subcomponents/PluginTraceLogsList";
import { PluginTraceLogControllerContext, PluginTraceLogsContext } from "./subcomponents/contexts";
import TraceLogDialog from "./subcomponents/TraceLogDialog";
import { PluginTraceLog, SdkMessageProcessingStep, SdkMessageProcessingStepImage } from "./type";
import { ThemeProvider, createTheme } from "@mui/material";
import { RetrieveAllRecordsByPage } from "../../hooks/XrmApi/RetrieveAllRecordsByPage";
import { RetrieveAllRecords } from "../../hooks/XrmApi/RetrieveAllRecords";
import { RetrieveRecords } from "../../hooks/XrmApi/RetrieveRecords";

const theme = createTheme();

interface PluginTraceLogsPaneProps {

}
const PluginTraceLogsPane = React.memo((props: PluginTraceLogsPaneProps) => {

    const [pluginTraceLogs, isFetching]: [PluginTraceLog[], boolean] = RetrieveRecords('plugintracelog', [], '', 'performanceexecutionstarttime desc');

    const [selectedPluginTraceLog, setSelectedPluginTraceLog] = useState<PluginTraceLog | null>(null);
    const [relatedSdkMessageProcessingStep, setRelatedSdkMessageProcessingStep] = useState<SdkMessageProcessingStep | null>(null);
    const [sdkMessageProcessingStepImages, setSdkMessageProcessingStepImages] = useState<SdkMessageProcessingStepImage[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleOpenDialog = (selectedPluginTraceLog: PluginTraceLog, relatedSdkMessageProcessingStep: SdkMessageProcessingStep, sdkMessageProcessingStepImages: SdkMessageProcessingStepImage[]) => {
        setSelectedPluginTraceLog(selectedPluginTraceLog);
        setRelatedSdkMessageProcessingStep(relatedSdkMessageProcessingStep);
        setSdkMessageProcessingStepImages(sdkMessageProcessingStepImages);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedPluginTraceLog(null);
        setRelatedSdkMessageProcessingStep(null);
        setSdkMessageProcessingStepImages([]);
    };

    return (
        <ThemeProvider theme={theme}>
            <PluginTraceLogControllerContext.Provider value={{
                dialogOpened: dialogOpen,
                closeDialog: handleCloseDialog,
                openDialog: handleOpenDialog,
                selectedPluginTraceLog: selectedPluginTraceLog,
                relatedSdkMessageProcessingStep: relatedSdkMessageProcessingStep,
                relatedSdkMessageProcessingStepImages: sdkMessageProcessingStepImages
            }}>
                <PluginTraceLogsContext.Provider value={pluginTraceLogs} >
                    <PluginTraceLogsList pluginTraceLogs={pluginTraceLogs} />
                    <TraceLogDialog />
                </PluginTraceLogsContext.Provider>
            </PluginTraceLogControllerContext.Provider>
        </ThemeProvider>
    )
});

export default PluginTraceLogsPane;