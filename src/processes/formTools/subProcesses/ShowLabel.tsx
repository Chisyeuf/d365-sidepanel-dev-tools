import InfoIcon from '@mui/icons-material/Info';
import { Tooltip, IconButton, Stack } from '@mui/material';
import React, { useState, useEffect, useCallback } from 'react';
import ComponentContainer from '../../../utils/components/ComponentContainer';
import { SubProcessProps } from '../main';
import { EnableMode, VisibleMode, OptionalMode } from './GodMode';

type GodModeSubProcess = {
    enabled: boolean,
    setEnabled: React.Dispatch<React.SetStateAction<boolean>>
}
function GodMode(props: SubProcessProps) {

    const [allModeEnabled, setAllModeEnabled] = useState<boolean>(false);

    const [enableModeEnable, setEnableMode] = useState<boolean>(false);
    const [optionalModeEnable, setOptionalMode] = useState<boolean>(false);
    const [visibleModeEnable, setVisibleMode] = useState<boolean>(false);

    useEffect(() => {
        if (!allModeEnabled && enableModeEnable && optionalModeEnable && visibleModeEnable) {
            setAllModeEnabled(true);
            return;
        }
        if (allModeEnabled && (!enableModeEnable || !optionalModeEnable || !visibleModeEnable)) {
            setAllModeEnabled(false);
            return;
        }
    }, [enableModeEnable, optionalModeEnable, visibleModeEnable]);

    const toggleAll = useCallback(() => {
        const newAllMode = !allModeEnabled;
        setEnableMode(newAllMode);
        setOptionalMode(newAllMode);
        setVisibleMode(newAllMode);
    }, [allModeEnabled]);


    return (
        <ComponentContainer
            width='100%'
            Legends={
                {
                    top: {
                        component: (
                            <Tooltip title='Toggle all' placement='left'>
                                <IconButton color='primary' onClick={toggleAll}>
                                    {allModeEnabled ? <InfoIcon /> : <InfoIcon />}
                                </IconButton>
                            </Tooltip>
                        ),
                        margin: '30px',
                        padding: '15px'
                    },
                    left: {
                        component: <div style={{ writingMode: 'vertical-rl' }}>GodMode</div>
                    }
                }
            }
        >
            <Stack spacing={1} width='calc(100% - 10px)' padding='5px'>
                <EnableMode executionContext={props.executionContext} enabled={enableModeEnable} setEnabled={setEnableMode} />
                <VisibleMode executionContext={props.executionContext} enabled={visibleModeEnable} setEnabled={setVisibleMode} />
                <OptionalMode executionContext={props.executionContext} enabled={optionalModeEnable} setEnabled={setOptionalMode} />
            </Stack>
        </ComponentContainer>
    );
}