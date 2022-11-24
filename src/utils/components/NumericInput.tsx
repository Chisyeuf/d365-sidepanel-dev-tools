import type { TextFieldProps } from '@mui/material';
import { TextField } from '@mui/material';
import AutoNumeric, { Options } from 'autonumeric';
import React, { useEffect, useRef, useState } from 'react';

export interface HTMLNumericElement
    extends Omit<HTMLInputElement, 'value' | 'name'> {
    value: number | null | '';
    name?: string;
}

export type NumericInputProps = Omit<TextFieldProps, 'onChange'> & {
    value?: number | null;
    onChange?(e: number | null): void;

    numericOptions?: Options;
};

function NumericInput(props: NumericInputProps) {
    const { value, numericOptions, ...inputProps } = props;

    const [inputValue, setInputValue] = useState<string>('')
    const inputRef = useRef<HTMLInputElement>()
    const [autonumeric, setAutonumeric] = useState<AutoNumeric>()

    useEffect(() => {
        if (inputRef.current)
            setAutonumeric(new AutoNumeric(inputRef.current, value, numericOptions));
    }, [inputRef])

    useEffect(() => {
        if (inputValue === '') {
            autonumeric?.clear();
        }
        else {
            autonumeric?.set(inputValue);
        }
    }, [inputValue])

    useEffect(() => {
        setInputValue(value || value === 0 ? "" + value : '');
    }, [value])

    function handleChange() {
        setInputValue(autonumeric?.getFormatted() ?? '')
        return props.onChange && props.onChange(autonumeric?.getNumber() ?? null);
    }

    return (
        <TextField
            {...inputProps}
            onChange={handleChange}
            value={inputValue}
            type='text'
            inputRef={inputRef}
        />
    );
}

export default NumericInput;
