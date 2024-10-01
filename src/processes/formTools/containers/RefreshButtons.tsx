import { Stack } from '@mui/material';
import React, {  } from 'react';
import ComponentContainer from '../../../utils/components/ComponentContainer';
import { SubProcessProps } from '../main';
import RefreshRibbon from '../buttons/RefreshRibbon';
import RefreshForm from '../buttons/RefreshForm';

const toolList: ((props: SubProcessProps) => JSX.Element)[] = [RefreshRibbon, RefreshForm];

export type LabelToolsSubProcess = {
    enabled: boolean,
    setEnabled: React.Dispatch<React.SetStateAction<boolean>>
    domUpdated: boolean,
    copyToClipboard: (text: string) => Promise<boolean>,
}
function RefreshButtons(props: SubProcessProps) {

    return (
        <ComponentContainer
            width='100%'
            Legends={
                {
                    left: {
                        component: <div style={{ writingMode: 'vertical-rl' }}>Refresh</div>
                    }
                }
            }
        >
            <Stack spacing={1}  padding='5px'>
                {
                    toolList.map((Tool, index) => {
                        return (
                            <Tool
                                currentFormContext={props.currentFormContext}
                                domUpdated={props.domUpdated ?? false}
                            />
                        )
                    })
                }
            </Stack>
        </ComponentContainer>
    );
}


export default RefreshButtons;