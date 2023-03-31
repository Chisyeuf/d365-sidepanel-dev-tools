
import { IconButton, Tooltip } from '@mui/material';
import { Stack } from '@mui/system';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { SubProcessProps } from '../main';
import ComponentContainer from '../../../utils/components/ComponentContainer';

import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import { OptionalMode } from '../buttons/OptionalMode';
import { EnableMode } from '../buttons/EnableMode';
import VisibleMode from '../buttons/VisibleMode';
import { useStateArray } from '../../../utils/hooks/use/useStateArray';


const toolList: ((props: SubProcessProps & GodModeSubProcess) => JSX.Element)[] = [OptionalMode, EnableMode, VisibleMode];

export type GodModeSubProcess = {
    enabled: boolean,
    setEnabled: ((value: boolean) => void)//React.Dispatch<React.SetStateAction<boolean>>
}
function GodMode(props: SubProcessProps) {

    const [allModeEnabled, setAllModeEnabled] = useState<boolean>(false);

    const [modesArrayEnabled, setModesArrayEnabled, setAllModesArrayEnabled] = useStateArray<boolean>(toolList.length, false);

    useEffect(() => {
        if (!allModeEnabled && modesArrayEnabled.every(modes => modes)) {
            setAllModeEnabled(true);
            return;
        }
        if (allModeEnabled && !modesArrayEnabled.every(modes => modes)) {
            setAllModeEnabled(false);
            return;
        }
    }, [modesArrayEnabled]);

    const toggleAll = useCallback(() => {
        const newAllMode = !allModeEnabled;
        setAllModesArrayEnabled(newAllMode);
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
                                    {allModeEnabled ? <TipsAndUpdatesIcon fontSize="large" /> : <TipsAndUpdatesOutlinedIcon fontSize="large" />}
                                </IconButton>
                            </Tooltip>
                        ),
                        margin: '15px',
                        padding: '15px'
                    },
                    left: {
                        component: <div style={{ writingMode: 'vertical-rl' }}>GodMode</div>
                    }
                }
            }
        >
            <Stack spacing={1} width='calc(100% - 10px)' padding='5px'>
                {
                    toolList.map((Tool, index) => {
                        return (
                            <Tool
                                currentFormContext={props.currentFormContext}
                                enabled={modesArrayEnabled[index]}
                                setEnabled={setModesArrayEnabled[index]}
                            />
                        )
                    })
                }
            </Stack>
        </ComponentContainer>
    );
}

export type FormControlState<T> = {
    name: string
    defaultState: T
}




export default GodMode;