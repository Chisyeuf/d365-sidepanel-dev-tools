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
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';


class EntityListButton extends ProcessButton {
    constructor() {
        super(
            'entitiesList',
            'Entities List',
            <TableViewIcon />,
            300
        );
        this.process = EntityListProcess;
        this.description = <>
            <Typography><i>Navigate without worries.</i></Typography>
            <Typography>This tool shows all entities in your environment.</Typography>
            <Typography>Clicking an item opens the entity list with its existing views.</Typography>
        </>
    }
}

const EntityListProcess = forwardRef<ProcessRef, ProcessProps>(
    function EntityListProcess(props: ProcessProps, ref) {

        const [filter, setFilter] = useState("");
        const [entities, isFetchingEntities] = RetrieveEntities();

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

                {
                    !isFetchingEntities ?
                        <List
                            sx={{ width: '100%', height: '100%', bgcolor: 'background.paper', overflowY: 'auto', overflowX: 'hidden' }}
                        >
                            <MuiVirtuoso
                                data={entitiesFiltered}
                                itemContent={(index, entity) => {
                                    return (
                                        <ListItem key={`EntityListItem-${entity.logicalname}`} sx={{ p: 0 }}>
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
                        </List>
                        :
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <CircularProgress size={100} thickness={4.5} />
                        </div>
                }
            </Stack>
        );
    }
);

const entitiesList = new EntityListButton();
export default entitiesList;