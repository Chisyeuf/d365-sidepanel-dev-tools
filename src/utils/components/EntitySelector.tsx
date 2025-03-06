import Autocomplete from '@mui/material/Autocomplete';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React, { useMemo } from "react"
import { useEffect, useState } from "react"
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
    fullWidth?: boolean,
}
type EntityOption = {
    id: string,
    label: string
}
const EntitySelector: React.FunctionComponent<EntitySelectorProps> = (props) => {
    const { entityname, moreOptions, setEntityname, fullWidth } = props;

    const [value, setValue] = useState<EntityOption>({ id: entityname, label: "" });

    const [entities, isFetchingEntities] = RetrieveEntities();

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
            />
        </Tooltip>
    );

};

export default EntitySelector;