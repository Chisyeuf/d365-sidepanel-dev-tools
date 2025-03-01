import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/system/Stack';
import { useMemo } from 'react';

import ComponentContainer from '../../../utils/components/ComponentContainer';
import { PowerAppsIcon } from '../icons';
import { NavigationButton } from '../../../utils/types/NavigationButton';
import { RetrieveFirstRecordInterval } from '../../../utils/hooks/XrmApi/RetrieveFirstRecordInterval';
import RedDisabledButton from '../../../utils/components/RedDisabledButton';
import D365RibbonHomePageIcon from '../../../utils/components/D365RibbonHomePageIcon';
import { RetrieveObjectTypeCodeByName } from '../../../utils/hooks/XrmApi/RetrieveObjectTypeCodeByName';
import { useFormContextDocument } from '../../../utils/hooks/use/useFormContextDocument';

function FormEditor(props: NavigationButton) {
    const { environmentId, clientUrl } = props;

    const { formContext } = useFormContextDocument();

    const [defaultSolution, isFetchingDefaultSolution] = RetrieveFirstRecordInterval('solution', ['solutionid'], 'isvisible eq true', 'installedon asc');

    const currentFormName = useMemo(() => formContext?.ui?.formSelector?.getCurrentItem().getLabel(), [formContext]);
    const currentFormId = useMemo(() => formContext?.ui?.formSelector?.getCurrentItem().getId(), [formContext]);
    const currentEntityName = useMemo(() => formContext?.data?.entity?.getEntityName(), [formContext]);
    const defaultSolutionId = useMemo(() => defaultSolution?.solutionid as string | undefined, [defaultSolution]);
    const [currentEntityTypeCode, isFetchingTypeCode] = RetrieveObjectTypeCodeByName(currentEntityName ?? '');


    const powerAppsDisabled = useMemo(() => !environmentId || !defaultSolutionId || !currentFormId || !currentEntityName, [environmentId, defaultSolutionId, currentFormId, currentEntityName]);
    const oldInterfaceDisabled = useMemo(() => !currentFormId || !currentEntityTypeCode, [currentFormId, currentEntityTypeCode]);


    function handleClickPowerApps() {
        if (defaultSolutionId && currentFormId && currentEntityName) {
            window.open(`https://make.powerapps.com/e/${environmentId}/s/${defaultSolutionId}/entity/${currentEntityName}/form/edit/${currentFormId}`, '_blank');
        }
    }

    function handleClickOldSolution() {
        if (currentFormId) {
            window.open(`${clientUrl}/main.aspx?pagetype=formeditor&etc=${currentEntityTypeCode}&extraqs=formtype%3dmain%26formId%3d${currentFormId}`, '_blank');
        }
    }

    return (
        <ComponentContainer width='100%' Legends={{
            top: { position: 'center', component: 'Form Editor', padding: '5px', margin: '20px' },
            bottom: {
                position: 'center',
                component: (
                    currentFormName ?
                        <Box sx={{ overflow: 'hidden', maxWidth: '100%', flex: '1 0 auto' }}>
                            <Typography title={currentFormName} overflow='hidden' textOverflow='ellipsis'>{currentFormName}</Typography>
                        </Box>
                        :
                        <i>Unavailable</i>),
                padding: '5px',
                margin: '10px'
            }
        }}>
            <Stack spacing={2} padding='5px' direction='row' justifyContent='center'>

                <Tooltip placement='top' title={`Edit ${currentFormName} form in old interface`} disableInteractive arrow>
                    <Box>
                        <RedDisabledButton
                            disabled={oldInterfaceDisabled}
                            variant='outlined'
                            onClick={handleClickOldSolution}
                            startIcon={<D365RibbonHomePageIcon iconX={-477} iconY={-521} width={20} />}
                            buttonSx={{
                                gap: '0.4em',
                                p: 0.5,
                                fontSize: '0.8em',
                                justifyContent: 'flex-start',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                            }}
                        />
                    </Box>
                </Tooltip>

                <Tooltip placement='top' title={`Edit ${currentFormName} form in PowerApps`} disableInteractive arrow>
                    <Box>
                        <RedDisabledButton
                            disabled={powerAppsDisabled}
                            variant='outlined'
                            onClick={handleClickPowerApps}
                            startIcon={<PowerAppsIcon />}
                            buttonSx={{
                                gap: '0.4em',
                                p: 0.5,
                                fontSize: '0.8em',
                                justifyContent: 'flex-start',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                            }}
                        />
                    </Box>
                </Tooltip>
            </Stack>
        </ComponentContainer>
    )
}

export default FormEditor;