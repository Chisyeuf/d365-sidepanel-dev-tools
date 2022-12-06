import { Autocomplete, FormControl, TextField } from "@mui/material"
import React from "react"
import { useEffect, useState } from "react"
import { Entity } from "../global/requestsType"
import { RetrieveEntities } from "../hooks/XrmApi/RetrieveEntities"

type EntitySelectorProps = {
    setEntityname: (str: string) => void,
    entityname: string
}
type EntityOption = {
    id: string,
    label: string
}
const EntitySelector: React.FunctionComponent<EntitySelectorProps> = (props) => {
    const entitiesRetrieved = RetrieveEntities()
    const [entities, setEntities] = useState<Entity[]>()
    const [value, setValue] = useState<EntityOption>({ id: props.entityname, label: "Loading..." })
    const [options, setOptions] = useState<EntityOption[]>([])

    const entityname = props.entityname

    useEffect(() => {
        setEntities(entitiesRetrieved)
    }, [entitiesRetrieved])

    useEffect(() => {
        setOptions(entities?.map((value, index, array) => {
            return { id: value.logicalname, label: value.name }
        }) ?? [])
    }, [entities])

    useEffect(() => {
        setValue(options.find((o) => { return o.id === entityname }) ?? { id: entityname, label: "" })
    }, [entityname, options])

    return (
        <FormControl size='small' fullWidth>
            <Autocomplete
                size='small'
                options={options}
                getOptionLabel={(option: typeof options[0]) => option.label}
                // styles={comboBoxStyles}
                // Force re-creating the component when the toggles change (for demo purposes)
                key='entityselector'
                placeholder='Search entity'
                onChange={(event, option, index) => { props.setEntityname(option?.id.toString() ?? "") }}
                value={value}
                renderInput={(params) => <TextField {...params} />}
                fullWidth
            />
        </FormControl>
    )
}

export default EntitySelector