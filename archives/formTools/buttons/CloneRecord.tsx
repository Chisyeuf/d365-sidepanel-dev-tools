import { Tooltip, Button } from '@mui/material';
import React from 'react';
import { SubProcessProps } from '../main';

import FileCopyIcon from '@mui/icons-material/FileCopy';

function CloneRecord(props: SubProcessProps) {

    const { currentFormContext, domUpdated } = props;

    const openClonedRecord = () => {
        if (!currentFormContext?.data?.entity) return;

        var pageInput: Xrm.Navigation.PageInputEntityRecord = {
            pageType: "entityrecord",
            entityName: currentFormContext.data?.entity?.getEntityName(),
            data: currentFormContext.getAttribute().reduce((a, v) => ({ ...a, [v.getName()]: v.getValue() }), {})
        };
        var navigationOptions: Xrm.Navigation.NavigationOptions = {
            target: 2,
            height: { value: 80, unit: "%" },
            width: { value: 70, unit: "%" },
            position: 1
        };
        Xrm.Navigation.navigateTo(pageInput, navigationOptions);
    }

    return (<>
        <Tooltip title='Clone Record' placement='left'>
            <Button
                variant='contained'
                onClick={openClonedRecord}
                startIcon={<FileCopyIcon />}
            />
        </Tooltip>
    </>
    );
}

export default CloneRecord;