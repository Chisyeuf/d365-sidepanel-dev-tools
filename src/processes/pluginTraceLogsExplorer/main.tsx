import React, { forwardRef } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../../utils/global/.processClass';

import EventNoteIcon from '@mui/icons-material/EventNote';
import PluginTraceLogsPane from '../../utils/components/pluginTraceLogsExplorer/main';
import { TraceLogController, TraceLogsAPI } from '../../utils/components/pluginTraceLogsExplorer/subcomponents/contexts';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { List, Typography } from '@mui/material';


class PluginTraceLogsExplorerButton extends ProcessButton {
    constructor() {
        super(
            'pluginlogsexplorer',
            'Plugin Trace Logs Explorer',
            <EventNoteIcon />,
            450
        );
        this.process = PluginTraceLogsExplorerButtonProcess;
        this.description = <>
            <Typography><i>Tired of sifting through cluttered and unoptimized log lists?</i></Typography>
            <Typography>The Plugin Trace Logs Explorer provides a streamlined way to <b>view and analyze logs for plugins and custom workflows</b>:</Typography>
            <List sx={{ listStyleType: 'disc', ml: 3, pt: 0 }}>
                <Typography component='li'><b>Enhanced Information</b>: Access detailed log information with a <u>clear and easy-to-read layout</u>.</Typography>
                <Typography component='li'><b>Efficient Filtering</b>: Quickly <u>find the logs by filtering</u> by involved entity, message name, and date range.</Typography>
                <Typography component='li'><b>Log Correlation</b>: After selecting a log, <u>explore the correlation</u> — a view of all related processes, both before and after the selected log.</Typography>
            </List>
        </>
    }
}

const PluginTraceLogsExplorerButtonProcess = forwardRef<ProcessRef, ProcessProps>(
    function PluginTraceLogsExplorerButtonProcess(props: ProcessProps, ref) {

        return (
            <TraceLogController>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TraceLogsAPI maxFetchingRecord={15}>
                        <PluginTraceLogsPane processId={props.id} setBadge={props.setBadge} />
                    </TraceLogsAPI>
                </LocalizationProvider>
            </TraceLogController>

        )
    }
);


const pluginTraceLogsExplorer = new PluginTraceLogsExplorerButton();
export default pluginTraceLogsExplorer;