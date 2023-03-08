
import { Button, IconButton, Snackbar } from '@mui/material';
import React, { forwardRef } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../../utils/global/.processClass';



import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import Processes, { StorageConfiguration } from '../.list';
import ReactDOM from 'react-dom';


class SetConfigurationButton extends ProcessButton {
    constructor() {
        super(
            'createconfiguration',
            'Create Load Configuration',
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


        function CreateConfiguration() {
            const allOpenPanes = Xrm.App.sidePanes.getAllPanes().get();
            const selectedPane = Xrm.App.sidePanes.getSelectedPane();
            allOpenPanes.shift();

            const openConfigurations: StorageConfiguration[] = allOpenPanes.filter(pane => pane.paneId?.startsWith(ProcessButton.prefixId)).map(openPane => {
                return {
                    id: openPane.paneId!,
                    startOnLoad: true,
                    expand: !!openPane.paneId && openPane.paneId === selectedPane.paneId,
                    hidden: false,
                    options: Processes.find(p => p.id === openPane.paneId)?.getConfiguration(),
                }
            });
            const allOpenPanesId = allOpenPanes.map(pane => pane.paneId);
            const closedConfigurations: StorageConfiguration[] = Processes.filter(process => process.id !== props.id && !allOpenPanesId.includes(process.id)).map(closedPane => {
                return {
                    id: closedPane.id,
                    startOnLoad: false,
                    expand: false,
                    hidden: false,
                    options: closedPane?.getConfiguration(),
                }
            });

            const configurations: StorageConfiguration[] = [...openConfigurations, ...closedConfigurations];

            console.log(configurations);
        }

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
                message="Open/Close tools you want to on page load & Configure tools as you want when they opening."
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