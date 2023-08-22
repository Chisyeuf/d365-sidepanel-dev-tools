
import { Box, Button, Divider, Drawer, List, ListItemButton, ListItemText, Tooltip } from '@mui/material';
import { Stack } from '@mui/system';
import React, { useMemo, useState, } from 'react';

// import NavigationIcon from '@mui/icons-material/Navigation';

import ComponentContainer from '../../../utils/components/ComponentContainer';
import { OldSolutionIcon, PowerAppsIcon } from './../icons';
import { RetrieveSolutions } from '../../../utils/hooks/XrmApi/RetrieveSolutions';
import { useBoolean } from 'usehooks-ts';
import FilterInput from '../../../utils/components/FilterInput';
import { SolutionItem } from '../../../utils/types/SolutionItem';

function SolutionList(props: any) {
    const { } = props;

    const [solutions, isFetching] = RetrieveSolutions();
    const [selectedSolution, setSelectedSolution] = useState<SolutionItem | null>(null);
    const { value: dialogOpened, setTrue: setDialogOpenedTrue, setFalse: setDialogOpenedFalse } = useBoolean(false);
    const [filter, setFilter] = useState<string>('');

    function handleClickPowerApps() {
        const environmentId = (Xrm.Utility.getGlobalContext().organizationSettings as any).bapEnvironmentId;
        if (!selectedSolution) {
            window.open(`https://make.powerapps.com/environments/${environmentId}/solutions/`, '_blank');
        } else {
            window.open(`https://make.powerapps.com/environments/${environmentId}/solutions/${selectedSolution.solutionid}`, '_blank');
        }
    }

    function handleClickOldSolution() {
        const clientUrl = Xrm.Utility.getGlobalContext().getClientUrl();
        if (!selectedSolution) {
            window.open(`${clientUrl}/main.aspx?settingsonly=true`, '_blank');
        } else {
            window.open(`${clientUrl}/tools/solution/edit.aspx?id=${selectedSolution.solutionid}`, '_blank');
        }
    }

    const openSolutionTooltip = useMemo(() => {
        if (selectedSolution) {
            return `Solution ${selectedSolution.displayName} selected`;
        }
        else {
            return "No solution selected";
        }
    }, [selectedSolution]);

    return (
        <>
            <ComponentContainer width='100%' Legends={{ top: { position: 'center', component: 'Solutions', padding: '5px' } }}>
                <Stack spacing={1} width='calc(100% - 10px)' padding='5px' direction='row'>

                    <Tooltip title='Solution List in old interface'>
                        <Button
                            variant='contained'
                            onClick={handleClickOldSolution}
                            startIcon={<OldSolutionIcon sx={{ backgroundColor: '#666666' }} />}
                        />
                    </Tooltip>

                    <Tooltip title='Solution List in PowerApps'>
                        <Button
                            variant='outlined'
                            onClick={handleClickPowerApps}
                            startIcon={<PowerAppsIcon />}
                        />
                    </Tooltip>
                </Stack>
                <Tooltip title={openSolutionTooltip} >
                    <Button
                        sx={{
                            maxWidth: 'unset',
                            fontSize: '0.7em'
                        }}
                        onClick={setDialogOpenedTrue}
                    >
                        Select Solution
                    </Button>
                </Tooltip>
            </ComponentContainer>

            <Drawer
                anchor={'right'}
                open={dialogOpened}
                onClose={setDialogOpenedFalse}
                sx={{
                    width: '25%'
                }}
            >
                <Box
                    padding={1}
                >
                    <FilterInput fullWidth placeholder='Filter by name' returnFilterInput={setFilter} forcedValue={filter} />
                </Box>
                <Divider />
                <List sx={{ width: '25vw', overflowY: 'scroll' }}>
                    <ListItemButton onClick={() => { setSelectedSolution(null); setDialogOpenedFalse() }} dense>
                        <ListItemText
                            primary={"---"}
                        />
                    </ListItemButton>
                    {
                        solutions.map((solutionItem) => {
                            if (!solutionItem.displayName.toLowerCase().includes(filter.toLowerCase())) {
                                return null;
                            }

                            return (
                                <ListItemButton
                                    sx={selectedSolution?.solutionid === solutionItem.solutionid ? { backgroundColor: '#b0b0b0' } : {}}
                                    onClick={() => { setSelectedSolution(solutionItem); setDialogOpenedFalse() }}
                                    dense
                                >
                                    <ListItemText
                                        primary={solutionItem.displayName}
                                        secondary={solutionItem.uniqueName}
                                    />
                                </ListItemButton>
                            );
                        })
                    }
                </List>
            </Drawer>
        </>
    )
}

export default SolutionList;