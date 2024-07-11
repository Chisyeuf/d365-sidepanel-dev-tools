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
import { debugLog, getCurrentDynamics365DateTimeFormat } from "../../global/common";
import EntitySelector from "../EntitySelector";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from "dayjs";

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

    const [filterEntity, setFilterEntity] = useState<string>('');
    const [filterMessageName, setFilterMessageName] = useState<string>('');
    const [filterDateMin, setFilterDateMin] = useState<Dayjs | null>(null);
    const [filterDateMax, setFilterDateMax] = useState<Dayjs | null>(null);
    const [errorOnly, setErrorOnly] = useState<boolean>(false);

    const pluginTraceLogsFiltered = useMemo(() => pluginTraceLogs.filter(log => {
        const textFilterResult = log.primaryentity.includes(filterEntity.toLowerCase()) && log.messagename.toLowerCase().includes(filterMessageName.toLowerCase());
        const dateFilterMin = !filterDateMin || dayjs(log.performanceexecutionstarttime) >= filterDateMin;
        const dateFilterMax = !filterDateMax || dayjs(log.performanceexecutionstarttime) <= filterDateMax;
        if (errorOnly) {
            return log.exceptiondetails && textFilterResult && dateFilterMin && dateFilterMax;
        } else {
            return textFilterResult && dateFilterMin && dateFilterMax;
        }
    }), [pluginTraceLogs, sdkMessageProcessingSteps, filterEntity, filterMessageName, filterDateMin, filterDateMax, errorOnly]);


    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedPluginTraceLog, setSelectedPluginTraceLog] = useState<PluginTraceLog | null>(null);
    const [selectedSdkMessageProcessingStep, setSelectedSdkMessageProcessingStep] = useState<SdkMessageProcessingStep | null>(null);
    const [selectedSdkMessageProcessingStepImages, setSelectedSdkMessageProcessingStepImages] = useState<SdkMessageProcessingStepImage[]>([]);

    const dateTimeFormat = useMemo(() => getCurrentDynamics365DateTimeFormat(), []);

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
                <LocalizationProvider dateAdapter={AdapterDayjs}>
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
                                        setEntityname={setFilterEntity}
                                        entityname={filterEntity}
                                        moreOptions={[{ id: "none", label: "None" }]}
                                    />
                                    <FilterInput fullWidth returnFilterInput={setFilterMessageName} placeholder="Message Name" />
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
                                <Stack direction='row' spacing={0.5}>
                                    <DateTimePicker
                                        label="Minimum DateTime"
                                        ampm={dateTimeFormat.is12hours}
                                        format={dateTimeFormat.ShortDateTimePattern}
                                        onChange={setFilterDateMin}
                                        value={filterDateMin}
                                        sx={{
                                            width: '100%',
                                            '& input': {
                                                padding: '8.5px 0px 8.5px 14px'
                                            },
                                            '& label': {
                                                transform: 'translate(14px, 8px) scale(1)'
                                            }
                                        }}
                                        slotProps={{
                                            field: { clearable: true }
                                        }}
                                    />
                                    <DateTimePicker
                                        label="Maximum DateTime"
                                        ampm={dateTimeFormat.is12hours}
                                        format={dateTimeFormat.ShortDateTimePattern}
                                        onChange={setFilterDateMax}
                                        value={filterDateMax}
                                        sx={{
                                            width: '100%',
                                            '& input': {
                                                padding: '8.5px 0px 8.5px 14px'
                                            },
                                            '& label': {
                                                transform: 'translate(14px, 8px) scale(1)'
                                            }
                                        }}
                                        slotProps={{
                                            field: { clearable: true }
                                        }}
                                    />
                                </Stack>
                                <ButtonLinearProgress loading={isFetching} onClick={refreshPluginTraceLogs} variant='contained'>Refresh ({decount})</ButtonLinearProgress>
                            </Stack>
                            <PluginTraceLogsList pluginTraceLogs={pluginTraceLogsFiltered} isFetching={isFetching || isFetchingFirst} />
                        </Stack>
                        <TraceLogDialog />
                    </TraceLogsAPI.Provider>
                </LocalizationProvider>
            </TraceLogControllerContext.Provider>
        </ThemeProvider>
    )
});

export default PluginTraceLogsPane;