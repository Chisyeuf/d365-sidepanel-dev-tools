
import React, { forwardRef, } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../../utils/global/.processClass';

import EventNoteIcon from '@mui/icons-material/EventNote';
import PluginTraceLogsPane from '../../utils/components/pluginTraceLogsExplorer/main';


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
            <PluginTraceLogsPane processId={props.id} />
        )
    }
);


const pluginTraceLogsExplorer = new PluginTraceLogsExplorerButton();
export default pluginTraceLogsExplorer;