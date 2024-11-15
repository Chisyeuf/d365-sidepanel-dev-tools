import { Fab } from '@mui/material';
import React, { useRef, useState } from 'react';
import { Virtuoso, VirtuosoHandle, VirtuosoProps } from 'react-virtuoso';

import UpIcon from '@mui/icons-material/KeyboardArrowUp';


interface MuiVirtuosoProps<ItemData = any, Context = any> extends VirtuosoProps<ItemData, Context> {
    hideFab?: boolean
    scrollTopLimitToHideFab?: number
}

function MuiVirtuoso<ItemData = any, Context = any>(props: MuiVirtuosoProps<ItemData, Context> & {
    ref?: React.Ref<VirtuosoHandle>;
}) {
    const { hideFab,scrollTopLimitToHideFab, style, onScroll, ...virtuosoProps } = props;


    const [scrollTop, setScrollTop] = useState<number>(0);
    const ref = useRef<VirtuosoHandle>(null);

    return (
        <>
            <Virtuoso
                ref={ref}
                onScroll={(e) => { setScrollTop((e.target as HTMLElement).scrollTop); onScroll?.(e); }}
                style={{
                    width: '100%',
                    overflowX: 'hidden',
                    ...style
                }}
                {...virtuosoProps}
            />
            {
                !hideFab &&
                <Fab
                    sx={{
                        position: 'absolute',
                        bottom: 16,
                        right: 16,
                        opacity: 0.5,
                        display: scrollTop > (scrollTopLimitToHideFab ?? 0) ? 'auto' : 'none',
                        cursor: 'pointer'
                    }}
                    color='primary'
                    size='medium'
                    onClick={() => {
                        ref.current?.scrollToIndex({
                            index: 0,
                            behavior: 'smooth'
                        });
                    }}
                >
                    <UpIcon />
                </Fab>
            }
        </>
    );
}

export default MuiVirtuoso;