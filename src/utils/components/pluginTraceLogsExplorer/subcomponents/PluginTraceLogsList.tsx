import { Box, List, ListItemButton, ListItemText, Tooltip, Typography } from "@mui/material";
import React, { useContext, useMemo } from "react";
import { PluginTraceLog, SdkMessageProcessingStep, SdkMessageProcessingStepImage } from "../type";
import { PluginTraceLogControllerContext } from "./contexts";

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { RetrieveSingleAttribute } from "../../../hooks/XrmApi/RetrieveSingleAttribute";
import { RetrieveAllAttributes } from "../../../hooks/XrmApi/RetrieveAllAttributes";
import { RetrieveAllRecords } from "../../../hooks/XrmApi/RetrieveAllRecords";
import { RetrieveRecordsByFetchXML } from "../../../hooks/XrmApi/RetrieveRecordsByFetchXML";
import { RetrieveRecords } from "../../../hooks/XrmApi/RetrieveRecords";
import moment from "moment";

interface LittleListProps {
    pluginTraceLogs: PluginTraceLog[]
}
function PluginTraceLogsList(props: LittleListProps) {
    const { pluginTraceLogs } = props;

    // const pluginTraceLogs = useContext(PluginTraceLogsContext);

    return (
        <List
            dense
            sx={{ width: '100%', bgcolor: 'background.paper', overflowY: 'auto', overflowX: 'clip' }}
            key={`List-pluginTraceLogs`}
        >
            {
                pluginTraceLogs.map(pluginTraceLog => {
                    return (
                        <PluginTraceLogsListItem pluginTraceLog={pluginTraceLog} />
                    )
                })
            }
        </List>
    );
}

interface LittleListItemProps {
    pluginTraceLog: PluginTraceLog
}
function PluginTraceLogsListItem(props: LittleListItemProps) {
    const { pluginTraceLog } = props;

    const { selectedPluginTraceLog, openDialog } = useContext(PluginTraceLogControllerContext);

    const [sdkMessageProcessingStep, isFetchingStep]: [SdkMessageProcessingStep, boolean] = RetrieveAllAttributes('sdkmessageprocessingstep', pluginTraceLog.pluginstepid) as any;

    const [sdkMessageProcessingStepImages, isFetchingImages]: [SdkMessageProcessingStepImage[], boolean] = RetrieveRecords('sdkmessageprocessingstepimage', [], `_sdkmessageprocessingstepid_value eq ${pluginTraceLog.pluginstepid}`);

    const bgcolor = useMemo(() => {
        if (selectedPluginTraceLog?.plugintracelogid === pluginTraceLog.plugintracelogid) {
            return 'grey.300';
        }
        else {
            return 'background.paper';
        }
    }, [pluginTraceLog.plugintracelogid, selectedPluginTraceLog?.plugintracelogid]);

    return (
        <ListItemButton
            alignItems="flex-start"
            key={`ListItemButton-${pluginTraceLog.plugintracelogid}`}
            onClick={() => openDialog(pluginTraceLog, sdkMessageProcessingStep, sdkMessageProcessingStepImages)}
            sx={{ alignItems: 'center', bgcolor: bgcolor }}
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
                    {` — ${sdkMessageProcessingStep["stage@OData.Community.Display.V1.FormattedValue"]}`}
                    <Tooltip title={sdkMessageProcessingStep.name} placement='left'>
                        <Typography
                            component="p"
                            variant="caption"
                            color="text.primary"
                            whiteSpace='nowrap'
                        >
                            {`${sdkMessageProcessingStep.name}`}
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
        </ListItemButton>
    );
}



export default PluginTraceLogsList;