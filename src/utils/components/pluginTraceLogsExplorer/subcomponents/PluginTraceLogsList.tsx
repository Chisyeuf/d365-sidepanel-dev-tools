import { Box, Fab, LinearProgress, List, ListItemButton, ListItemText, ListSubheader, Tooltip, Typography } from "@mui/material";
import React, { useContext, useMemo, useRef } from "react";
import { OperationType, PluginTraceLog, SdkMessageProcessingStep, SdkMessageProcessingStepImage } from "../type";
import { TraceLogControllerContext } from "./contexts";

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { RetrieveSingleAttribute } from "../../../hooks/XrmApi/RetrieveSingleAttribute";
import { RetrieveAllAttributes } from "../../../hooks/XrmApi/RetrieveAllAttributes";
import { RetrieveAllRecords } from "../../../hooks/XrmApi/RetrieveAllRecords";
import { RetrieveRecordsByFetchXML } from "../../../hooks/XrmApi/RetrieveRecordsByFetchXML";
import { RetrieveRecordsByFilter } from "../../../hooks/XrmApi/RetrieveRecordsByFilter";
import moment from "moment";
import { CircularProgress } from "@material-ui/core";
import handleViewport, { type InjectedViewportProps } from "react-in-viewport";
import { RetrieveAttributes } from "../../../hooks/XrmApi/RetrieveAttributes";

import UpIcon from '@mui/icons-material/KeyboardArrowUp';


interface LittleListProps {
    pluginTraceLogs: PluginTraceLog[]
    isFetching?: boolean
}
function PluginTraceLogsList(props: LittleListProps) {
    const { pluginTraceLogs, isFetching } = props;

    const listRef = useRef<HTMLUListElement | null>(null);
    // const pluginTraceLogs = useContext(PluginTraceLogsContext);

    return (
        <>
            <List
                ref={listRef}
                dense
                sx={{ width: '100%', bgcolor: 'background.paper', overflowY: 'auto', overflowX: 'clip' }}
                key={`List-pluginTraceLogs`}
                subheader={
                    <ListSubheader component="div" sx={{ height: '5px' }}>
                        {isFetching && <LinearProgress />}
                    </ListSubheader>
                }
            >
                {
                    pluginTraceLogs.map(pluginTraceLog => {
                        return (
                            <TraceLogsListItem pluginTraceLog={pluginTraceLog} />
                        );
                    })
                }
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
}

// const ViewportTraceLogsListItem = handleViewport(TraceLogsListItem, /** options: {}, config: {} **/);

function TraceLogsListItem(props: LittleListItemProps) {
    const { pluginTraceLog, } = props;
    // const { pluginTraceLog, forwardedRef, inViewport } = props;

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
        // if (!inViewport) {
        //     return (<Box height={'91.9688px'}></Box>);
        // }
        switch (pluginTraceLog.operationtype) {
            case OperationType.PlugIn:
                return (
                    <PluginTraceLogsListItem pluginTraceLog={pluginTraceLog} />
                );
            default:
                return (
                    <WorkflowActivityTraceLogsListItem pluginTraceLog={pluginTraceLog} />
                );
        }
    }, [pluginTraceLog]);
    // }, [pluginTraceLog, inViewport]);

    return (
        <ListItemButton
            alignItems="flex-start"
            key={`ListItemButton-${pluginTraceLog.plugintracelogid}`}
            sx={{ alignItems: 'center', bgcolor: bgcolor }}
        // ref={forwardedRef}
        >
            {content}
        </ListItemButton>
    );
}

interface LittleListItemProps {
    pluginTraceLog: PluginTraceLog
}
function PluginTraceLogsListItem(props: LittleListItemProps) {
    const { pluginTraceLog } = props;

    const { openDialog } = useContext(TraceLogControllerContext);

    const [sdkMessageProcessingStep, isFetchingStep]: [SdkMessageProcessingStep, boolean] = RetrieveAttributes('sdkmessageprocessingstep', pluginTraceLog.pluginstepid, ['stage', 'name', 'filteringattributes']) as any;

    const [sdkMessageProcessingStepImages, isFetchingImages, refreshStepImages]: [SdkMessageProcessingStepImage[], boolean, () => void] = RetrieveRecordsByFilter('sdkmessageprocessingstepimage', ['imagetype', 'attributes'], `_sdkmessageprocessingstepid_value eq ${pluginTraceLog.pluginstepid}`);

    const isFetching = useMemo(() => (isFetchingStep || isFetchingImages), [isFetchingStep, isFetchingImages]);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
                width: '100%'
            }}
            onClick={() => openDialog(pluginTraceLog, sdkMessageProcessingStep, sdkMessageProcessingStepImages)}
        >
            <ListItemText
                key={`ListItemText-${pluginTraceLog.plugintracelogid}`}
                primary={<React.Fragment>
                    <Box maxWidth='250px' overflow='hidden' textOverflow='ellipsis'>
                        <Tooltip title={pluginTraceLog.messagename} placement='left'>
                            <Typography
                                sx={{ display: 'inline', fontWeight: 'bold' }}
                                component="span"
                                variant="button"
                                color="text.primary"
                                lineHeight={0}
                            >
                                {pluginTraceLog.messagename}
                            </Typography>
                        </Tooltip>
                        <Typography
                            sx={{ display: 'inline', pl: 1 }}
                            component="span"
                            variant="body2"
                            color="text.primary"
                        >
                            {pluginTraceLog["mode@OData.Community.Display.V1.FormattedValue"]}
                        </Typography>
                    </Box>
                    <Tooltip title={pluginTraceLog.primaryentity} placement='left'>
                        <Typography
                            sx={{ display: 'inline', fontWeight: 'bold' }}
                            component="span"
                            variant="body1"
                            color="text.primary"
                            fontSize='1em'
                        >
                            {pluginTraceLog.primaryentity}
                        </Typography>
                    </Tooltip>
                    {` — ${isFetching ? 'Loading...' : sdkMessageProcessingStep["stage@OData.Community.Display.V1.FormattedValue"]}`}
                    <Tooltip title={isFetching ? 'Loading...' : sdkMessageProcessingStep.name} placement='left'>
                        <Typography
                            component="p"
                            variant="caption"
                            color="text.primary"
                            whiteSpace='nowrap'
                        >
                            {`${isFetching ? 'Loading...' : sdkMessageProcessingStep.name}`}
                        </Typography>
                    </Tooltip>
                </React.Fragment>
                }
                secondary={
                    <React.Fragment>
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

                    </React.Fragment>
                }
            />
            <ErrorOutlineIcon sx={{ color: '#ff3333', visibility: pluginTraceLog.exceptiondetails ? 'visible' : 'hidden' }} />
            {/* {(isFetchingStep || isFetchingImages) && <CircularProgress />} */}
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
                alignItems: 'center',
                width: '100%'
            }}
            onClick={() => openDialog(pluginTraceLog, null, null)}
        >
            <ListItemText
                key={`ListItemText-${pluginTraceLog.plugintracelogid}`}
                primary={<React.Fragment>
                    <Box maxWidth='250px' overflow='hidden' textOverflow='ellipsis'>
                        <Tooltip title={pluginTraceLog.messagename} placement='left'>
                            <Typography
                                sx={{ display: 'inline', fontWeight: 'bold' }}
                                component="span"
                                variant="button"
                                color="text.primary"
                                lineHeight={0}
                            >
                                {pluginTraceLog.messagename}
                            </Typography>
                        </Tooltip>
                    </Box>
                    <Tooltip title={pluginTraceLog.primaryentity} placement='left'>
                        <Typography
                            sx={{ display: 'inline', fontWeight: 'bold' }}
                            component="span"
                            variant="body1"
                            color="text.primary"
                            fontSize='1em'
                        >
                            {pluginTraceLog.primaryentity}
                        </Typography>
                    </Tooltip>
                    {` — ${pluginTraceLog["mode@OData.Community.Display.V1.FormattedValue"]}`}
                    <Typography
                        component="p"
                        variant="caption"
                        color="text.primary"
                        whiteSpace='nowrap'
                    >
                        {`${pluginTraceLog["operationtype@OData.Community.Display.V1.FormattedValue"]}`}
                    </Typography>
                </React.Fragment>
                }
                secondary={
                    <React.Fragment>
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

                    </React.Fragment>
                }
            />
            <ErrorOutlineIcon sx={{ color: '#ff3333', visibility: pluginTraceLog.exceptiondetails ? 'visible' : 'hidden' }} />
        </Box>
    );
}



export default PluginTraceLogsList;