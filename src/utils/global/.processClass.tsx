
import React, { forwardRef, useMemo } from "react";
import { Alert, Box, Button, Divider, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { useSnackbar } from "notistack";
import { PROJECT_PREFIX } from "./var";
import { useEffectOnce } from "../hooks/use/useEffectOnce";
import HelpTwoToneIcon from '@mui/icons-material/HelpTwoTone';
import Zoom from '@mui/material/Zoom';
import TooltipInfo from "../components/TooltipInfo";


export abstract class ProcessButton {
    static prefixId: string = PROJECT_PREFIX;

    id: string;
    menuButtonName: string;
    panelButtonName: string | JSX.Element;
    menuButtonIcon: JSX.Element;
    panelButtonIcon: JSX.Element;
    width: number | string;
    widthNumber: number;
    openable: boolean;
    isPanelProcess: boolean;

    process?: React.ForwardRefExoticComponent<ProcessProps & React.RefAttributes<ProcessRef>>;
    processContainer?: React.FunctionComponent<{ children: React.ReactNode | React.ReactNode[] }>;

    description: React.ReactNode = "No description.";

    ref: React.RefObject<ProcessRef>;

    constructor(id: string, name: string | (() => string), icon: JSX.Element | (() => JSX.Element), width: number | string, isPanelProcess: boolean = true) {
        this.id = ProcessButton.prefixId + id;
        this.menuButtonName = typeof name === 'function' ? name() : name;
        this.panelButtonName = this.menuButtonName;
        this.menuButtonIcon = typeof icon === 'function' ? icon() : icon;
        this.panelButtonIcon = this.menuButtonIcon;
        this.width = width;
        this.widthNumber = typeof this.width === 'string' ? (this.width.endsWith('px') ? parseInt(this.width) : -1) : this.width;
        this.openable = true;
        this.isPanelProcess = isPanelProcess;

        this.ref = React.createRef<ProcessRef>();
    }

    getConfiguration(): string {
        return this.id + ".conf";
    }



    getProcess(setBadge: (content: React.ReactNode | null,) => void): React.JSX.Element {
        if (this.processContainer)
            return <this.processContainer>{this.process ? <this.process id={this.id} ref={this.ref} setBadge={setBadge} /> : <ErrorProcess />}</this.processContainer>;
        else
            return this.process ? <this.process id={this.id} ref={this.ref} setBadge={setBadge} /> : <ErrorProcess />;
    }

    getOpeningButton(onClick: (process: ProcessButton) => any): React.JSX.Element {
        return <ButtonProcess onClick={() => onClick(this)} processButton={this} />
    }

    getFunctionButton(): React.JSX.Element {
        return this.getOpeningButton(this.execute);
    }

    execute(): void {
    }

    onProcessClose(): void {
        this.ref.current?.onClose?.();
    }

    onExtensionLoad(snackbarProviderContext: ReturnType<typeof useSnackbar>): void {
    }
}

const ButtonProcess = (props: { processButton: ProcessButton, onClick: () => any }) => {
    const { onClick, processButton } = props;

    const snackbarProviderContext = useSnackbar();

    useEffectOnce(() => {
        processButton.onExtensionLoad(snackbarProviderContext);
    });

    const tooltipTitle = useMemo(() => (
        // <Paper variant='outlined' sx={{ py: 1, px: 2 }}>
        // <Alert variant="outlined" icon={false} severity='info'>
            <Stack direction='column' spacing={0.5}>
                <Stack direction='row' spacing={2} alignItems='flex-end' pl={1}>
                    <Box>{processButton.panelButtonIcon}</Box>
                    <Typography variant='h6'>{processButton.menuButtonName}</Typography>
                </Stack>
                <Divider />
                <Box p={1}>
                    {processButton.description}
                </Box>
            </Stack>
        // </Alert>
        // </Paper>
    ), []);


    return (
        <Button
            variant="contained"
            size="medium"
            sx={{
                whiteSpace: 'nowrap',
                pl: 0.75,
                '&:hover .helpInfo': { visibility: 'visible' }
            }}
            fullWidth
            onClick={onClick}
        >
            <Stack direction='row' width='100%' spacing='2px' minWidth={0} justifyContent='space-between' >
                <TooltipInfo
                    title={tooltipTitle}
                    placement='left'
                    disableInteractive
                    arrow
                    enterDelay={500}
                    slots={{
                        transition: Zoom,
                    }}
                    maxWidth={540}
                >
                    <HelpTwoToneIcon className='helpInfo' visibility='hidden' />
                </TooltipInfo>

                <Stack direction='row' spacing={1} width='100%' minWidth={0} justifyContent='center'>
                    <Box>{processButton.menuButtonName}</Box>
                    {processButton.menuButtonIcon}
                </Stack>

            </Stack>
        </Button>
    );
}

function ErrorProcess() {
    return <div>Process not implemented.</div>
}

export interface ProcessProps {
    id: string;
    setBadge: (number: React.ReactNode | null) => void;
}
export type ProcessRef = {
    onClose?: () => void,
}