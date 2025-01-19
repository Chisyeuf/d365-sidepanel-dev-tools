import { Drawer } from "@mui/material";
import React, { PropsWithChildren } from "react";
import { ProcessButton } from "../../global/.processClass";

interface PanelDrawerItemProps {
    width: ProcessButton['width'];
    open: boolean;
}

function PanelDrawerItem(props: PanelDrawerItemProps & PropsWithChildren) {
    const { width, open, children } = props;

    return (
        <div>
            <Drawer
                anchor={"right"}
                open={open}
                hideBackdrop
                ModalProps={{
                    disableScrollLock: true,
                    keepMounted: true,
                }}
                PaperProps={{
                    sx: {
                        top: 'unset',
                        bottom: 0,
                        right: 47,
                        height: `calc(100% - 3.43rem)`,
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