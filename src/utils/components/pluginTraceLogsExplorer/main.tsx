import React, { useEffect, useMemo, useState } from "react"
import PluginTraceLogsList from "./subcomponents/PluginTraceLogsList";
import { TraceLogControllerContext, TraceLogsAPI, defaultTraceLogsAPI } from "./subcomponents/contexts";
import TraceLogDialog from "./subcomponents/TraceLogDialog";
import { PluginTraceLog, SdkMessageProcessingStep, SdkMessageProcessingStepImage } from "./type";
import { Checkbox, Stack, ThemeProvider, Tooltip, createTheme } from "@mui/material";
import { RetrieveRecordsByFilter } from "../../hooks/XrmApi/RetrieveRecordsByFilter";
import { RetrieveFirstRecordInterval } from "../../hooks/XrmApi/RetrieveFirstRecordInterval";
import ButtonLinearProgress from "../ButtonLinearProgress";
import { useDictionnary } from "../../hooks/use/useDictionnary";
import FilterInput from "../FilterInput";
import ErrorIcon from '@mui/icons-material/Error';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { debugLog } from "../../global/common";
import EntitySelector from "../EntitySelector";

const refreshInterval = 60;

const theme = createTheme();

interface PluginTraceLogsPaneProps {
    processId: string
    setBadge: (number: number | null) => void
}
const PluginTraceLogsPane = React.memo((props: PluginTraceLogsPaneProps) => {

    const [decount, setDecount] = useState<number>(refreshInterval);
    const [firstPluginTraceLogs, isFetchingFirst, refreshFirst]: [PluginTraceLog | undefined, boolean, () => void] = RetrieveFirstRecordInterval('plugintracelog', ['plugintracelogid'], '', 'performanceexecutionstarttime desc');

    const [pluginTraceLogs, isFetching, refreshPluginTraceLogs]: [PluginTraceLog[], boolean, () => void] = RetrieveRecordsByFilter('plugintracelog', [], '', 'performanceexecutionstarttime desc');
    const { dict: sdkMessageProcessingSteps, setValue: addMessageProcessingSteps } = useDictionnary<SdkMessageProcessingStep>({});
    const { dict: sdkMessageProcessingStepImages, setValue: addMessageProcessingStepImages } = useDictionnary<SdkMessageProcessingStepImage[]>({});

    const [filter, setFilter] = useState<string>('');
    const [errorOnly, setErrorOnly] = useState<boolean>(false);

    const pluginTraceLogsFiltered = useMemo(() => pluginTraceLogs.filter(log => {
        const filterLower = filter.toLowerCase();
        const textFilterResult = log.primaryentity.includes(filterLower);
        if (errorOnly) {
            return log.exceptiondetails && textFilterResult;
        } else {
            return textFilterResult;
        }
    }), [pluginTraceLogs, sdkMessageProcessingSteps, filter, errorOnly]);


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
        props.setBadge(decount);

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
        if (firstPluginTraceLogs && (!firstPluginTraceLogsInList || firstPluginTraceLogs.plugintracelogid !== firstPluginTraceLogsInList.plugintracelogid)) {
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
                    <Stack direction='column' width='100%' height='100%'>
                        <Stack direction='column' padding={1} spacing={0.5}>
                            <Stack direction='row' spacing={0.5}>
                                <EntitySelector
                                    setEntityname={setFilter}
                                    entityname={filter}
                                    moreOptions={[{ id: "none", label: "None" }]}
                                />
                                <Tooltip title='Display only logs in error'>
                                    <Checkbox
                                        checked={errorOnly}
                                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                            setErrorOnly(event.target.checked)
                                        }}
                                        icon={<ErrorOutlineIcon />}
                                        checkedIcon={<ErrorIcon sx={{ color: '#ff3333' }} />}
                                    />
                                </Tooltip>
                            </Stack>
                            <ButtonLinearProgress loading={isFetching} onClick={refreshFirst} variant='contained'>Refresh ({decount})</ButtonLinearProgress>
                        </Stack>
                        <PluginTraceLogsList pluginTraceLogs={pluginTraceLogsFiltered} isFetching={isFetching || isFetchingFirst} />
                    </Stack>
                    <TraceLogDialog />
                </TraceLogsAPI.Provider>
            </TraceLogControllerContext.Provider>
        </ThemeProvider>
    )
});

export default PluginTraceLogsPane;