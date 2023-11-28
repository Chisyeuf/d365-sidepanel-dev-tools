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
        if (inputRef.current) {
            if (numericOptions?.maximumValue && value && value > Number(numericOptions?.maximumValue)) {
                setAutonumeric(new AutoNumeric(inputRef.current, numericOptions?.maximumValue, numericOptions));
            }
            else if (numericOptions?.minimumValue && value && value < Number(numericOptions?.minimumValue)) {
                setAutonumeric(new AutoNumeric(inputRef.current, numericOptions?.minimumValue, numericOptions));
            }
            else {
                setAutonumeric(new AutoNumeric(inputRef.current, value, numericOptions));
            }
        }
    }, [inputRef])

    useEffect(() => {
        if (!inputValue) {
            autonumeric?.clear();
        }
        else {
            if (numericOptions?.maximumValue && Number(inputValue) > Number(numericOptions?.maximumValue)) {
                autonumeric?.set(numericOptions?.maximumValue);
            }
            else if (numericOptions?.minimumValue && Number(inputValue) < Number(numericOptions?.minimumValue)) {
                autonumeric?.set(numericOptions?.minimumValue);
            }
            else {
                autonumeric?.set(inputValue);
            }
        }
    }, [inputValue])

    useEffect(() => {
        setInputValue(value || value === 0 ? "" + value : '');
    }, [value])

    function handleChange() {
        if (!autonumeric) return;
        setInputValue(autonumeric.getFormatted() ?? '');
        return props.onChange && props.onChange(autonumeric.getFormatted() ? autonumeric.getNumber() : null);
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
