
import { Button, Tooltip } from '@mui/material';
import { Stack } from '@mui/system';
import React, { useMemo } from 'react';

// import NavigationIcon from '@mui/icons-material/Navigation';

import ComponentContainer from '../../../utils/components/ComponentContainer';
import { PowerAppsIcon, PowerEnvironmentIcon } from '../icons';
import { NavigationButton } from '../../../utils/types/NavigationButton';
import { useCurrentFormContext } from '../../../utils/hooks/use/useCurrentFormContext';
import { RetrieveFirstRecordInterval } from '../../../utils/hooks/XrmApi/RetrieveFirstRecordInterval';
import D365NavBarIcon from '../../../utils/components/D365NavBarIcon';
import RedDisabledButton from '../../../utils/components/RedDisabledButton';
import D365RibbonHomePageIcon from '../../../utils/components/D365RibbonHomePageIcon';

function FormEditor(props: NavigationButton) {
    const { environmentId, clientUrl } = props;

    const formContext = useCurrentFormContext();

    const [defaultSolution, isFetchingDefaultSolution,] = RetrieveFirstRecordInterval('solution', ['solutionid'], 'isvisible eq true', 'installedon asc');

    const currentFormName = useMemo(() => formContext?.ui?.formSelector?.getCurrentItem().getLabel(), [formContext]);
    const currentFormId = useMemo(() => formContext?.ui?.formSelector?.getCurrentItem().getId(), [formContext]);
    const currentEntityName = useMemo(() => formContext?.data?.entity?.getEntityName(), [formContext]);
    const defaultSolutionId = useMemo(() => defaultSolution?.solutionid as string | undefined, [defaultSolution]);


    const powerAppsEnabled = useMemo(() => !!defaultSolutionId && !!currentFormId && !!currentEntityName, [defaultSolutionId, currentFormId, currentEntityName]);
    const oldInterfaceEnabled = useMemo(() => !!currentFormId, [currentFormId]);


    function handleClickPowerApps() {
        if (defaultSolutionId && currentFormId && currentEntityName) {
            window.open(`https://make.powerapps.com/e/${environmentId}/s/${defaultSolutionId}/entity/${currentEntityName}/form/edit/${currentFormId}`, '_blank');
        }
    }

    function handleClickOldSolution() {
        if (currentFormId) {
            window.open(`${clientUrl}/main.aspx?pagetype=formeditor&etc=8&extraqs=formtype%3dmain%26formId%3d${currentFormId}`, '_blank');
        }
    }

    return (
        <>
            <ComponentContainer width='100%' Legends={{
                top: { position: 'center', component: 'Form Editor', padding: '10px' },
                bottom: { position: 'center', component: (currentFormName ?? "Unavailable"), padding: '5px' }
            }}>
                <Stack spacing={2} padding='5px' direction='row' justifyContent='center'>

                    <Tooltip placement='top' title={`Edit ${currentFormName} form in old interface`}>
                        <RedDisabledButton
                            disabled={!powerAppsEnabled}
                            variant='outlined'
                            onClick={handleClickOldSolution}
                            startIcon={<D365RibbonHomePageIcon iconX={-477} iconY={-521} width={20} />}
                            sx={{
                                width: '35%'
                            }}
                            buttonSx={{
                                width: '100%',
                                gap: '0.4em',
                                padding: '5px 10px',
                                fontSize: '0.8em',
                                justifyContent: 'flex-start',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                            }}
                        />
                    </Tooltip>

                    <Tooltip placement='top' title={`Edit ${currentFormName} form in PowerApps`}>
                        <RedDisabledButton
                            disabled={!oldInterfaceEnabled}
                            variant='outlined'
                            onClick={handleClickPowerApps}
                            startIcon={<PowerAppsIcon />}
                            sx={{
                                width: '35%'
                            }}
                            buttonSx={{
                                width: '100%',
                                gap: '0.4em',
                                padding: '5px 10px',
                                fontSize: '0.8em',
                                justifyContent: 'flex-start',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                            }}
                        />
                    </Tooltip>
                </Stack>
            </ComponentContainer>
        </>
    )
}

export default FormEditor;