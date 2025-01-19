import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import HorizontalSlider from '../../HorizontalSlider';
import dayjs from 'dayjs';
import { getCurrentDynamics365DateTimeFormat } from '../../../global/common';
import { VirtuosoHandle } from 'react-virtuoso';
import MuiVirtuoso from '../../MuiVirtuoso';
import { useEffectOnce } from '../../../hooks/use/useEffectOnce';
import { OperationType, PluginTraceLog, SdkMessageProcessingStep, SdkMessageProcessingStepImage } from '../type';
import { TraceLogControllerContext, TraceLogsAPIContext } from './contexts';


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
        <ListItem
            key={`ListItem-${pluginTraceLog.plugintracelogid}`}
            sx={{ p: 0 }}
        >
            <ListItemButton
                alignItems="flex-start"
                key={`ListItemButton-${pluginTraceLog.plugintracelogid}`}
                sx={{ alignItems: 'center', flexDirection: 'column', bgcolor: bgcolor, pb: 1, pt: 0 }}
            >
                <Divider variant='middle' sx={{ width: '100%' }} />
                <HorizontalSlider>
                    {content}
                </HorizontalSlider>
                <ErrorOutlineIcon sx={{ color: '#ff3333', visibility: pluginTraceLog.exceptiondetails ? 'visible' : 'hidden', width: '1.25em', position: 'absolute', right: 15, top: 5 }} />
            </ListItemButton>
        </ListItem>
    );
}



function PluginTraceLogsListItem(props: LittleListItemProps) {
    const { pluginTraceLog } = props;

    const { openDialog } = useContext(TraceLogControllerContext);
    const { sdkMessageProcessingSteps: sdkMessageProcessingStepsStore,  sdkMessageProcessingStepImages: sdkMessageProcessingStepImagesStore, addStepToFetchingQueue } = useContext(TraceLogsAPIContext);
    

    const sdkMessageProcessingStep: SdkMessageProcessingStep | null = useMemo(() => sdkMessageProcessingStepsStore[pluginTraceLog.plugintracelogid] ?? null, [sdkMessageProcessingStepsStore[pluginTraceLog.plugintracelogid]]);

    const sdkMessageProcessingStepImages: SdkMessageProcessingStepImage[] | null = useMemo(() => sdkMessageProcessingStepImagesStore[pluginTraceLog.plugintracelogid] ?? null, [sdkMessageProcessingStepImagesStore[pluginTraceLog.plugintracelogid]]);

    useEffectOnce(() => {
        addStepToFetchingQueue(pluginTraceLog);
    });

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
                        {` — ${!sdkMessageProcessingStep ? 'Loading...' : sdkMessageProcessingStep["stage@OData.Community.Display.V1.FormattedValue"]}`}
                        <Typography
                            component="p"
                            variant="caption"
                            color="text.primary"
                            whiteSpace='nowrap'
                        >
                            {`${!sdkMessageProcessingStep ? 'Loading...' : sdkMessageProcessingStep.name}`}
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
        </Box>
    );
}



export default PluginTraceLogsList;