import { Box, Fab, List, ListItemButton, ListItemText, Tooltip, Typography } from "@mui/material";
import React, { ComponentType, useContext, useEffect, useMemo, useRef, useState } from "react";
import { OperationType, PluginTraceLog, SdkMessageProcessingStep, SdkMessageProcessingStepImage } from "../type";
import { TraceLogControllerContext, TraceLogsAPI } from "./contexts";

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import moment from "moment";

import UpIcon from '@mui/icons-material/KeyboardArrowUp';

import { FixedSizeList as _FixedSizeList, areEqual, FixedSizeListProps } from 'react-window';
import AutoSizer from "react-virtualized-auto-sizer";
import { debugLog } from "../../../global/common";
import HorizontalSlider from "../../HorizontalSlider";

const FixedSizeList = _FixedSizeList as ComponentType<FixedSizeListProps>;

const Row = React.memo(({ data, index, style }: { data: any, index: number, style: React.CSSProperties }) => {
    const pluginTraceLogs = data;
    return (
        <TraceLogsListItem pluginTraceLog={pluginTraceLogs[index]} boxStyle={style} />
    );
}, areEqual);

// const createItemData = memoize((items, toggleItemActive) => ({
//     items,
//     toggleItemActive,
//   }));

interface LittleListProps {
    pluginTraceLogs: PluginTraceLog[]
    isFetching?: boolean
}
const PluginTraceLogsList = React.memo((props: LittleListProps) => {
    const { pluginTraceLogs, isFetching } = props;

    const listRef = useRef<HTMLUListElement | null>(null);


    return (
        <>
            <List
                dense
                sx={{ height: '100%', width: '100%', bgcolor: 'background.paper', whiteSpace: 'nowrap' }}
                key={`List-pluginTraceLogs`}
            >
                <AutoSizer>
                    {
                        ({ height, width }: { height: number, width: number }) => <FixedSizeList
                            height={height}
                            width={width}
                            itemSize={90}
                            itemData={pluginTraceLogs}
                            itemCount={pluginTraceLogs.length}
                            overscanCount={2}
                            style={{ overflow: 'clip auto' }}
                        // innerRef={listRef}
                        >
                            {(props) => <Row {...props} />}
                        </FixedSizeList>
                    }
                </AutoSizer>
            </List>
            <Fab
                sx={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    opacity: 0.5,
                    display: listRef.current?.scrollTop && listRef.current?.scrollTop > 50 ? 'auto' : 'none',
                }}
                color='primary'
                size='medium'
                onClick={() => {
                    listRef.current?.scrollTo(0, 0);
                }}
            >
                <UpIcon />
            </Fab>
        </>
    );
});



interface LittleListItemProps {
    pluginTraceLog: PluginTraceLog,
    boxStyle: React.CSSProperties
}
function TraceLogsListItem(props: LittleListItemProps) {
    const { pluginTraceLog, boxStyle } = props;

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
            sx={{ alignItems: 'center', bgcolor: bgcolor, ...boxStyle }}
        >
            <HorizontalSlider>
                {content}
            </HorizontalSlider>
        </ListItemButton>
    );
}

function PluginTraceLogsListItem(props: LittleListItemProps) {
    const { pluginTraceLog } = props;

    const { openDialog } = useContext(TraceLogControllerContext);
    const { sdkMessageProcessingSteps: sdkMessageProcessingStepsStore, addMessageProcessingSteps, sdkMessageProcessingStepImages: sdkMessageProcessingStepImagesStore, addMessageProcessingStepImages } = useContext(TraceLogsAPI);

    const [isFetchingStep, setIsFetchingStep] = useState<boolean>(false);
    const [isFetchingImages, setIsFetchingImages] = useState<boolean>(false);

    const ref = useRef<HTMLDivElement | null>(null);

    const sdkMessageProcessingStep: SdkMessageProcessingStep | null = sdkMessageProcessingStepsStore[pluginTraceLog.plugintracelogid] ?? null;

    const sdkMessageProcessingStepImages: SdkMessageProcessingStepImage[] | null = sdkMessageProcessingStepImagesStore[pluginTraceLog.plugintracelogid] ?? null;

    useEffect(() => {
        if (!sdkMessageProcessingStep) {
            const fetchData = async () => {
                const result = await Xrm.WebApi.online.retrieveRecord('sdkmessageprocessingstep', pluginTraceLog.pluginstepid, "?$select=" + ['stage', 'name', 'filteringattributes'].join(','));
                delete result["@odata.context"];
                delete result["@odata.etag"];
                addMessageProcessingSteps(pluginTraceLog.plugintracelogid, result);
                setIsFetchingStep(false);
            }
            fetchData();
            setIsFetchingStep(true);
        }
    }, [sdkMessageProcessingStep?.sdkmessageprocessingstepid]);

    useEffect(() => {
        if (!sdkMessageProcessingStepImages) {
            const fetchData = async () => {
                const result = await Xrm.WebApi.online.retrieveMultipleRecords('sdkmessageprocessingstepimage', `?$select=${['entityalias', 'imagetype', 'attributes'].join(',')}&$filter=_sdkmessageprocessingstepid_value eq ${pluginTraceLog.pluginstepid}`);
                addMessageProcessingStepImages(pluginTraceLog.plugintracelogid, result.entities);
                setIsFetchingImages(false);
            }
            fetchData();
            setIsFetchingImages(true);
        }
    }, [sdkMessageProcessingStepImages]);

    const isFetching = useMemo(() => (isFetchingStep || isFetchingImages), [isFetchingStep, isFetchingImages]);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                width: 'fit-content',
                minWidth:'100%'
            }}
            onClick={() => openDialog(pluginTraceLog, sdkMessageProcessingStep, sdkMessageProcessingStepImages)}
            ref={ref}
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
                        {`${moment(pluginTraceLog.performanceexecutionstarttime).format('YYYY/MM/DD HH:mm:ss.SSS')} — `}
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

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                width: 'fit-content',
                minWidth:'100%'
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
                        {`${moment(pluginTraceLog.performanceexecutionstarttime).format('YYYY/MM/DD HH:mm:ss.SSS')} — `}
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