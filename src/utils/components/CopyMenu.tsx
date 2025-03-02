import { useCallback } from 'react'
import { Menu, MenuItem } from "@mui/material";
import useCopyWithSnack from '../hooks/use/useCopyWithSnack';

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

    const copy = useCopyWithSnack({ callback: onClose });

    const handleOnClick = useCallback((value: string) => {
        copy(value);
    }, [copy]);

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