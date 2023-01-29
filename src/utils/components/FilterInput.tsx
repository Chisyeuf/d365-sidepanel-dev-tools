import { FormControl, IconButton, InputAdornment, TextField } from "@mui/material"
import { useRef, useState } from "react"
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ClearIcon from '@mui/icons-material/Clear';
import React from "react";

type AttributeFilterInputProps = {
    returnFilterInput: (str: string) => void,
    placeholder?: string,
    fullWidth?: boolean
}
const FilterInput: React.FunctionComponent<AttributeFilterInputProps> = (props: AttributeFilterInputProps) => {
    const [value, setValue] = useState("")

    return (
        <FormControl size='small' fullWidth={props.fullWidth}>
            <TextField
                size='small'
                inputMode='search'
                value={value}
                onChange={(e) => {
                    setValue(e?.target.value ?? "")
                    props.returnFilterInput(e?.target.value ?? "")
                }}
                placeholder={props.placeholder}
                fullWidth={props.fullWidth}
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
                                props.returnFilterInput("")
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

export default FilterInput