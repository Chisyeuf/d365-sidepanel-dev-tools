import { useCallback, useEffect, useRef, useState } from 'react'
import { Button, ButtonGroup, ButtonProps, ClickAwayListener, Grow, Menu, MenuItem, MenuList, Paper, Popper } from "@mui/material";
import React from 'react';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

interface SplitButtonAction {
    id?: string
    title: React.ReactNode
    disabled?: boolean
    onClick?: () => void
}

interface DropDownButtonProps {
    title: React.ReactNode;
    options: SplitButtonAction[];
    sx?: ButtonProps['sx'];
    variant?: ButtonProps['variant'];
}
function DropDownButton(props: DropDownButtonProps) {
    const { title, options, sx, variant } = props;

    const [open, setOpen] = useState(false);
    const anchorRef = useRef(null);


    const handleClick = (action: SplitButtonAction['onClick']) => {
        handleClose();
        action?.();
    };

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <Button
                variant={variant}
                ref={anchorRef}
                sx={sx}
                size="small"
                onClick={handleToggle}
            >
                {title}
                <ArrowDropDownIcon />
            </Button>
            <Popper
                sx={{ zIndex: 10 }}
                open={open}
                anchorEl={anchorRef.current}
                transition
                disablePortal
            >
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin:
                                placement === 'bottom' ? 'center top' : 'center bottom',
                        }}
                    >
                        <Paper>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList autoFocusItem>
                                    {options.map((option, index) => (
                                        <MenuItem
                                            key={option.title + "_buttonselection"}
                                            onClick={() => handleClick(option.onClick)}
                                            disabled={option.disabled}
                                        >
                                            {option.title}
                                        </MenuItem>
                                    ))}
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </>
    );
}

export default DropDownButton;