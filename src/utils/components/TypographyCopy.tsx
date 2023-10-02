import { Box, Button, Typography, TypographyProps } from "@mui/material";
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import { useCopyToClipboard } from "usehooks-ts";
import { useCallback } from "react";
import React from "react";

function TypographyCopy(props: TypographyProps & { copyValue?: string }) {
    const [, copyFn] = useCopyToClipboard();

    const handleClick = useCallback(() => {
        copyFn(props.copyValue ?? '');
    }, [copyFn, props.copyValue]);

    return (
        <Box
            position='relative'
            borderRadius={1}
            minHeight='24px'
            height={props.height as string ?? '90%'}
            padding={1}
            pr={0}
            pt={0}
            sx={{ 
                bgcolor: 'grey.200',
                '&:hover .copyButton' : {
                    display:'flex'
                }
             }}
            overflow='hidden'
        >
            <Box pt={1} pb={0} height='100%' width='100%' overflow='auto'>
                <Typography {...props} variant="body1" style={{ whiteSpace: 'pre-line' }}>
                    {props.children}
                </Typography>
            </Box>

            {
                props.copyValue &&
                <Button
                    className="copyButton"
                    sx={{
                        position: 'absolute',
                        top: 5,
                        right: 20,
                        bgcolor: 'background.paper',
                        fontSize: '0.75em',
                        display:'none'
                    }}
                    variant='outlined'
                    endIcon={<ContentCopyOutlinedIcon />}
                    onClick={handleClick}
                    size='small'
                >
                    Copy
                </Button>}
        </Box>
    );
}

export default TypographyCopy;