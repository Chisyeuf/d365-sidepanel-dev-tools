import React, { useEffect, useState } from "react"
import PluginTraceLogsList from "./subcomponents/PluginTraceLogsList";
import { TraceLogControllerContext, TraceLogsAPI, defaultTraceLogsAPI } from "./subcomponents/contexts";
import TraceLogDialog from "./subcomponents/TraceLogDialog";
import { PluginTraceLog, SdkMessageProcessingStep, SdkMessageProcessingStepImage } from "./type";
import { Fab, Stack, ThemeProvider, createTheme } from "@mui/material";
import { RetrieveAllRecordsByPage } from "../../hooks/XrmApi/RetrieveAllRecordsByPage";
import { RetrieveAllRecords } from "../../hooks/XrmApi/RetrieveAllRecords";
import { RetrieveRecordsByFilter } from "../../hooks/XrmApi/RetrieveRecordsByFilter";
import { RetrieveFirstRecordInterval } from "../../hooks/XrmApi/RetrieveFirstRecordInterval";
import { Button } from "@material-ui/core";

const interval_ms = 60;

const theme = createTheme();

interface PluginTraceLogsPaneProps {

}
const PluginTraceLogsPane = React.memo((props: PluginTraceLogsPaneProps) => {

    const [firstPluginTraceLogs, isFetchingFirst, refreshFirst]: [PluginTraceLog | undefined, boolean, () => void] = RetrieveFirstRecordInterval('plugintracelog', ['plugintracelogid'], '', 'performanceexecutionstarttime desc');
    const [pluginTraceLogs, isFetching, refreshPluginTraceLogs]: [PluginTraceLog[], boolean, () => void] = RetrieveRecordsByFilter('plugintracelog', [], '', 'performanceexecutionstarttime desc');

    const [selectedPluginTraceLog, setSelectedPluginTraceLog] = useState<PluginTraceLog | null>(null);
    const [relatedSdkMessageProcessingStep, setRelatedSdkMessageProcessingStep] = useState<SdkMessageProcessingStep | null>(null);
    const [sdkMessageProcessingStepImages, setSdkMessageProcessingStepImages] = useState<SdkMessageProcessingStepImage[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);


    useEffect(() => {
        const interval = setInterval(() => {
            refreshFirst();
        }, interval_ms * 1000);

        return () => {
            clearInterval(interval);
        }
    }, []);

    useEffect(() => {
        const firstPluginTraceLogsInList = pluginTraceLogs.at(0);
        if (firstPluginTraceLogs && firstPluginTraceLogsInList && firstPluginTraceLogs.plugintracelogid !== firstPluginTraceLogsInList.plugintracelogid) {
            refreshPluginTraceLogs();
        }
    }, [firstPluginTraceLogs, pluginTraceLogs]);

    const handleOpenDialog = (selectedPluginTraceLog: PluginTraceLog, relatedSdkMessageProcessingStep: SdkMessageProcessingStep | null, sdkMessageProcessingStepImages: SdkMessageProcessingStepImage[] | null) => {
        setSelectedPluginTraceLog(selectedPluginTraceLog);
        setRelatedSdkMessageProcessingStep(relatedSdkMessageProcessingStep);
        setSdkMessageProcessingStepImages(sdkMessageProcessingStepImages ?? []);
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
            <TraceLogControllerContext.Provider value={{
                dialogOpened: dialogOpen,
                closeDialog: handleCloseDialog,
                openDialog: handleOpenDialog,
                selectedPluginTraceLog: selectedPluginTraceLog,
                relatedSdkMessageProcessingStep: relatedSdkMessageProcessingStep,
                relatedSdkMessageProcessingStepImages: sdkMessageProcessingStepImages
            }}>
                <TraceLogsAPI.Provider value={{
                    ...defaultTraceLogsAPI,
                    pluginTraceLogs: pluginTraceLogs
                }} >
                    <Stack direction='column' width='100%'>
                        {/* <RefreshButton refresh={refreshFirst} initTimer={interval_ms} /> */}
                        <PluginTraceLogsList pluginTraceLogs={pluginTraceLogs} isFetching={isFetching || isFetchingFirst} />
                    </Stack>
                    <TraceLogDialog />
                </TraceLogsAPI.Provider>
            </TraceLogControllerContext.Provider>
        </ThemeProvider>
    )
});

interface RefreshButtonProps {
    refresh: () => void,
    initTimer: number
}
function RefreshButton(props: RefreshButtonProps) {
    const { initTimer, refresh } = props;

    const [firstTraceDecoy, setFirstTraceDecoy] = useState<number>(initTimer);

    useEffect(() => {
        const interval = setInterval(() => {
            setFirstTraceDecoy(prev => {
                if (prev) {
                    return prev - 1;
                }
                return initTimer;
            });
        }, 1000);

        return () => {
            clearInterval(interval);
        }
    }, [initTimer]);

    return (
        <Button variant='contained' onClick={refresh}>
            Refresh ({firstTraceDecoy})
        </Button>
    );
}

export default PluginTraceLogsPane;