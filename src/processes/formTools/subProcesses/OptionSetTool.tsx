import { Tooltip, Stack, Button } from '@mui/material';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ComponentContainer from '../../../utils/components/ComponentContainer';
import { SubProcessProps } from '../main';


import TurnedInIcon from '@mui/icons-material/TurnedIn';
import TurnedInNotIcon from '@mui/icons-material/TurnedInNot';
import { ControlType } from '../../../utils/types/ControlType';
import StyleIcon from '@mui/icons-material/Style';
import StyleOutlinedIcon from '@mui/icons-material/StyleOutlined';
import { OptionSetValue } from '../../../utils/types/OptionSetValue';

type OptionSetToolsSubProcess = {
    enabled: boolean,
    setEnabled: React.Dispatch<React.SetStateAction<boolean>>
}
function OptionSetTool(props: SubProcessProps & { domUpdated: boolean }) {

    const [allModeEnabled, setAllModeEnabled] = useState<boolean>(false);
    const [showOptionsEnabled, setShowOptionsEnabled] = useState<boolean>(false);


    useEffect(() => {
        if (!allModeEnabled && showOptionsEnabled) {
            setAllModeEnabled(true);
            return;
        }
        if (allModeEnabled && (!showOptionsEnabled)) {
            setAllModeEnabled(false);
            return;
        }
    }, [showOptionsEnabled]);

    const toggleAll = useCallback(() => {
        const newAllMode = !allModeEnabled;
        setShowOptionsEnabled(newAllMode);
    }, [allModeEnabled]);

    return (
        <ComponentContainer
            width='100%'
            Legends={
                {
                    // top: {
                    //     component: (
                    //         <Tooltip title='Toggle all' placement='left'>
                    //             <IconButton color='primary' onClick={toggleAll} size='small'>
                    //                 {allModeEnabled ? <LabelIcon fontSize="large" /> : <LabelOutlinedIcon fontSize="large" />}
                    //             </IconButton>
                    //         </Tooltip>
                    //     ),
                    //     margin: '15px',
                    //     padding: '15px'
                    // },
                    // left: {
                    //     component: <div style={{ writingMode: 'vertical-rl' }}>LabelTools</div>
                    // }
                }
            }
        >
            <Stack spacing={1} width='calc(100% - 10px)' padding='5px'>
                <ShowOptionSetInFields
                    enabled={showOptionsEnabled}
                    setEnabled={setShowOptionsEnabled}
                    executionContext={props.executionContext}
                    executionContextUpdated={props.executionContextUpdated}
                />
            </Stack>
        </ComponentContainer>
    );
}

function ShowOptionSetInFields(props: SubProcessProps & OptionSetToolsSubProcess) {

    const { enabled: optionsDisplayed, setEnabled: setOptionsDisplayed, executionContext, executionContextUpdated } = props;


    const controls = useMemo(() => {
        if (executionContext) {
            const formContext = executionContext.getFormContext();
            const controls: Xrm.Controls.Control[] = formContext.getControl(c => c.getControlType() === ControlType.OPTIONSET);

            return controls as Xrm.Controls.OptionSetControl[];
        }
        else {
            return null;
        }
    }, [executionContextUpdated]);

    useEffect(() => {
        if (!controls || !executionContext) return;

        Xrm.Utility.getEntityMetadata(executionContext.getFormContext().data.entity.getEntityName(), controls.map(c => c.getName())).then(entityMetadata => {
            const attributes = entityMetadata.Attributes;
            controls.forEach((control) => {
                const fieldMetadata = attributes.get(control.getName());
                if (fieldMetadata) {
                    const options: OptionSetValue[] = Object.values(fieldMetadata.OptionSet) as any[];
                    control.clearOptions();
                    options.forEach((option, index) => {
                        control.addOption({
                            text: (optionsDisplayed ? `${option.value} - ` : '') + option.text,
                            value: option.value
                        }, index + 1);
                    });
                }
            })
        })
    }, [controls, optionsDisplayed]);


    const toggleOptionsDisplay = () => {
        setOptionsDisplayed((prev) => !prev);
    }

    return (<>
        <Tooltip title='Display Options' placement='left'>
            <Button
                variant='contained'
                onClick={toggleOptionsDisplay}
                startIcon={optionsDisplayed ? <StyleIcon /> : <StyleOutlinedIcon />}
            />
        </Tooltip>
    </>
    );
}

export default OptionSetTool;