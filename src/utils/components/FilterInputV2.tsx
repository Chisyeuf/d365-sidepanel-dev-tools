import { FormControl, IconButton, InputAdornment, TextField } from "@mui/material"
import { useMemo, useState } from "react"
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ClearIcon from '@mui/icons-material/Clear';
import React from "react";


type AttributeFilterInputProps = {
    arrayToFilter: string[],
    onChange: (str: string[]) => void,
    placeholder?: string,
    fullWidth?: boolean
}
const FilterInputV2: React.FunctionComponent<AttributeFilterInputProps> = (props: AttributeFilterInputProps) => {
    const { fullWidth, placeholder, arrayToFilter, onChange } = props

    const [value, setValue] = useState("")

    const result = useMemo(() => {
        return (arrayToFilter.filter(a => a.toLowerCase().indexOf(value) !== -1))
    }, [arrayToFilter, value])

    return (
        <FormControl size='small' fullWidth={fullWidth}>
            <TextField
                size='small'
                inputMode='search'
                value={value}
                onChange={(e) => {
                    setValue(e?.target.value ?? "")
                    onChange(result?.length > 0 ? result : arrayToFilter)
                }}
                placeholder={placeholder}
                fullWidth={fullWidth}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <FilterAltIcon />
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <IconButton
                            sx={{ visibility: value ? "visible" : "hidden" }}
                            onClick={() => {
                                setValue("")
                                onChange(arrayToFilter)
                            }}
                        >
                            <ClearIcon />
                        </IconButton>
                    )
                }}

            />
        </FormControl>
    )
}

export default FilterInputV2