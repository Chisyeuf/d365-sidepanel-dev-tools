import { useCallback, useEffect, useRef, useState } from 'react'
import { Button, ButtonGroup, ClickAwayListener, Grow, Menu, MenuItem, MenuList, Paper, Popper } from "@mui/material";
import React from 'react';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

interface SplitButtonAction {
    id?: string
    title: React.ReactNode
    action: () => void
    disabled?: boolean
    onSelect?: () => void
}

interface SplittedDropDownButtonProps {
    options: SplitButtonAction[];
    defaultActionIndex?: number;
    actionIndex?: number;
}
function SplittedDropDownButton(props: SplittedDropDownButtonProps) {
    const { options, defaultActionIndex, actionIndex } = props;

    const [open, setOpen] = useState(false);
    const anchorRef = useRef<HTMLDivElement>(null);
    const [selectedIndex, setSelectedIndex] = useState(defaultActionIndex ?? 0);


    useEffect(() => {
        if (!actionIndex) {
            setSelectedIndex(0);
        }
        else if (actionIndex >= options.length) {
            setSelectedIndex(options.length - 1);
        }
        else {
            setSelectedIndex(actionIndex);
        }
    }, [actionIndex, options.length]);

    useEffect(() => {
        options[selectedIndex]?.onSelect?.();
    }, [options, selectedIndex]);
    

    const handleMenuItemClick = (
        index: number,
    ) => {
        setSelectedIndex(index);
        setOpen(false);
    };

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event: Event) => {
        if (
            anchorRef.current &&
            anchorRef.current.contains(event.target as HTMLElement)
        ) {
            return;
        }

        setOpen(false);
    };

    return (
        <>
            <ButtonGroup
                variant="contained"
                ref={anchorRef}
                fullWidth
            >
                <Button onClick={options[selectedIndex].action}>{options[selectedIndex].title}</Button>
                <Button
                    size="small"
                    onClick={handleToggle}
                    sx={{ width: 40 }}
                >
                    <ArrowDropDownIcon />
                </Button>
            </ButtonGroup>
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
                                            selected={index === selectedIndex}
                                            onClick={() => handleMenuItemClick(index)}
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

export default SplittedDropDownButton;