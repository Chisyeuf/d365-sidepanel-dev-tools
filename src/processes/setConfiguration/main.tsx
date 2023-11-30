
import { Button, IconButton, Snackbar } from '@mui/material';
import React, { forwardRef, useMemo } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../../utils/global/.processClass';



import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import Processes, { storageListName } from '../.list';
import ReactDOM from 'react-dom';
import { MessageType } from '../../utils/types/Message';
import { GetExtensionId, debugLog } from '../../utils/global/common';
import { StorageConfiguration } from '../../utils/types/StorageConfiguration';


class SetConfigurationButton extends ProcessButton {
    constructor() {
        super(
            'createconfiguration',
            'Loading Configuration',
            <SaveIcon />,
            56
        );
        this.process = SetConfigurationProcess;
    }

    openSidePane(selected: boolean = true): void {

        const NodeToRender = this.process;
        if (!document.querySelector('#' + this.id)) {
            const nodeContainer = document.createElement('div');
            nodeContainer.setAttribute('id', this.id);
            document.body.append(nodeContainer);

            if (NodeToRender) {
                ReactDOM.render(
                    <NodeToRender id={this.id} ref={this.ref} />,
                    nodeContainer
                );
            }
        }
    };
}





const SetConfigurationProcess = forwardRef<ProcessRef, ProcessProps>(
    function SetConfigurationProcess(props: ProcessProps, ref) {

        const [open, setOpen] = React.useState(true);

        const extensionId = GetExtensionId();

        function CreateConfiguration() {
            const allOpenPanes = Xrm.App.sidePanes.getAllPanes().get(); //getAllPanes(): Collection.ItemCollection<App.PaneObject>;
            const selectedPane = Xrm.App.sidePanes.getSelectedPane();
            allOpenPanes.shift();

            const openConfigurations: StorageConfiguration[] = allOpenPanes.filter(pane => pane.paneId?.startsWith(ProcessButton.prefixId)).map((openPane: Xrm.App.PaneObject, index: number) => {
                return {
                    id: openPane.paneId!,
                    startOnLoad: true,
                    startOnPosition: index,
                    expand: !!openPane.paneId && openPane.paneId === selectedPane.paneId,
                    hidden: false,
                    options: Processes.find(p => p.id === openPane.paneId)?.getConfiguration(),
                }
            });

            const configurations: StorageConfiguration[] = Processes.map(process => {
                const opened = openConfigurations.find(c => c.id === process.id);
                if (opened) {
                    return opened;
                }
                return {
                    id: process.id,
                    startOnLoad: false,
                    expand: false,
                    hidden: false,
                    options: process?.getConfiguration(),
                }

            })

            debugLog(configurations);
            chrome.runtime.sendMessage(extensionId, { type: MessageType.SETCONFIGURATION, data: { key: storageListName, configurations: configurations } },
                function (response) {
                    if (response.success) {
                    }
                }
            );
        }

        const message = useMemo(() => <>
            <p>The configuration store the opened side panels and the active side panel. At next loadings the same layout will be duplicated.</p>
            <p>If you want to have opened panels with no active panel, save the configuration when the main menu is active.</p>
        </>, []);

        const saveConfiguration = () => {
            CreateConfiguration();
            handleClose(undefined, '');
        }

        const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
            if (reason === 'clickaway') {
                return;
            }
            setOpen(false);
            document.querySelector('#' + props.id)?.remove();
        };

        return (
            <Snackbar
                open={open}
                onClose={handleClose}
                message={message}
                action={
                    <>
                        <Button color="secondary" size="small" variant='contained' onClick={saveConfiguration}>
                            Apply current configuration
                        </Button>
                        <IconButton
                            size="small"
                            aria-label="close"
                            color="inherit"
                            onClick={handleClose}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </>
                }
            />
        );
    }
);

const createConfiguration = new SetConfigurationButton();
export default createConfiguration;