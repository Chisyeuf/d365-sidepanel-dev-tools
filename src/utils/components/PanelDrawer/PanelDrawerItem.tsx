import { Box, Button, Drawer, List, ListItemButton } from "@mui/material";
import React, { PropsWithChildren, useMemo } from "react";

interface PanelDrawerItemProps {
    width: number;
    open: boolean;
    titleHeight:number;
}

function PanelDrawerItem(props: PanelDrawerItemProps & PropsWithChildren) {
    const { width, open, children, titleHeight } = props;

    // const refButton = React.useRef<HTMLButtonElement>(null);

    return (
        <div>
            <Drawer
                anchor={"right"}
                open={open}
                hideBackdrop
                ModalProps={{
                    disableScrollLock: true,
                }}
                PaperProps={{
                    sx: {
                        top: 'unset',
                        bottom: titleHeight + 'px',
                        right: 47,
                        height: `calc(100% - 3.43rem - ${titleHeight}px)`,
                        zIndex: 1199,
                        width: width,
                        overflow: "visible",
                    },
                    style: {
                        visibility: "visible",
                    },
                }}
                sx={{
                    width: width,
                }}
                variant="persistent"
            >
                {children}
            </Drawer>
        </div>
    );
}

export default PanelDrawerItem;
