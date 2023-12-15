import { TooltipProps, Tooltip, tooltipClasses, styled } from "@mui/material";
import React from "react";

const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: theme.palette.common.white,
      color: theme.palette.primary.light,
      boxShadow: theme.shadows[1],
      fontSize: 11,
    },
  }));

  export default LightTooltip;