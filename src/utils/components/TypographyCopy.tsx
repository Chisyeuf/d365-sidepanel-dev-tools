import { Box, Button, Typography, TypographyProps } from "@mui/material";
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import { useCopyToClipboard } from "usehooks-ts";
import { useCallback, useState } from "react";
import React from "react";

function TypographyCopy(props: TypographyProps & { copyValue?: string }) {
    const [, copyFn] = useCopyToClipboard();

    const [clicked, setClicked] = useState<boolean>(false);

    const handleClick = useCallback(() => {
        copyFn(props.copyValue ?? '');
        setClicked(true);
        setTimeout(() => {
            setClicked(false);
        }, 250);
    }, [copyFn, props.copyValue]);

    return (
        <Typography
            {...props}
            onClick={(event) => { props.onClick?.(event); handleClick(); }}
            sx={(theme) => ({
                color: clicked ? theme.palette.primary.light : 'inherit',
                transition: 'color 200ms ease 0s',
                // ...(props.sx instanceof Function ? props.sx?.(theme) : (!!props.sx ? props.sx : {})),
            })}
        >
            {props.children}
        </Typography>
    );
}

export default TypographyCopy;