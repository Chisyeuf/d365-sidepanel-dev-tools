import { Tooltip, IconButton, Stack, styled, Typography } from '@mui/material';
import React, { useState, useEffect, useCallback } from 'react';
import ComponentContainer from '../../../utils/components/ComponentContainer';
import { SubProcessProps } from '../main';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useCopyToClipboard } from 'usehooks-ts';
import LabelIcon from '@mui/icons-material/Label';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import ShowTabLabel from '../buttons/ShowTabLabel';
import ShowFieldLabel from '../buttons/ShowFieldLabel';
import { useStateArray } from '../../../utils/hooks/use/useStateArray';

const toolList: ((props: SubProcessProps & LabelToolsSubProcess) => JSX.Element)[] = [ShowTabLabel, ShowFieldLabel];

export type LabelToolsSubProcess = {
    enabled: boolean,
    setEnabled: React.Dispatch<React.SetStateAction<boolean>>
    domUpdated: boolean,
    copyToClipboard: (text: string) => Promise<boolean>,
}
function LabelTools(props: SubProcessProps) {

    const [value, copy] = useCopyToClipboard();

    const [labelShownArray, setLabelShownArray, setAllLabelShownArray] = useStateArray<boolean>(toolList.length, false);

    const [allModeEnabled, setAllModeEnabled] = useState<boolean>(false);


    useEffect(() => {
        if (!allModeEnabled && labelShownArray.every(modes => modes)) {
            setAllModeEnabled(true);
            return;
        }
        if (allModeEnabled && !labelShownArray.every(modes => modes)) {
            setAllModeEnabled(false);
            return;
        }
    }, [labelShownArray]);

    const toggleAll = useCallback(() => {
        const newAllMode = !allModeEnabled;
        setAllLabelShownArray(newAllMode);
    }, [allModeEnabled]);

    return (
        <ComponentContainer
            width='100%'
            Legends={
                {
                    top: {
                        component: (
                            <Tooltip title='Toggle all' placement='left'>
                                <IconButton color='primary' onClick={toggleAll} size='small'>
                                    {allModeEnabled ? <LabelIcon fontSize="large" /> : <LabelOutlinedIcon fontSize="large" />}
                                </IconButton>
                            </Tooltip>
                        ),
                        margin: '15px',
                        padding: '15px'
                    },
                    left: {
                        component: <div style={{ writingMode: 'vertical-rl' }}>LabelTools</div>
                    }
                }
            }
        >
            <Stack spacing={1} width='calc(100% - 10px)' padding='5px'>
                {
                    toolList.map((Tool, index) => {
                        return (
                            <Tool
                                enabled={labelShownArray[index]}
                                setEnabled={setLabelShownArray[index]}
                                currentFormContext={props.currentFormContext}
                                domUpdated={props.domUpdated ?? false}
                                copyToClipboard={copy}
                            />
                        )
                    })
                }
            </Stack>
        </ComponentContainer>
    );
}

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

export function LogicalNameTypography(props: { label: string, onClick: (text: string) => any }) {

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

export default LabelTools;