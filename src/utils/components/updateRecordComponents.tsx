import { styled, Tooltip, tooltipClasses, TooltipProps, CircularProgressProps, CircularProgress } from "@mui/material";
import React from "react";


export const NoMaxWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))({
    [`& .${tooltipClasses.tooltip}`]: {
        maxWidth: 'none',
    },
});

export const CircularProgressCenteredUnbound = styled(CircularProgress)({
    position: 'absolute'
})