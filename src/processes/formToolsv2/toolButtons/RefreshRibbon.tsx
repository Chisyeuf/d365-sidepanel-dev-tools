import { useCallback, useContext } from 'react';
import TabUnselectedIcon from '@mui/icons-material/TabUnselected';
import { IToolButtonStandard, ToolButton } from '../ToolButton';
import { FormToolContext } from '../context';


function RefreshRibbon(props: IToolButtonStandard) {

    const { formContext } = useContext(FormToolContext);

    const refreshRibbonCallback = useCallback(() => {
        formContext?.ui.refreshRibbon(true);
    }, [formContext]);

    return (
        <ToolButton
            controlled={false}
            icon={<TabUnselectedIcon />}
            tooltip='Refresh Ribbon'
            onClick={refreshRibbonCallback}
        />
    );
}

export default RefreshRibbon;