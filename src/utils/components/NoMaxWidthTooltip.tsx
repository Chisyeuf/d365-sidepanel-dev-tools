import { styled, Tooltip, tooltipClasses, TooltipProps } from "@mui/material";
import React from "react";

export const NoMaxWidthTooltip: React.ComponentType<TooltipProps> = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))({
    [`& .${tooltipClasses.tooltip}`]: {
        maxWidth: 'none',
    },
});