import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import React, { useState, useEffect, useCallback } from 'react';
import ComponentContainer from '../../../utils/components/ComponentContainer';
import { SubProcessProps } from '../main';
import { useCopyToClipboard } from 'usehooks-ts';
import LabelIcon from '@mui/icons-material/Label';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import ShowTabLabel from '../buttons/ShowTabLabel';
import ShowFieldLabel from '../buttons/ShowFieldLabel';
import { useStateArray } from '../../../utils/hooks/use/useStateArray';
import { SnackbarProvider } from 'notistack';

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
        <SnackbarProvider maxSnack={2} autoHideDuration={1500}>
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
                <Stack spacing={1} padding='5px'>
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
        </SnackbarProvider>
    );
}

export default LabelTools;