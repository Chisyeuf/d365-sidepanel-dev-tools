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
    fullWidth?: boolean,
    sx?: SxProps<Theme>
}
type EntityOption = {
    id: string,
    label: string
}
const EntitySelector: React.FunctionComponent<EntitySelectorProps> = (props) => {
    const { entityname, moreOptions, setEntityname, fullWidth, sx } = props;

    const [value, setValue] = useState<EntityOption>({ id: entityname, label: "" });

    const entities = RetrieveEntities();

    const options = useMemo(() => {
        const entityOptions = entities?.map(
            (value) => {
                return { id: value.logicalname, label: value.name }
            }) ?? [];

        if (moreOptions) {
            return entityOptions.concat(moreOptions);
        }
        return entityOptions;
    }, [entities, moreOptions]);

    useEffect(() => {
        setValue(options.find((o) => { return o.id === entityname }) ?? { id: entityname, label: "" });
    }, [entityname, options]);


    return (
        <Tooltip title={<Typography variant='body2'>{value.label ? value.label : <i>No entity selected</i>}</Typography>} arrow disableInteractive enterDelay={600} placement='left'>
            <Autocomplete
                options={options}
                filterOptions={filterOptions}
                getOptionLabel={(option: EntityOption) => option.label}
                size='small'
                placeholder='Search entity'
                key='entityselector'
                onChange={(event, option, index) => { setEntityname(option?.id.toString() ?? "") }}
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
                value={value}
                fullWidth={fullWidth}
                slotProps={{
                    listbox: {
                        component: ListboxComponent
                    },
                }}
            />
        </Tooltip>
    );

};

export default EntitySelector;