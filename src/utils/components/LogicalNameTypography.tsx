import { Stack, styled, Typography } from '@mui/material';
import React, { useState } from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const LogicalNameRoot = styled(Stack<'span'>)(({ theme }) => ({
    // color: theme.palette.text.secondary,
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
}))

export function LogicalNameTypography(props: { label: string, onClick: (text: string) => any, width?: number }) {

    const [clicked, setClicked] = useState<boolean>(false);

    const onClick = () => {
        setClicked(true);
        props.onClick(props.label);
        setTimeout(() => {
            setClicked(false);
        }, 200);
    }

    return (
        <LogicalNameRoot
            component='span'
            spacing={0.5}
            width={props.width ?? 'auto'}
            direction='row'
            alignItems='center'
            onClick={onClick}
            color={(theme) => clicked ? theme.palette.primary.dark : theme.palette.text.secondary}>
            <ContentCopyIcon fontSize='inherit' color='inherit' />
            <LogicalNameTypoRoot title={props.label} variant='caption' fontSize='inherit' lineHeight='inherit' color='inherit'>
                {props.label}
            </LogicalNameTypoRoot>
        </LogicalNameRoot>

    );
}