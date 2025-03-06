import React, { useContext, useEffect, useMemo, useState } from "react"
import PluginTraceLogsList from "./subcomponents/PluginTraceLogsList";
import { TraceLogsAPIContext } from "./subcomponents/contexts";
import TraceLogDialog from "./subcomponents/TraceLogDialog";
import { PluginTraceLog } from "./type";
import { Checkbox, Stack, SxProps, Theme, ThemeProvider, Tooltip, Typography, createTheme } from "@mui/material";
import { RetrieveFirstRecordInterval } from "../../hooks/XrmApi/RetrieveFirstRecordInterval";
import ButtonLinearProgress from "../ButtonLinearProgress";
import FilterInput from "../FilterInput";
import ErrorIcon from '@mui/icons-material/Error';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { getCurrentDynamics365DateTimeFormat } from "../../global/common";
import EntitySelector from "../EntitySelector";
import { DateTimePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";

const refreshInterval = 60;

const theme = createTheme();

const DateTimeSx: SxProps<Theme> = {
    width: '100%',
    '& input': {
        padding: '8.5px 0px 8.5px 14px'
    },
    '& label:not(.Mui-focused)': {
        transform: 'translate(14px, 8px) scale(1)'
    }
}

const OPTION_NONE = [{ id: "none", label: "None" }];

interface PluginTraceLogsPaneProps {
    processId: string
    setBadge: (number: number | null) => void
}
const PluginTraceLogsPane = React.memo((props: PluginTraceLogsPaneProps) => {
    const { setBadge } = props;

    const [decount, setDecount] = useState<number>(refreshInterval);
    const [firstPluginTraceLogs, isFetchingFirst, refreshFirst]: [PluginTraceLog | undefined, boolean, () => void] = RetrieveFirstRecordInterval('plugintracelog', ['plugintracelogid'], '', 'performanceexecutionstarttime desc');

    const { pluginTraceLogs, isFetchingPluginTraceLogs, refreshPluginTraceLogs } = useContext(TraceLogsAPIContext);

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
    }), [pluginTraceLogs, filterEntity, filterMessageName, filterDateMin, filterDateMax, errorOnly]);

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
        setBadge(decount);

        if (decount <= 0) {
            refreshFirst();
        }
    }, [decount, refreshFirst, setBadge]);

    useEffect(() => {
        if (isFetchingPluginTraceLogs) return;
        setDecount(refreshInterval);
    }, [isFetchingPluginTraceLogs, isFetchingFirst]);

    useEffect(() => {
        const firstPluginTraceLogsInList = pluginTraceLogs.at(0);
        if (firstPluginTraceLogs && (!firstPluginTraceLogsInList || firstPluginTraceLogs.plugintracelogid !== firstPluginTraceLogsInList.plugintracelogid)) {
            refreshPluginTraceLogs();
        }
    }, [firstPluginTraceLogs, pluginTraceLogs, refreshPluginTraceLogs]);


    return (
        <ThemeProvider theme={theme}>
            <Stack direction='column' width='100%' height='100%'>
                <Stack direction='column' padding={1} spacing={0.5}>
                    <Stack direction='row' spacing={0.5}>
                        <EntitySelector
                            key={'plugintracelogsAutocomplete'}
                            setEntityname={setFilterEntity}
                            entityname={filterEntity}
                            fullWidth
                            moreOptions={OPTION_NONE}
                        />
                        <FilterInput fullWidth returnFilterInput={setFilterMessageName} placeholder="Message Name" />
                        <Tooltip title={<Typography variant='body2'>Display only logs with errors</Typography>} placement='top-end' disableInteractive arrow >
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
                            sx={DateTimeSx}
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
                            sx={DateTimeSx}
                            slotProps={{
                                field: { clearable: true }
                            }}
                        />
                    </Stack>
                    <ButtonLinearProgress loading={isFetchingPluginTraceLogs} onClick={refreshPluginTraceLogs} variant='contained'>Refresh ({decount})</ButtonLinearProgress>
                </Stack>
                <PluginTraceLogsList pluginTraceLogs={pluginTraceLogsFiltered} isFetching={isFetchingPluginTraceLogs || isFetchingFirst} />
            </Stack>
            <TraceLogDialog />
        </ThemeProvider>
    )
});

export default PluginTraceLogsPane;