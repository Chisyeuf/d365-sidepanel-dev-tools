import { Button, ButtonProps, LinearProgress, Typography } from "@mui/material";
import React, { PropsWithChildren } from "react";


interface ButtonLinearProgressProps {
    loading?: boolean
}
function ButtonLinearProgress(props: ButtonLinearProgressProps & ButtonProps & PropsWithChildren) {
    const { loading, children, ...buttonProps } = props;

    return <Button
        {...buttonProps}
        sx={{
            override: 'hidden'
        }}
    >
        {(loading ?? true) && <LinearProgress
            sx={{
                position: "absolute",
                width: "100%",
                height: "100%",
                borderRadius: buttonProps.style?.borderRadius ?? 1
            }}
        />}
        <Typography
            sx={{
                zIndex: 1
            }}
        >
            {children}
        </Typography>
    </Button>
}

export default ButtonLinearProgress;