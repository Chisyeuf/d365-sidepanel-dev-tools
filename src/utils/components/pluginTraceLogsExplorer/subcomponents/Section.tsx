import { Theme } from "@emotion/react";
import { SxProps, Stack, Typography, Divider, Paper, createTheme, styled, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { PropsWithChildren, useState } from "react";
import { useBoolean } from "usehooks-ts";

import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import React from "react";

export const sectionMinHeight = '66px';

const defaultTheme = createTheme();

const GridPaper = styled(Paper)(({ theme }) => ({
    height: "100%",
    boxSizing: "border-box",
    padding: theme.spacing(2)
}));


interface SectionProps {
    title?: string,
    sx?: SxProps<Theme>,
    defaultExpanded?: boolean,
    expandable?: boolean,
}
const Section = React.memo((props: PropsWithChildren<SectionProps>) => {
    const { value: open, toggle: toggleOpen } = useBoolean(props.defaultExpanded ?? true);

    const handleOnChange = () => {
        (props.expandable === undefined || props.expandable) && toggleOpen();
    }

    return (
        <GridPaper sx={{ minHeight: open ? 0 : sectionMinHeight, height: open ? '100%' : sectionMinHeight, transition: 'height 0.5s ease-in-out 0s', ...props.sx }}>
            <Stack height='100%' overflow='hidden'>
                {
                    props.title && <>
                        <Stack onClick={handleOnChange} direction='row' alignItems='center' justifyContent='space-between' pr={2}>
                            <Typography component='span' variant="h6" sx={{ ml: 1.5 }} color="text.primary">{props.title}</Typography>
                            {(props.expandable === undefined || props.expandable) && (open ? <ExpandLess /> : <ExpandMore />)}
                        </Stack>

                        <Divider sx={{ mb: 1 }} />
                    </>
                }
                {props.children}
            </Stack>
        </GridPaper>
    );
});

export default Section;