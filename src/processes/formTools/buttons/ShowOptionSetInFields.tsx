import { Tooltip, Button } from '@mui/material';
import React, { useState, useEffect, useMemo } from 'react';
import { SubProcessProps } from '../main';


import { ControlType } from '../../../utils/types/ControlType';
import StyleIcon from '@mui/icons-material/Style';
import StyleOutlinedIcon from '@mui/icons-material/StyleOutlined';
import { OptionSetValue } from '../../../utils/types/OptionSetValue';

function ShowOptionSetInFields(props: SubProcessProps) {

    const { currentFormContext } = props;

    const [optionsDisplayed, setOptionsDisplayed] = useState<boolean>(false);


    const controls = useMemo(() => {
        if (currentFormContext) {
            const controls: Xrm.Controls.Control[] = currentFormContext.getControl(c => c.getControlType() === ControlType.OPTIONSET);

            return controls as Xrm.Controls.OptionSetControl[];
        }
        else {
            return null;
        }
    }, [currentFormContext]);

    useEffect(() => {
        if (!controls || !currentFormContext) return;

        Xrm.Utility.getEntityMetadata(currentFormContext.data.entity.getEntityName(), controls.map(c => c.getName())).then(entityMetadata => {
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

export default ShowOptionSetInFields;