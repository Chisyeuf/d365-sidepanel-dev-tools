
import React, { forwardRef, } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../../utils/global/.processClass';

import EventNoteIcon from '@mui/icons-material/EventNote';
import PluginTraceLogsPane from '../../utils/components/pluginTraceLogsExplorer/main';
import { TraceLogController, TraceLogsAPI } from '../../utils/components/pluginTraceLogsExplorer/subcomponents/contexts';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';


class PluginTraceLogsExplorerButton extends ProcessButton {
    constructor() {
        super(
            'pluginlogsexplorer',
            'Plugin Trace Logs Explorer',
            <EventNoteIcon />,
            450
        );
        this.process = PluginTraceLogsExplorerButtonProcess;
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