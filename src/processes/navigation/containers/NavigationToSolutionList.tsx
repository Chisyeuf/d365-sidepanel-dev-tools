
import { Box, Button, Divider, Drawer, List, ListItemButton, ListItemText, Tooltip } from '@mui/material';
import { Stack } from '@mui/system';
import React, { useMemo, useRef, useState, } from 'react';

// import NavigationIcon from '@mui/icons-material/Navigation';

import ComponentContainer from '../../../utils/components/ComponentContainer';
import { PowerAppsIcon } from './../icons';
import { RetrieveSolutions } from '../../../utils/hooks/XrmApi/RetrieveSolutions';
import { useBoolean } from 'usehooks-ts';
import FilterInput, { AttributeFilterInputRef } from '../../../utils/components/FilterInput';
import { SolutionItem } from '../../../utils/types/SolutionItem';
import { NavigationButton } from '../../../utils/types/NavigationButton';
import D365NavBarIcon from '../../../utils/components/D365NavBarIcon';

function SolutionList(props: NavigationButton) {
    const { environmentId, clientUrl } = props;

    const [solutions, isFetching] = RetrieveSolutions();
    const [selectedSolution, setSelectedSolution] = useState<SolutionItem | null>(null);
    const { value: dialogOpened, setTrue: setDialogOpenedTrue, setFalse: setDialogOpenedFalse } = useBoolean(false);
    const [filter, setFilter] = useState<string>('');

    const inputRef = useRef<AttributeFilterInputRef>(null);

    function handleClickPowerApps() {
        if (!selectedSolution) {
            window.open(`https://make.powerapps.com/environments/${environmentId}/solutions/`, '_blank');
        } else {
            window.open(`https://make.powerapps.com/environments/${environmentId}/solutions/${selectedSolution.solutionid}`, '_blank');
        }
    }

    function handleClickOldSolution() {
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
                <Stack spacing={1} width='100%' padding='5px' direction='column'>

                    <Tooltip placement='top' title='Solution List in old interface'>
                        <Button
                            variant='outlined'
                            onClick={handleClickOldSolution}
                            startIcon={<D365NavBarIcon iconX={-239} iconY={-1} width={20} />}
                            sx={{
                                width: '100%',
                                maxWidth: 'calc(100% - 10px)',
                                gap: '0.4em',
                                padding: '5px 10px',
                                fontSize: '0.8em',
                            }}
                        >
                            {selectedSolution?.displayName ? selectedSolution.displayName : "Solution List"}
                        </Button>
                    </Tooltip>

                    <Tooltip placement='top' title='Solution List in PowerApps'>
                        <Button
                            variant='outlined'
                            onClick={handleClickPowerApps}
                            startIcon={<PowerAppsIcon />}
                            sx={{
                                width: '100%',
                                maxWidth: 'calc(100% - 10px)',
                                gap: '0.4em',
                                padding: '5px 10px',
                                fontSize: '0.8em',
                            }}
                        >
                            {selectedSolution?.displayName ? selectedSolution.displayName : "Solution List"}
                        </Button>
                    </Tooltip>
                    <Tooltip title={openSolutionTooltip} >
                        <Button
                            sx={{
                                width: '100%',
                                maxWidth: 'calc(100% - 10px)',
                                fontSize: '0.7em'
                            }}
                            onClick={() => {
                                setDialogOpenedTrue();
                                setTimeout(() => {
                                    inputRef.current?.focus();
                                }, 500);
                            }}
                        >
                            Select Solution
                        </Button>
                    </Tooltip>
                </Stack>
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
                    <FilterInput ref={inputRef} fullWidth placeholder='Filter by name' returnFilterInput={setFilter} forcedValue={filter} />
                </Box>
                <Divider />
                <List sx={{ width: '25vw', overflowY: 'scroll' }}>
                    <ListItemButton onClick={() => { setSelectedSolution(null); setDialogOpenedFalse(); }} dense>
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
                                    onClick={() => { setSelectedSolution(solutionItem); setDialogOpenedFalse(); }}
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