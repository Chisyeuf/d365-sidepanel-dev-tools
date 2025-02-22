import { useState, useEffect, useMemo, useContext } from 'react';

import { ControlType } from '../../../utils/types/ControlType';
import StyleIcon from '@mui/icons-material/Style';
import StyleOutlinedIcon from '@mui/icons-material/StyleOutlined';
import { OptionSetValue } from '../../../utils/types/OptionSetValue';
import { IToolButtonStandard, ToolButton } from '../ToolButton';
import { FormToolContext } from '../context';


function ShowOptionSetInFields(props: IToolButtonStandard) {

    const { formContext } = useContext(FormToolContext);
    const [optionsDisplayed, setOptionsDisplayed] = useState<boolean>(false);


    const controls = useMemo(() => {
        if (formContext) {
            const controls: Xrm.Controls.Control[] = formContext.getControl(c => c.getControlType() === ControlType.OPTIONSET);

            return controls as Xrm.Controls.OptionSetControl[];
        }
        else {
            return null;
        }
    }, [formContext]);

    useEffect(() => {
        if (!controls || !formContext?.data?.entity) return;

        Xrm.Utility.getEntityMetadata(formContext.data?.entity?.getEntityName(), controls.map(c => (c as any).controlDescriptor.DataFieldName)).then(entityMetadata => {
            const attributes = entityMetadata.Attributes;
            controls?.forEach((control) => {
                const fieldMetadata = attributes.get((control as any).controlDescriptor.DataFieldName as string);
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
    }, [controls, formContext, optionsDisplayed]);


    const toggleOptionsDisplay = () => {
        setOptionsDisplayed((prev) => !prev);
    }

    return (
        <ToolButton
            controlled={true}
            icon={optionsDisplayed ? <StyleIcon /> : <StyleOutlinedIcon />}
            tooltip='Display OptionSet Values'
            setEnabled={toggleOptionsDisplay}
        />
    );
}

export default ShowOptionSetInFields;