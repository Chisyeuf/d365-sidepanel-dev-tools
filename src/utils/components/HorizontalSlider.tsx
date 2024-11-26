import React, { PropsWithChildren } from "react";
import { makeStyles } from "@mui/styles";
import { Box } from "@mui/material";

type HorizontalSliderProps = {
}

const useStyles = makeStyles({
    animatedItem: {
        "&:hover > *": {
            animation: `$slideChildren 5000ms linear infinite alternate`
        },
        "&:hover": {
            animation: `$slideContainer 5000ms linear infinite alternate `
        }
    },
    "@keyframes slideChildren": {
        "0%": {
            transform: "translateX(0%)"
        },
        "10%": {
            transform: "translateX(0%)"
        },
        "90%": {
            transform: "translateX(-100%)"
        },
        "100%": {
            transform: "translateX(-100%)"
        }
    },
    "@keyframes slideContainer": {
        "0%": {
            transform: "translateX(0%)"
        },
        "10%": {
            transform: "translateX(0%)"
        },
        "90%": {
            transform: "translateX(100%)"
        },
        "100%": {
            transform: "translateX(100%)"
        }
    }
});

const HorizontalSlider = function (props: HorizontalSliderProps & PropsWithChildren) {
    const { children } = props;
    const classes = useStyles();
    
    return (
        <Box
            sx={{ height: "100%", width: "100%" }}
            className={classes.animatedItem}
        >
            {children}
        </Box>
    );
}

export default HorizontalSlider