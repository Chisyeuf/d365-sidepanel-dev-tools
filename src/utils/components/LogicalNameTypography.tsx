import { Stack, styled, Tooltip, TooltipProps, Typography } from '@mui/material';
import React, {  } from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import useCopyWithSnack from '../hooks/use/useCopyWithSnack';

const LogicalNameRoot = styled(Stack<'span'>)(({ theme }) => ({
    fontSize: '11.2px',
    lineHeight: '1.1em',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'color 200ms cubic-bezier(0.76, 0, 0.24, 1) 0s',
}));
const LogicalNameTypoRoot = styled(Typography)(({ theme }) => ({
    fontSize: 'inherit',
    lineHeight: 'inherit',
    color: 'inherit',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
}));

export function LogicalNameTypography(props: { label: string, width?: number, placement?: TooltipProps['placement'] }) {

    const copyFn = useCopyWithSnack({textPrefix: 'Control name'});

    const onClick = (event: React.MouseEvent) => {
        copyFn(props.label);
        event.stopPropagation();
    }

    return (
        <Tooltip title={props.label} placement={props.placement ?? 'left'} disableInteractive>
            <LogicalNameRoot
                component='span'
                spacing={0.5}
                width={props.width ?? 'unset'}
                direction='row'
                alignItems='center'
                onClick={onClick}
            >
                <ContentCopyIcon fontSize='inherit' color='inherit' />
                <LogicalNameTypoRoot title={props.label} variant='caption' fontSize='inherit' lineHeight='inherit' color='inherit'>
                    {props.label}
                </LogicalNameTypoRoot>
            </LogicalNameRoot>
        </Tooltip>
    );
}