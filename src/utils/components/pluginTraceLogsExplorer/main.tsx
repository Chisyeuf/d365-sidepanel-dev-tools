import React, { useEffect, useState } from "react"
import PluginTraceLogsList from "./subcomponents/PluginTraceLogsList";
import { TraceLogControllerContext, TraceLogsAPI, defaultTraceLogsAPI } from "./subcomponents/contexts";
import TraceLogDialog from "./subcomponents/TraceLogDialog";
import { PluginTraceLog, SdkMessageProcessingStep, SdkMessageProcessingStepImage } from "./type";
import { Stack, ThemeProvider, createTheme } from "@mui/material";
import { RetrieveRecordsByFilter } from "../../hooks/XrmApi/RetrieveRecordsByFilter";
import { RetrieveFirstRecordInterval } from "../../hooks/XrmApi/RetrieveFirstRecordInterval";
import ButtonLinearProgress from "../ButtonLinearProgress";
import { useDictionnary } from "../../hooks/use/useDictionnary";

const refreshInterval = 60;

const theme = createTheme();

interface PluginTraceLogsPaneProps {
    processId: string
}
const PluginTraceLogsPane = React.memo((props: PluginTraceLogsPaneProps) => {

    const [decount, setDecount] = useState<number>(refreshInterval);
    const [firstPluginTraceLogs, isFetchingFirst, refreshFirst]: [PluginTraceLog | undefined, boolean, () => void] = RetrieveFirstRecordInterval('plugintracelog', ['plugintracelogid'], '', 'performanceexecutionstarttime desc');

    const [pluginTraceLogs, isFetching, refreshPluginTraceLogs]: [PluginTraceLog[], boolean, () => void] = RetrieveRecordsByFilter('plugintracelog', [], '', 'performanceexecutionstarttime desc');
    const { values: sdkMessageProcessingSteps, setValue: addMessageProcessingSteps } = useDictionnary<SdkMessageProcessingStep>({});
    const { values: sdkMessageProcessingStepImages, setValue: addMessageProcessingStepImages } = useDictionnary<SdkMessageProcessingStepImage>({});


    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedPluginTraceLog, setSelectedPluginTraceLog] = useState<PluginTraceLog | null>(null);
    const [selectedSdkMessageProcessingStep, setSelectedSdkMessageProcessingStep] = useState<SdkMessageProcessingStep | null>(null);
    const [selectedSdkMessageProcessingStepImages, setSelectedSdkMessageProcessingStepImages] = useState<SdkMessageProcessingStepImage[]>([]);


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
        setSelectedSdkMessageProcessingStep(relatedSdkMessageProcessingStep);
        setSelectedSdkMessageProcessingStepImages(sdkMessageProcessingStepImages ?? []);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedPluginTraceLog(null);
        setSelectedSdkMessageProcessingStep(null);
        setSelectedSdkMessageProcessingStepImages([]);
    };

    return (
        <ThemeProvider theme={theme}>
            <TraceLogControllerContext.Provider value={{
                dialogOpened: dialogOpen,
                closeDialog: handleCloseDialog,
                openDialog: handleOpenDialog,
                selectedPluginTraceLog: selectedPluginTraceLog,
                selectedSdkMessageProcessingStep: selectedSdkMessageProcessingStep,
                selectedSdkMessageProcessingStepImages: selectedSdkMessageProcessingStepImages
            }}>
                <TraceLogsAPI.Provider value={{
                    ...defaultTraceLogsAPI,
                    pluginTraceLogs: pluginTraceLogs,
                    sdkMessageProcessingSteps: sdkMessageProcessingSteps,
                    sdkMessageProcessingStepImages: sdkMessageProcessingStepImages,
                    addMessageProcessingSteps: addMessageProcessingSteps,
                    addMessageProcessingStepImages: addMessageProcessingStepImages,
                }} >
                    <Stack direction='column' width='100%'>
                        {/* <RefreshButton refresh={refreshFirst} time={decount} />
                        {isFetching && <LinearProgress />} */}
                        <ButtonLinearProgress loading={isFetching} onClick={refreshFirst} variant='contained'>Refresh ({decount})</ButtonLinearProgress>
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
        <ButtonLinearProgress variant='contained' onClick={refresh}>
            Refresh ({time})
        </ButtonLinearProgress>
    );
}

export default PluginTraceLogsPane;