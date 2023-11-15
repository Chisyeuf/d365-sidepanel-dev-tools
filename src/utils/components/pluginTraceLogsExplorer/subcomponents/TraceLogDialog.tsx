import { AppBar, Box, Dialog, IconButton, Slide, Stack, Toolbar, Typography, createTheme } from "@mui/material";
import Grid from '@mui/material/Unstable_Grid2';
import CloseIcon from '@mui/icons-material/Close';
import { TransitionProps } from '@mui/material/transitions';
import React, { useContext, useMemo } from "react";
import { TraceLogControllerContext, TraceLogsAPI } from "./contexts";
import { OperationType } from "../type";

import { ThemeProvider } from "@emotion/react";
import PluginTraceLogsList from "./PluginTraceLogsList";
import Section from "./Section";
import TraceLogField from "./TraceLogField";
import TypographyCopy from "../../TypographyCopy";

const theme = createTheme({
    components: {
        MuiGrid2: {
            styleOverrides: {
                root: {
                    // boxSizing: "border-box",
                    // padding: defaultTheme.spacing(1)
                }
            },
        }
    }
});



const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

interface DialogProps {

}
const TraceLogDialog = React.memo((props: DialogProps) => {
    // const { } = props;

    const { pluginTraceLogs } = useContext(TraceLogsAPI);

    const { closeDialog, dialogOpened, selectedPluginTraceLog, selectedSdkMessageProcessingStep: relatedSdkMessageProcessingStep, selectedSdkMessageProcessingStepImages: relatedSdkMessageProcessingStepImages } = useContext(TraceLogControllerContext);

    const imagesEnabled = useMemo(() => relatedSdkMessageProcessingStepImages.length > 0, [relatedSdkMessageProcessingStepImages]);

    const traceLogsCorrelated = useMemo(() => pluginTraceLogs.filter(p => p.correlationid === selectedPluginTraceLog?.correlationid), [selectedPluginTraceLog?.correlationid]);

    return (
        <ThemeProvider theme={theme}>
            <Dialog
                keepMounted
                fullScreen
                sx={{ width: 'calc(100% - 47px - 450px)' }}
                open={dialogOpened}
                onClose={closeDialog}
                TransitionComponent={Transition}
            >
                <AppBar sx={{ position: 'relative' }}>
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={closeDialog}
                            aria-label="close"
                        >
                            <CloseIcon />
                        </IconButton>
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                            {selectedPluginTraceLog && `${selectedPluginTraceLog.messagename} — ${relatedSdkMessageProcessingStep?.name ?? 'Loading...'} — ${new Date(selectedPluginTraceLog.performanceexecutionstarttime).toLocaleString()}`}
                        </Typography>
                    </Toolbar>
                </AppBar>

                <Box
                    sx={{
                        flexGrow: 1,
                        background: 'lightgray',
                        overflow: 'hidden',
                        padding: theme.spacing(1)
                    }}
                >
                    <Stack spacing={1} direction='column' height='100%'>
                        <Stack spacing={1} direction='row' height='75%'>
                            <Section title="Correlation" sx={{ width: '25%' }}>
                                <PluginTraceLogsList pluginTraceLogs={traceLogsCorrelated} />
                            </Section>
                            <Stack spacing={1} direction='column' height={'100%'} width={imagesEnabled ? '55%' : '75%'}>
                                {
                                    relatedSdkMessageProcessingStep?.filteringattributes &&
                                    <Section title="Filtering Attributes" openByDefault={true} sx={{ maxHeight: '7.5em' }}>
                                        <TypographyCopy height='unset' variant="body1" copyValue={relatedSdkMessageProcessingStep?.filteringattributes} >
                                            {relatedSdkMessageProcessingStep?.filteringattributes?.replaceAll(',', ', ') ?? 'Loading...'}
                                        </TypographyCopy>
                                    </Section>
                                }
                                <Section title="Message">
                                    <TypographyCopy variant="body1" copyValue={selectedPluginTraceLog?.messageblock} >
                                        {selectedPluginTraceLog?.messageblock}
                                    </TypographyCopy>
                                </Section>
                                {
                                    selectedPluginTraceLog?.exceptiondetails &&
                                    <Section title="Exception Details">
                                        <TypographyCopy variant="body1" copyValue={selectedPluginTraceLog?.exceptiondetails} >
                                            {selectedPluginTraceLog?.exceptiondetails}
                                        </TypographyCopy>
                                    </Section>
                                }
                            </Stack>
                            {
                                imagesEnabled && <Stack spacing={1} direction='column' height={'100%'} width='20%'>
                                    {
                                        relatedSdkMessageProcessingStepImages.map(relatedSdkMessageProcessingStepImage => {
                                            return (
                                                <Section title={relatedSdkMessageProcessingStepImage.entityalias}>
                                                    <TraceLogField label="Image Type" value={relatedSdkMessageProcessingStepImage["imagetype@OData.Community.Display.V1.FormattedValue"]} />
                                                    <TypographyCopy variant="body1" copyValue={relatedSdkMessageProcessingStepImage.attributes ?? ''} >
                                                        {relatedSdkMessageProcessingStepImage.attributes?.replaceAll(',', '\n')}
                                                    </TypographyCopy>
                                                </Section>
                                            );
                                        })
                                    }
                                </Stack>
                            }
                        </Stack>
                        <Box height='25%'>
                            <Section title="Context">
                                <Grid container rowSpacing={1.5} columnSpacing={6} sx={{ width: '100%' }} pl={2}>
                                    <TraceLogField label="Operation Type" value={selectedPluginTraceLog?.["operationtype@OData.Community.Display.V1.FormattedValue"]} />
                                    <TraceLogField label="Message" value={selectedPluginTraceLog?.messagename} />
                                    <TraceLogField label="Primary Entity" value={selectedPluginTraceLog?.primaryentity} />
                                    <TraceLogField label="Depth" value={selectedPluginTraceLog?.depth} />
                                    {selectedPluginTraceLog?.operationtype === OperationType.PlugIn && <TraceLogField label="Stage" value={relatedSdkMessageProcessingStep?.["stage@OData.Community.Display.V1.FormattedValue"] ?? 'Loading...'} />}
                                    <TraceLogField label="Mode" value={selectedPluginTraceLog?.["mode@OData.Community.Display.V1.FormattedValue"]} />
                                    {/* <TraceLogField label="Created On" value={selectedPluginTraceLog?.["createdon@OData.Community.Display.V1.FormattedValue"]} /> */}
                                    {/* <TraceLogField label="Construction Start Date" value={selectedPluginTraceLog?.["performanceconstructorstarttime@OData.Community.Display.V1.FormattedValue"]} />
                                    <TraceLogField label="Construction Duration" value={selectedPluginTraceLog?.["performanceconstructorduration@OData.Community.Display.V1.FormattedValue"]} /> */}
                                    <TraceLogField label="Execution Start Date" value={selectedPluginTraceLog?.performanceexecutionstarttime} />
                                    <TraceLogField label="Execution Duration" value={selectedPluginTraceLog?.["performanceexecutionduration@OData.Community.Display.V1.FormattedValue"]} />
                                    {/* <TraceLogField label="Execution Duration" value={selectedPluginTraceLog?.["performanceexecutionduration@OData.Community.Display.V1.FormattedValue"]} /> */}
                                </Grid>

                            </Section>
                        </Box>
                    </Stack>
                </Box>

            </Dialog>
        </ThemeProvider>
    );
});

export default TraceLogDialog;