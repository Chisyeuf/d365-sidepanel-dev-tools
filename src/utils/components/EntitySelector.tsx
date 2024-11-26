import { Autocomplete, Box, createTheme, FilterOptionsState, FormControl, ListItem, ListItemText, SxProps, TextField, Theme, Tooltip, Typography } from "@mui/material"
import React, { useMemo } from "react"
import { useEffect, useState } from "react"
import { RetrieveEntities } from "../hooks/XrmApi/RetrieveEntities"
import { createFilterOptions } from '@mui/material/Autocomplete';
import { Virtuoso } from "react-virtuoso";


const filterOptions = createFilterOptions<EntityOption>({
    ignoreAccents: true,
    ignoreCase: true,
    matchFrom: "any",
    stringify: (option) => option.label + ";" + option.id,
});


// Adapter for react-window
const ListboxComponent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLElement>
>(function ListboxComponent(props, ref) {
    const { children, ...other } = props;

    return (
        <Box ref={ref} {...other} sx={{ height: '50vh' }}>
            <Virtuoso
                data={children as React.ReactElement<unknown>[]}
                itemContent={(index, child) => child}
                height={'100px'}
            />
        </Box>
    );
});


type EntitySelectorProps = {
    setEntityname: (str: string) => void,
    entityname: string,
    moreOptions?: EntityOption[],
    sx?: SxProps<Theme>
}
type EntityOption = {
    id: string,
    label: string
}
const EntitySelector: React.FunctionComponent<EntitySelectorProps> = React.memo((props) => {
    const [value, setValue] = useState<EntityOption>({ id: props.entityname, label: "" });

    const { entityname, moreOptions } = props;

    const entities = RetrieveEntities();

    const options = useMemo(() => {
        return (entities?.map((value, index, array) => {
            return { id: value.logicalname, label: value.name }
        }) ?? []).concat(moreOptions ?? []);
    }, [entities, JSON.stringify(moreOptions)]);

    useEffect(() => {
        setValue(options.find((o) => { return o.id === entityname }) ?? { id: entityname, label: "" })
    }, [entityname, options]);

    return (
        <Tooltip title={<Typography variant='body2'>{value.label ? value.label : <i>No entity selected</i>}</Typography>} arrow disableInteractive enterDelay={600} placement='left'>
            <Autocomplete
                filterOptions={filterOptions}
                size='small'
                options={options}
                getOptionLabel={(option: EntityOption) => option.label}
                placeholder='Search entity'
                key='entityselector'
                onChange={(event, option, index) => { props.setEntityname(option?.id.toString() ?? "") }}
                renderInput={(params) => <TextField {...params} label="Entity Name" />}
                renderOption={(props, item) => {
                    return (
                        <li {...props} key={item.id} style={{ paddingTop: 0, paddingBottom: 0 }}>
                            <ListItemText
                                primary={item.label}
                                secondary={item.id}
                            />
                        </li>
                    )
                }}
                // <Tooltip placement='left' title={<Typography variant='body2'>{item.id}</Typography>} arrow disableInteractive ><li {...props} key={item.id}> {item.label} </li></Tooltip>}
                value={value}
                fullWidth
                slotProps={{
                    listbox: {
                        component: ListboxComponent
                    }
                }}
            />
        </Tooltip>
    );
});

export default EntitySelector;