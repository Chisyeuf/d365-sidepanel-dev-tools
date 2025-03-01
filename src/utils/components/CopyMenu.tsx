import { useCallback } from 'react'
import { Menu, MenuItem } from "@mui/material";
import React from 'react';
import { useCopyToClipboard } from 'usehooks-ts';
import { useSnackbar } from 'notistack';

interface CopyMenuProps {
    onClose?: () => void,
    anchorElement?: Element | (() => Element) | null,
    items: {
        title: string,
        content: string
    }[]
}
function CopyMenu(props: CopyMenuProps) {
    const { onClose, anchorElement, items } = props;
    
    const { enqueueSnackbar } = useSnackbar();
    const [, copy] = useCopyToClipboard();

    const handleOnClick = useCallback((value: string) => {
        copy(value);
        enqueueSnackbar(`Value "${value}" copied.`, { variant: 'default' });
        onClose?.();
    }, [copy, enqueueSnackbar, onClose]);

    return (
        <>
            <Menu
                anchorEl={anchorElement}
                open={!!anchorElement}
                onClose={onClose}
            >
                {
                    items.map(item => {
                        if (item.content !== undefined) {
                            return (
                                <MenuItem onClick={() => handleOnClick(item.content)}>Copy {item.title}</MenuItem>
                            );
                        }
                        else {
                            return null;
                        }
                    })
                }

            </Menu>
        </>
    );
}

export default CopyMenu;