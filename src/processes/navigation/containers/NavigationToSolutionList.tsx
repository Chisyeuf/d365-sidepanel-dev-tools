import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { useMemo, useRef, useState } from 'react';

import ComponentContainer from '../../../utils/components/ComponentContainer';
import { PowerAppsIcon, PowerAutomateIcon } from '../icons';
import { RetrieveSolutions } from '../../../utils/hooks/XrmApi/RetrieveSolutions';
import { useBoolean } from 'usehooks-ts';
import FilterInput, { AttributeFilterInputRef } from '../../../utils/components/FilterInput';
import { SolutionItem } from '../../../utils/types/SolutionItem';
import { NavigationButton } from '../../../utils/types/NavigationButton';
import D365NavBarIcon from '../../../utils/components/D365NavBarIcon';
import RedDisabledButton from '../../../utils/components/RedDisabledButton';

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

    function handleClickPowerAutomate() {
        if (!selectedSolution) {
            window.open(`https://make.powerautomate.com/environments/${environmentId}/solutions/`, '_blank');
        } else {
            window.open(`https://make.powerautomate.com/environments/${environmentId}/solutions/${selectedSolution.solutionid}`, '_blank');
        }
    }

    function handleClickOldSolution() {
        if (!selectedSolution) {
            window.open(`${clientUrl}/tools/Solution/home_solution.aspx?etc=7100`, '_blank');
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

    const solutionName = useMemo(() => {
        if (selectedSolution) {
            return selectedSolution.displayName;
        }
        else {
            return "Solution List";
        }
    }, [selectedSolution]);

    const selectSolutionButton = useMemo(() => (
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
                        if (inputRef.current) {
                            inputRef.current.focus();
                            inputRef.current.select();
                        }
                    }, 500);
                }}
            >
                Select Solution
            </Button>
        </Tooltip>
    ), [openSolutionTooltip, setDialogOpenedTrue]);

    return (
        <>
            <ComponentContainer width='100%' Legends={{
                top: { position: 'center', component: 'Solutions', padding: '5px' },
                bottom: { position: 'center', component: selectSolutionButton, padding: '10px' }
            }}>
                <Stack spacing={2} padding='5px' direction='row' justifyContent='center'>

                    <Tooltip placement='top' title={`Open ${solutionName} in old interface`}>
                        <Box>
                            <RedDisabledButton
                                variant='outlined'
                                onClick={handleClickOldSolution}
                                startIcon={<D365NavBarIcon iconX={-239} iconY={-1} width={20} />}
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

                    <Tooltip placement='top' title={`Open ${solutionName} in PowerApps`}>
                        <Box>
                            <RedDisabledButton
                                variant='outlined'
                                disabled={!environmentId}
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

                    <Tooltip placement='top' title={`Open ${solutionName} in PowerAutomate`}>
                        <Box>
                            <RedDisabledButton
                                variant='outlined'
                                disabled={!environmentId}
                                onClick={handleClickPowerAutomate}
                                startIcon={<PowerAutomateIcon />}
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

            <Drawer
                anchor={'right'}
                open={dialogOpened}
                onClose={setDialogOpenedFalse}
            >
                <Box
                    padding={1}
                >
                    <FilterInput ref={inputRef} fullWidth placeholder='Filter by name' returnFilterInput={setFilter} defaultValue={filter} />
                </Box>
                <Divider />
                <List sx={{ width: '45vw', overflowY: 'scroll' }}>
                    <ListItem key={'nosolution'} sx={{ p: 0 }}>
                        <ListItemButton onClick={() => { setSelectedSolution(null); setDialogOpenedFalse(); }} dense>
                            <ListItemText
                                primary={<i>Unselect Solution</i>}
                            />
                        </ListItemButton>
                    </ListItem>
                    {
                        solutions.map((solutionItem) => {
                            if (!solutionItem.displayName.toLowerCase().includes(filter.toLowerCase())) {
                                return null;
                            }

                            return (
                                <ListItem key={'solution' + solutionItem.uniqueName} sx={{ p: 0 }}>
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
                                </ListItem>
                            );
                        })
                    }
                </List>
            </Drawer>
        </>
    )
}

export default SolutionList;