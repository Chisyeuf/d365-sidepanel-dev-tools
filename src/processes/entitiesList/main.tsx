import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../../utils/global/.processClass';
import { RetrieveEntities } from '../../utils/hooks/XrmApi/RetrieveEntities';
import FilterInput from '../../utils/components/FilterInput';
import TableViewIcon from '@mui/icons-material/TableView';
import MuiVirtuoso from '../../utils/components/MuiVirtuoso';


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
            <Stack spacing={1} height='calc(100% - 20px)' padding='10px' alignItems='center'>
                <FilterInput fullWidth placeholder='Search Name or LogicalName' defaultValue={filter} returnFilterInput={setFilter} />

                <List
                    sx={{ width: '100%', height: '100%', bgcolor: 'background.paper', overflowY: 'auto', overflowX: 'hidden' }}
                >
                    <MuiVirtuoso
                        data={entitiesFiltered}
                        itemContent={(index, entity) => {
                            return (
                                <ListItem key={`EntityListItem-${entity.logicalname}`}  sx={{ p: 0 }}>
                                    <ListItemButton
                                        key={`EntityListButton-${entity.logicalname}`}
                                        sx={{ pt: 0, pb: 0 }}
                                        onClick={() => openEntityList(entity.logicalname)}
                                    >
                                        <ListItemText
                                            key={`EntityListText-${entity.logicalname}`}
                                            title={entity.name}
                                            primary={entity.name}
                                            secondary={entity.logicalname}
                                            sx={{ mt: 0.5, mb: 0.5 }}
                                        />
                                    </ListItemButton>
                                    <Divider />
                                </ListItem>
                            );
                        }}
                    />
                    {/* {
                        entitiesFiltered?.map((entity, index) => {
                            return (
                                <>
                                    <ListItemButton
                                        sx={{ pt: 0, pb: 0 }}
                                        onClick={() => openEntityList(entity.logicalname)}
                                    >
                                        <ListItemText title={entity.name} primary={entity.name} secondary={entity.logicalname} sx={{ mt: 0.5, mb: 0.5 }} />
                                    </ListItemButton>
                                    <Divider />
                                </>
                            );
                        })
                    } */}
                </List>

            </Stack>
        );
    }
);

const entitiesList = new EntityListButton();
export default entitiesList;