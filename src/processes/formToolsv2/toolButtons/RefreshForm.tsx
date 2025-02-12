import { useCallback, useContext } from 'react';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import { IToolButtonStandard, ToolButton } from '../ToolButton';
import { FormToolContext } from '../context';


function RefreshForm(props: IToolButtonStandard) {

    const { formContext } = useContext(FormToolContext);

    const refreshFromData = useCallback(() => {
        formContext?.data.refresh(false);
    }, [formContext]);

    return (
        <ToolButton
            controlled={false}
            icon={<ViewQuiltIcon />}
            tooltip='Refresh Form Data'
            onClick={refreshFromData}
        />
    );
}

export default RefreshForm;