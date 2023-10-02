import { Stack, TextField, Typography } from "@mui/material";
import Grid from '@mui/material/Unstable_Grid2';
import React from "react";

interface TraceLogFieldProps {
    label: string,
    value: any,
}
function TraceLogField(props: TraceLogFieldProps) {
    const { label, value } = props;

    return (
        <Grid xs={4}>
            <Stack direction='row' gap={1} alignItems='center'>
                <Typography width='60%'>
                    {label}:
                </Typography>
                <TextField
                    fullWidth
                    variant="filled"
                    value={value ?? ''}
                    size="small"
                    focused={false}
                    inputProps={({
                        style: { padding: '4px 12px' },
                        readOnly: true,
                    })}
                />
            </Stack>
        </Grid>
    );
}

export default TraceLogField;