import { Box, Button, Drawer, List, ListItemButton } from "@mui/material";
import React, { PropsWithChildren, useMemo } from "react";

interface PanelDrawerItemProps {
    width: number;
    open: boolean;
}

function PanelDrawerItem(props: PanelDrawerItemProps & PropsWithChildren) {
    const { width, open, children } = props;

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
                        bottom: 0,
                        right: 47,
                        height: 'calc(100% - 3.43rem)',
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

                {/* <Box position="absolute" bottom={0}>
                    <Button
                        ref={refButton}
                        sx={(theme) => ({
                            position: "relative",
                            right:
                                ((refButton.current?.offsetWidth ?? 0) +
                                    (refButton.current?.offsetHeight ?? 0)) /
                                2 -
                                1,
                            bottom: 30 + (refButton.current?.offsetWidth ?? 0) / 2,
                            transform: "rotate(-90deg)",
                            borderTop: `1px solid ${theme.palette.divider}`,
                            borderLeft: `solid 1px ${theme.palette.divider}`,
                            borderRight: `solid 1px ${theme.palette.divider}`,
                            backgroundColor: theme.palette.background.paper,
                            "&:hover": {
                                backgroundColor: theme.palette.background.paper,
                                filter: "brightness(96%)",
                            },
                            minWidth: "unset",
                        })}
                        onClick={toggleDrawer}
                    >
                        D365
                    </Button>
                </Box> */}
            </Drawer>
        </div>
    );
}

export default PanelDrawerItem;
