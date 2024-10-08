
import { createTheme, List, ListItemButton, ListItemText, ListSubheader, Stack, ThemeProvider } from '@mui/material';
import React, { forwardRef, useCallback, useMemo, useState, } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../../utils/global/.processClass';

import { RetrieveEntities } from '../../utils/hooks/XrmApi/RetrieveEntities';
import FilterInput from '../../utils/components/FilterInput';
import TableViewIcon from '@mui/icons-material/TableView';


class EntityListButton extends ProcessButton {
    constructor() {
        super(
            'entitiesList',
            'Entities List',
            <TableViewIcon />,
            300
        );
        this.process = EntityListProcess;
    }
}

const EntityListProcess = forwardRef<ProcessRef, ProcessProps>(
    function EntityListProcess(props: ProcessProps, ref) {

        const [filter, setFilter] = useState("");
        const entities = RetrieveEntities();

        const entitiesFiltered = useMemo(() => {
            const filterLower = filter.toLowerCase();
            return entities?.filter(e => e.name.toLowerCase().includes(filterLower) || e.logicalname.toLowerCase().includes(filterLower))
        }, [entities, filter]);

        const openEntityList = useCallback((entityName: string) => {
            Xrm.Navigation.navigateTo(
                {
                    pageType: 'entitylist',
                    entityName: entityName,
                }
            );
        }, []);



        return (
            <Stack spacing={4} height='calc(100% - 10px)' padding='10px' alignItems='center'>
                <List
                    sx={{ width: '100%', bgcolor: 'background.paper', overflowY: 'auto' }}
                    component="nav"
                    subheader={
                        <ListSubheader component="div">
                            <FilterInput fullWidth placeholder='Search Name or LogicalName' defaultValue={filter} returnFilterInput={setFilter} />
                        </ListSubheader>
                    }
                >
                    {
                        entitiesFiltered?.map((entity, index) => {
                            return (
                                <ListItemButton
                                    sx={{ pt: 0, pb: 0 }}
                                    onClick={() => openEntityList(entity.logicalname)}
                                >
                                    <ListItemText title={entity.name} primary={entity.name} secondary={entity.logicalname} />
                                </ListItemButton>
                            );
                        })
                    }
                </List>

            </Stack>
        );
    }
);

const entitiesList = new EntityListButton();
export default entitiesList;