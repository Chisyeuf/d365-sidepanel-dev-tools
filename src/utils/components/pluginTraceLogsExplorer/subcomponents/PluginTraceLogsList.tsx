import { Box, List, ListItemButton, ListItemText, Typography } from "@mui/material";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { OperationType, PluginTraceLog, SdkMessageProcessingStep, SdkMessageProcessingStepImage } from "../type";
import { TraceLogControllerContext, TraceLogsAPI } from "./contexts";

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import HorizontalSlider from "../../HorizontalSlider";
import dayjs from "dayjs";
import { debugLog, getCurrentDynamics365DateTimeFormat, yieldToMain } from "../../../global/common";
import { VirtuosoHandle } from "react-virtuoso";
import MuiVirtuoso from "../../MuiVirtuoso";


interface LittleListProps {
    pluginTraceLogs: PluginTraceLog[]
    isFetching?: boolean
}
const PluginTraceLogsList = React.memo((props: LittleListProps) => {
    const { pluginTraceLogs, isFetching } = props;

    const [scrollTop, setScrollTop] = useState<number>(0);
    const ref = useRef<VirtuosoHandle>(null);

    return (
        <>
            <List
                dense
                sx={{ height: '100%', width: '100%', bgcolor: 'background.paper', whiteSpace: 'nowrap' }}
                key={`List-pluginTraceLogs`}
            >
                <MuiVirtuoso
                    ref={ref}
                    onScroll={(e) => setScrollTop((e.target as HTMLElement).scrollTop)}
                    data={pluginTraceLogs}
                    itemContent={(index, pluginTraceLog) => {
                        return <TraceLogsListItem pluginTraceLog={pluginTraceLog} />
                    }}
                />
            </List>
        </>
    );
});



interface LittleListItemProps {
    pluginTraceLog: PluginTraceLog,
    // boxStyle?: React.CSSProperties
}
function TraceLogsListItem(props: LittleListItemProps) {
    const { pluginTraceLog } = props;

    const { selectedPluginTraceLog } = useContext(TraceLogControllerContext);


    const bgcolor = useMemo(() => {
        if (selectedPluginTraceLog?.plugintracelogid === pluginTraceLog.plugintracelogid) {
            return 'grey.300';
        }
        else {
            return 'background.paper';
        }
    }, [pluginTraceLog.plugintracelogid, selectedPluginTraceLog?.plugintracelogid]);

    const content = useMemo(() => {
        switch (pluginTraceLog.operationtype) {
            case OperationType.PlugIn:
                return (
                    <PluginTraceLogsListItem {...props} />
                );
            default:
                return (
                    <WorkflowActivityTraceLogsListItem {...props} />
                );
        }
    }, [pluginTraceLog]);

    return (
        <ListItemButton
            alignItems="flex-start"
            key={`ListItemButton-${pluginTraceLog.plugintracelogid}`}
            sx={{ alignItems: 'center', bgcolor: bgcolor }}
        >
            <HorizontalSlider>
                {content}
            </HorizontalSlider>
        </ListItemButton>
    );
}

const fetchDataSteps = async (pluginTraceLog: PluginTraceLog, addMessageProcessingSteps: (key: string, value: SdkMessageProcessingStep) => void, setIsFetchingStep: (value: React.SetStateAction<boolean>) => void) => {
    debugLog("RetrievePluginSteps");
    const result = await Xrm.WebApi.online.retrieveRecord('sdkmessageprocessingstep', pluginTraceLog.pluginstepid, "?$select=" + ['stage', 'name', 'filteringattributes'].join(','));
    delete result["@odata.context"];
    delete result["@odata.etag"];
    // await yieldToMain();
    addMessageProcessingSteps(pluginTraceLog.plugintracelogid, result);
    setIsFetchingStep(false);
}

const fetchDataImages = async (pluginTraceLog: PluginTraceLog, addMessageProcessingStepImages: (key: string, value: SdkMessageProcessingStepImage[]) => void, setIsFetchingImages: (value: React.SetStateAction<boolean>) => void) => {
    debugLog("RetrievePluginImages");
    const result = await Xrm.WebApi.online.retrieveMultipleRecords('sdkmessageprocessingstepimage', `?$select=${['entityalias', 'imagetype', 'attributes'].join(',')}&$filter=_sdkmessageprocessingstepid_value eq ${pluginTraceLog.pluginstepid}`);
    // await yieldToMain();
    addMessageProcessingStepImages(pluginTraceLog.plugintracelogid, result.entities);
    setIsFetchingImages(false);
}

function PluginTraceLogsListItem(props: LittleListItemProps) {
    const { pluginTraceLog } = props;

    const { openDialog } = useContext(TraceLogControllerContext);
    const { sdkMessageProcessingSteps: sdkMessageProcessingStepsStore, addMessageProcessingSteps, sdkMessageProcessingStepImages: sdkMessageProcessingStepImagesStore, addMessageProcessingStepImages } = useContext(TraceLogsAPI);

    const [isFetchingStep, setIsFetchingStep] = useState<boolean>(false);
    const [isFetchingImages, setIsFetchingImages] = useState<boolean>(false);

    const sdkMessageProcessingStep: SdkMessageProcessingStep | null = useMemo(() => sdkMessageProcessingStepsStore[pluginTraceLog.plugintracelogid] ?? null, [sdkMessageProcessingStepsStore[pluginTraceLog.plugintracelogid]]);

    const sdkMessageProcessingStepImages: SdkMessageProcessingStepImage[] | null = useMemo(() => sdkMessageProcessingStepImagesStore[pluginTraceLog.plugintracelogid] ?? null, [sdkMessageProcessingStepImagesStore[pluginTraceLog.plugintracelogid]]);

    useEffect(() => {
        if (!sdkMessageProcessingStep) {
            // const fetchData = async () => {
            //     const result = await Xrm.WebApi.online.retrieveRecord('sdkmessageprocessingstep', pluginTraceLog.pluginstepid, "?$select=" + ['stage', 'name', 'filteringattributes'].join(','));
            //     delete result["@odata.context"];
            //     delete result["@odata.etag"];
            //     await yieldToMain();
            //     addMessageProcessingSteps(pluginTraceLog.plugintracelogid, result);
            //     setIsFetchingStep(false);
            // }
            fetchDataSteps(pluginTraceLog, addMessageProcessingSteps, setIsFetchingStep);
            setIsFetchingStep(true);
        }
    }, [sdkMessageProcessingStep?.sdkmessageprocessingstepid]);

    useEffect(() => {
        if (!sdkMessageProcessingStepImages) {
            // const fetchData = async () => {
            //     const result = await Xrm.WebApi.online.retrieveMultipleRecords('sdkmessageprocessingstepimage', `?$select=${['entityalias', 'imagetype', 'attributes'].join(',')}&$filter=_sdkmessageprocessingstepid_value eq ${pluginTraceLog.pluginstepid}`);
            //     await yieldToMain();
            //     addMessageProcessingStepImages(pluginTraceLog.plugintracelogid, result.entities);
            //     setIsFetchingImages(false);
            // }
            fetchDataImages(pluginTraceLog, addMessageProcessingStepImages, setIsFetchingImages);
            setIsFetchingImages(true);
        }
    }, [sdkMessageProcessingStepImages]);

    const isFetching = useMemo(() => (isFetchingStep || isFetchingImages), [isFetchingStep, isFetchingImages]);
    const dateTimeFormat = useMemo(() => getCurrentDynamics365DateTimeFormat(), []);

    return (
        <Box
            key={`ListItemBox-${pluginTraceLog.plugintracelogid}`}
            sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                width: 'fit-content',
                minWidth: '100%'
            }}
            onClick={() => openDialog(pluginTraceLog, sdkMessageProcessingStep, sdkMessageProcessingStepImages)}
        >
            <ListItemText
                key={`ListItemText-${pluginTraceLog.plugintracelogid}`}
                primary={
                    <>
                        <Box maxWidth='250px' overflow='hidden' textOverflow='ellipsis'>
                            <Typography
                                sx={{ display: 'inline', fontWeight: 'bold' }}
                                component="span"
                                variant="button"
                                color="text.primary"
                                lineHeight={0}
                            >
                                {pluginTraceLog.messagename}
                            </Typography>
                            <Typography
                                sx={{ display: 'inline', pl: 1 }}
                                component="span"
                                variant="body2"
                                color="text.primary"
                            >
                                {pluginTraceLog["mode@OData.Community.Display.V1.FormattedValue"]}
                            </Typography>
                        </Box>
                        <Typography
                            sx={{ display: 'inline', fontWeight: 'bold' }}
                            component="span"
                            variant="body1"
                            color="text.primary"
                            fontSize='1em'
                        >
                            {pluginTraceLog.primaryentity}
                        </Typography>
                        {` — ${isFetching || !sdkMessageProcessingStep ? 'Loading...' : sdkMessageProcessingStep["stage@OData.Community.Display.V1.FormattedValue"]}`}
                        <Typography
                            component="p"
                            variant="caption"
                            color="text.primary"
                            whiteSpace='nowrap'
                        >
                            {`${isFetching || !sdkMessageProcessingStep ? 'Loading...' : sdkMessageProcessingStep.name}`}
                        </Typography>
                    </>
                }
                secondary={
                    <>
                        {`${dayjs(pluginTraceLog.performanceexecutionstarttime).format(dateTimeFormat.FullDateTimePattern)} — `}
                        {/* {`${dayjs(pluginTraceLog.performanceexecutionstarttime).format('YYYY/MM/DD HH:mm:ss.SSS')} — `} */}
                        <Typography
                            sx={{ display: 'inline' }}
                            component="span"
                            variant="body1"
                            color="text.primary"
                            fontSize='1em'
                        >
                            {`Depth: ${pluginTraceLog['depth@OData.Community.Display.V1.FormattedValue']}`}
                        </Typography>
                    </>
                }
            />
            <ErrorOutlineIcon sx={{ color: '#ff3333', visibility: pluginTraceLog.exceptiondetails ? 'visible' : 'hidden', mb: '10%', width: '1.25em', position: 'fixed', right: 2 }} />
        </Box >
    );
}

function WorkflowActivityTraceLogsListItem(props: LittleListItemProps) {
    const { pluginTraceLog } = props;

    const { openDialog } = useContext(TraceLogControllerContext);
    const dateTimeFormat = useMemo(() => getCurrentDynamics365DateTimeFormat(), []);

    return (
        <Box
            key={`ListItemBox-${pluginTraceLog.plugintracelogid}`}
            sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                width: 'fit-content',
                minWidth: '100%'
            }}
            onClick={() => openDialog(pluginTraceLog, null, null)}
        >
            <ListItemText
                key={`ListItemText-${pluginTraceLog.plugintracelogid}`}
                primary={
                    <>
                        <Box maxWidth='250px' overflow='hidden' textOverflow='ellipsis'>
                            <Typography
                                sx={{ display: 'inline', fontWeight: 'bold' }}
                                component="span"
                                variant="button"
                                color="text.primary"
                                lineHeight={0}
                            >
                                {pluginTraceLog.messagename}
                            </Typography>
                        </Box>
                        <Typography
                            sx={{ display: 'inline', fontWeight: 'bold' }}
                            component="span"
                            variant="body1"
                            color="text.primary"
                            fontSize='1em'
                        >
                            {pluginTraceLog.primaryentity}
                        </Typography>
                        {` — ${pluginTraceLog["mode@OData.Community.Display.V1.FormattedValue"]}`}
                        <Typography
                            component="p"
                            variant="caption"
                            color="text.primary"
                            whiteSpace='nowrap'
                        >
                            {`${pluginTraceLog["operationtype@OData.Community.Display.V1.FormattedValue"]}`}
                        </Typography>
                    </>
                }
                secondary={
                    <>
                        {`${dayjs(pluginTraceLog.performanceexecutionstarttime).format(dateTimeFormat.FullDateTimePattern)} — `}
                        <Typography
                            sx={{ display: 'inline' }}
                            component="span"
                            variant="body1"
                            color="text.primary"
                            fontSize='1em'
                        >
                            {`Depth: ${pluginTraceLog['depth@OData.Community.Display.V1.FormattedValue']}`}
                        </Typography>
                    </>
                }
            />
            <ErrorOutlineIcon sx={{ color: '#ff3333', visibility: pluginTraceLog.exceptiondetails ? 'visible' : 'hidden', mb: '10%', width: '1.25em', position: 'fixed', right: 2 }} />
        </Box>
    );
}



export default PluginTraceLogsList;