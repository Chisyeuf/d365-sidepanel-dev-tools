import { useState, forwardRef, useCallback } from "react";
import clsx from "clsx";
import { makeStyles } from "@mui/styles";
import { useSnackbar, SnackbarContent, CustomContentProps } from "notistack";
import Collapse from "@mui/material/Collapse";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import React from "react";
import CancelIcon from "@mui/icons-material/Cancel";

const useStyles = makeStyles(() => ({
    root: {
        "@media (min-width:600px)": {
            minWidth: "344px !important"
        }
    },
    icons: {
        marginLeft: "auto"
    },
    expand: {
        transform: "rotate(0deg)",
        transition: "all .2s"
    },
    expandOpen: {
        transform: "rotate(180deg)"
    },
    paper: {
        padding: 16,
        width: "86%"
    },
    checkIcon: {
        fontSize: 20,
        paddingRight: 4
    },
    button: {
        padding: 0,
        textTransform: "none"
    }
}));

declare module "notistack" {
    interface VariantOverrides {
        errorFile: true;
    }

    interface OptionsObject {
        allowDownload?: boolean;
        downloadButtonLabel?: string;
        errorMessage?: string;
        errorCode?: string;
        fileContent?: string;
        fileName?: string;
    }
}

interface ReportCompleteProps extends CustomContentProps {
    allowDownload?: boolean;
    downloadButtonLabel?: string;
    errorMessage?: string;
    errorCode?: string;
    fileContent?: string;
    fileName?: string;
}

const ErrorFileSnackbar = forwardRef<HTMLDivElement, ReportCompleteProps>(
    ({ id, ...props }, ref) => {
        const classes = useStyles();
        const { closeSnackbar } = useSnackbar();
        const [expanded, setExpanded] = useState(false);

        const handleExpandClick = useCallback(() => {
            setExpanded((oldExpanded) => !oldExpanded);
        }, []);

        const handleDismiss = useCallback(() => {
            closeSnackbar(id);
        }, [id, closeSnackbar]);

        const downloadTxtFile = () => {
            if (!props.fileContent || ! props.fileName) return;
            const errorRawObject = JSON.parse(props.fileContent);
            
            const element = document.createElement("a");
            const file = new Blob([JSON.stringify(errorRawObject, null, 2)], { type: 'text/plain' });
            element.href = URL.createObjectURL(file);
            element.download = props.fileName;
            document.body.appendChild(element); // Required for this to work in FireFox
            element.click();
            element.remove();
        }

        return (
            <SnackbarContent ref={ref} className={classes.root}>
                <Alert variant='filled' severity="error" iconMapping={{ error: <CancelIcon /> }}>
                    <Stack direction="row" alignItems="center">
                        <Typography variant="body2">{props.message}</Typography>
                        {props.allowDownload && <IconButton
                            aria-label="Show more"
                            size="small"
                            className={clsx(classes.expand, {
                                [classes.expandOpen]: expanded
                            })}
                            onClick={handleExpandClick}
                        >
                            <ExpandMoreIcon />
                        </IconButton>}
                        <IconButton
                            size="small"
                            className={classes.expand}
                            onClick={handleDismiss}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                    {props.allowDownload && <Collapse in={expanded} timeout="auto" unmountOnExit>
                        <Paper className={classes.paper}>
                            <Typography
                                gutterBottom
                                variant="caption"
                                style={{ color: "#000", display: "block" }}
                            >
                                {"(" + props.errorCode + ") " + props.errorMessage}
                            </Typography>
                            <Button size="small" color="primary" className={classes.button} onClick={downloadTxtFile}>
                                <CheckCircleIcon className={classes.checkIcon} />
                                {props.downloadButtonLabel}
                            </Button>
                        </Paper>
                    </Collapse>}
                </Alert>
            </SnackbarContent>
        );
    }
);

ErrorFileSnackbar.displayName = "ReportComplete";

export default ErrorFileSnackbar;
