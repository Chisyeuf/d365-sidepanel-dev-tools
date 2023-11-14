import React, { useEffect, useState } from "react"
import PluginTraceLogsList from "./subcomponents/PluginTraceLogsList";
import { TraceLogControllerContext, TraceLogsAPI, defaultTraceLogsAPI } from "./subcomponents/contexts";
import TraceLogDialog from "./subcomponents/TraceLogDialog";
import { PluginTraceLog, SdkMessageProcessingStep, SdkMessageProcessingStepImage } from "./type";
import { LinearProgress, Stack, ThemeProvider, createTheme } from "@mui/material";
import { RetrieveRecordsByFilter } from "../../hooks/XrmApi/RetrieveRecordsByFilter";
import { RetrieveFirstRecordInterval } from "../../hooks/XrmApi/RetrieveFirstRecordInterval";
import { Button } from "@material-ui/core";

const refreshInterval = 60;

const theme = createTheme();

interface PluginTraceLogsPaneProps {
    processId: string
}
const PluginTraceLogsPane = React.memo((props: PluginTraceLogsPaneProps) => {

    const [decount, setDecount] = useState<number>(refreshInterval);

    const [firstPluginTraceLogs, isFetchingFirst, refreshFirst]: [PluginTraceLog | undefined, boolean, () => void] = RetrieveFirstRecordInterval('plugintracelog', ['plugintracelogid'], '', 'performanceexecutionstarttime desc');
    const [pluginTraceLogs, isFetching, refreshPluginTraceLogs]: [PluginTraceLog[], boolean, () => void] = RetrieveRecordsByFilter('plugintracelog', [], '', 'performanceexecutionstarttime desc');

    const [selectedPluginTraceLog, setSelectedPluginTraceLog] = useState<PluginTraceLog | null>(null);
    const [relatedSdkMessageProcessingStep, setRelatedSdkMessageProcessingStep] = useState<SdkMessageProcessingStep | null>(null);
    const [sdkMessageProcessingStepImages, setSdkMessageProcessingStepImages] = useState<SdkMessageProcessingStepImage[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        const intervalID = setInterval(function () {
            setDecount(prev => {
                const newValue = --prev;
                return newValue;
            })
        }, 1000);

        return () => {
            window.clearInterval(intervalID);
        }
    }, []);

    useEffect(() => {
        const pane: any = Xrm.App.sidePanes.getPane(props.processId);
        if (pane) pane.badge = decount > 0 ? decount : 0;

        if (decount === 0) {
            refreshFirst();
        }
    }, [decount]);

    useEffect(() => {
        if (isFetching) return;
        setDecount(refreshInterval);
    }, [isFetching, isFetchingFirst]);

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
                        <RefreshButton refresh={refreshFirst} time={decount} />
                        {isFetching && <LinearProgress />}
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
    time: number
}
function RefreshButton(props: RefreshButtonProps) {
    const { time, refresh } = props;

    return (
        <Button variant='contained' onClick={refresh}>
            Refresh ({time})
        </Button>
    );
}

export default PluginTraceLogsPane;