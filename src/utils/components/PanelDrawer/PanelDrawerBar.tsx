import { Box, Button, Drawer, IconButton, List, ListItemButton } from "@mui/material";
import React, { PropsWithChildren, useMemo } from "react";
import { ProcessButton } from "../../global/.processClass";
import AccessibleIcon from "@mui/icons-material/Accessible";
import PanelDrawerItem from "./PanelDrawerItem";


const width = 47;

// Not used
interface PanelDrawerBarProps {
    mainProcess: React.ReactNode
    mainIcon: React.ReactNode
}
function PanelDrawerBar(props: PanelDrawerBarProps) {
    const { mainIcon, mainProcess } = props;

    const [open, setOpen] = React.useState(false);
    const toggleDrawer = () => setOpen((prev) => !prev);

    const refButton = React.useRef<HTMLButtonElement>(null);

    return (
        <>
            <Drawer
                anchor={"right"}
                open={open}
                hideBackdrop
                sx={{
                    width: width,
                    flexShrink: 0,
                }}
                PaperProps={{
                    sx: {
                        width: width,
                        backgroundColor: "rgb(246,247,248)",
                    },
                }}
                variant="permanent"
            >
                <IconButton size="large" onClick={toggleDrawer}>
                    {mainIcon}
                </IconButton>
            </Drawer>

            <PanelDrawerItem width={300} open={open} titleHeight={57}>
                {mainProcess}
            </PanelDrawerItem>
        </>
    );
}

export default PanelDrawerBar;
