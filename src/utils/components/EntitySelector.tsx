import { Autocomplete, FilterOptionsState, FormControl, SxProps, TextField, Theme, Tooltip, Typography } from "@mui/material"
import React, { useMemo } from "react"
import { useEffect, useState } from "react"
import { Entity } from "../types/requestsType"
import { RetrieveEntities } from "../hooks/XrmApi/RetrieveEntities"
import { createFilterOptions } from '@mui/material/Autocomplete';


const filterOptions = createFilterOptions<EntityOption>({
    ignoreAccents: true,
    ignoreCase: true,
    matchFrom: "any",
    stringify: (option) => option.label + ";" + option.id,
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
        <Tooltip title={<Typography variant='body2'>{value.label}</Typography>} arrow disableInteractive enterDelay={600} placement='left'>
            <Autocomplete
                filterOptions={filterOptions}
                size='small'
                options={options}
                getOptionLabel={(option: EntityOption) => option.label}
                placeholder='Search entity'
                key='entityselector'
                onChange={(event, option, index) => { props.setEntityname(option?.id.toString() ?? "") }}
                renderInput={(params) => <TextField {...params} label="Entity Name" />}
                renderOption={(props, item) => <li {...props} key={item.id}> {item.label} </li>}
                value={value}
                fullWidth
                sx={props.sx}
            />
        </Tooltip>
    );
});

export default EntitySelector;