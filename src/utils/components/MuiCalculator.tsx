import * as React from 'react';
import Button from '@mui/material/Button';
import { Dialog, DialogContent, TextField } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useEffect, useState } from 'react';

import type { TextFieldProps } from '@mui/material';
import AutoNumeric, { Options } from 'autonumeric';

enum Action {
    Clear = 100,
    Del = 101,
    Mul = 102,
    Div = 103,
    Add = 104,
    Min = 105,
    Equ = 106,
    Dot = 107,
    Neg = 108,
}

interface MuiCalculatorButton {
    label: string;
    value: number | Action;
    sizeX?: number;
    sizeY?: number;
    empty?: boolean;
}

const buttonsFloat: MuiCalculatorButton[] = [
    { label: '7', value: 7 }, { label: '8', value: 8 }, { label: '9', value: 9 }, { label: "DEL", value: Action.Del }, { label: "AC", value: Action.Clear },
    { label: '4', value: 4 }, { label: '5', value: 5 }, { label: '6', value: 6 }, { label: "-", value: Action.Min }, { label: "÷", value: Action.Div },
    { label: '1', value: 1 }, { label: '2', value: 2 }, { label: '3', value: 3 }, { label: "+", value: Action.Add, sizeY: 2 }, { label: "×", value: Action.Mul },
    { label: '+/-', value: Action.Neg }, { label: '0', value: 0 }, { label: ".", value: Action.Dot }, { label: '', value: -1, empty: true }, { label: "=", value: Action.Equ }
];
const buttonsInt: MuiCalculatorButton[] = [
    { label: '7', value: 7 }, { label: '8', value: 8 }, { label: '9', value: 9 }, { label: "DEL", value: Action.Del }, { label: "AC", value: Action.Clear },
    { label: '4', value: 4 }, { label: '5', value: 5 }, { label: '6', value: 6 }, { label: "-", value: Action.Min }, { label: "÷", value: Action.Div },
    { label: '1', value: 1 }, { label: '2', value: 2 }, { label: '3', value: 3 }, { label: "+", value: Action.Add, sizeY: 2 }, { label: "×", value: Action.Mul },
    { label: '+/-', value: Action.Neg }, { label: '0', value: 0, sizeX: 2 }, { label: '', value: -1, empty: true }, { label: "=", value: Action.Equ }
];

type ActionStorage = { action: Action, valueLeft: number | null, valueRight: number | null } | null

type MuiCalculatorProps = {
    value: number | null
    onChange?: (newValue: number | null) => void
    open: boolean
    onClose: () => void
    integer?: boolean
    maximumValue?: number
    minimumValue?: number
};
const MuiCalculator: React.FunctionComponent<MuiCalculatorProps> = (props: MuiCalculatorProps) => {
    const { value, open, onClose, ...other } = props;

    const [input, setInput] = useState<number | Action | null>(null);
    const [lastinput, setLastinput] = useState<number | Action | null>(null);
    const [currentAction, setCurrentAction] = useState<ActionStorage>(null);
    const [equalAction, setEqualAction] = useState<ActionStorage>(null);
    const [output, setOutput] = useState<string | null>(value ? '' + value : null);

    const [exceedMax, setExceedMax] = useState<boolean>(false);
    const [exceedMin, setExceedMin] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('')

    const applyActionStorage = (actionToLaunch: ActionStorage) => {
        let value: number | null = null;
        switch (actionToLaunch?.action) {
            case Action.Mul:
                value = (actionToLaunch.valueLeft ?? 1) * (actionToLaunch.valueRight ?? 1);
                setOutput('' + value);
                break;
            case Action.Div:
                value = (actionToLaunch.valueLeft ?? 1) / (actionToLaunch.valueRight ?? 1);
                setOutput('' + value);
                break;
            case Action.Add:
                value = (actionToLaunch.valueLeft ?? 0) + (actionToLaunch.valueRight ?? 0);
                setOutput('' + value);
                break;
            case Action.Min:
                value = (actionToLaunch.valueLeft ?? 0) - (actionToLaunch.valueRight ?? 0);
                setOutput('' + value);
                break;
        }
        return value;
    }

    const lastInputIsFunction = () => {
        if ((!lastinput && lastinput !== 0))
            return false;
        return (lastinput > 99 && lastinput !== Action.Neg && lastinput !== Action.Dot && lastinput !== Action.Del && lastinput !== Action.Clear);
    }

    useEffect(() => {
        if ((!input && input !== 0) || input > 99) {
            switch (input) {
                case Action.Del:
                    setOutput((old) => {
                        if (!old) return null;
                        let oldString = '' + old;
                        if (oldString.length === 1) return null;
                        return oldString.substring(0, oldString.length - 1);
                    });
                    break;
                case Action.Clear:
                    setOutput(null);
                    setCurrentAction(null);
                    setEqualAction(null);
                    break;
                case Action.Equ:
                    setCurrentAction(null);
                    if (!equalAction && currentAction?.valueLeft) {
                        let newEqualAction: ActionStorage = { action: currentAction.action, valueLeft: currentAction.valueLeft, valueRight: Number(output) };
                        setEqualAction(newEqualAction);
                        applyActionStorage(newEqualAction);
                    }
                    if (equalAction) {
                        applyActionStorage({ action: equalAction.action, valueLeft: Number(output), valueRight: equalAction.valueRight });
                    }
                    break;
                case Action.Neg:
                    setOutput(old => old ? '' + -Number(old) : null);
                    break;
                case Action.Dot:
                    setOutput(old => old + ".");
                    break;
                case Action.Mul:
                case Action.Div:
                case Action.Add:
                case Action.Min:
                    setEqualAction(null);
                    if (!currentAction) {
                        setCurrentAction({ action: input, valueLeft: Number(output), valueRight: null });
                    }
                    else {
                        if (lastInputIsFunction()) {
                            setCurrentAction({ action: input, valueLeft: currentAction.valueLeft, valueRight: currentAction.valueRight });
                        }
                        else {
                            let newValue = applyActionStorage({ action: currentAction.action, valueLeft: currentAction.valueLeft, valueRight: Number(output) });
                            setCurrentAction({ action: input, valueLeft: newValue, valueRight: null });
                        }
                    }
                    break;
                default:
                    break;
            }
        }
        if (input !== null && input < 10) {
            if (lastInputIsFunction()) {
                setOutput(input ? '' + input : null);
            }
            else {
                setOutput((output ? output : '') + input);
            }
        }

        if (input)
            setLastinput(input);

        setTimeout(() => {
            let outputNumber = output ? Number(output) : null;
            if (outputNumber && props.maximumValue && outputNumber > props.maximumValue) {
                outputNumber = props.maximumValue;
                setExceedMax(true);
                setExceedMin(false);
                setErrorMessage('The maximum value is exceeded: ' + props.maximumValue);
            }
            else if (outputNumber && props.minimumValue && outputNumber < props.minimumValue) {
                outputNumber = props.minimumValue;
                setExceedMin(true);
                setExceedMax(false);
                setErrorMessage('The minimum value is exceeded' + props.minimumValue);
            }
            else {
                setExceedMax(false);
                setExceedMin(false);
                setErrorMessage('');
            }
            props.onChange && props.onChange(outputNumber);
        }, 0);
    }, [input]);

    useEffect(() => {
        setOutput(value ? '' + value : null);
    }, [value])



    return (
        <Dialog open={open} onClose={onClose}>
            <DialogContent sx={{ height: "400px", width: "300px" }}>
                <NumPadScreen value={output} error={exceedMax || exceedMin} errorMessage={errorMessage} />
                <NumPad onChange={setInput} integer={props.integer ?? false} />
            </DialogContent>
        </Dialog>
    );
};


type NumPadScreenProps = {
    value: string | null;
    error?: boolean;
    errorMessage?: string;
}
const NumPadScreen: React.FunctionComponent<NumPadScreenProps> = (props: NumPadScreenProps) => {
    return (
        <TextField
            value={props.value ?? ''}
            contentEditable={false}
            fullWidth
            sx={{ paddingBottom: !props.error ? '23.9062px' : '0', paddingTop: '10px' }}
            InputProps={{ sx: { fontSize: '2em' } }}
            size='small'
            error={props.error}
            helperText={props.errorMessage}
        />
    );
}

type NumPadProps = {
    onChange?: (newValue: number | Action | null) => void
    integer: boolean
}
const NumPad: React.FunctionComponent<NumPadProps> = (props: NumPadProps) => {


    const [input, setInput] = React.useState<number | Action | null>(null);

    const buttonsList = props.integer ? buttonsInt : buttonsFloat;

    useEffect(() => {
        props.onChange && props.onChange(input);
    }, [input])


    return (
        <Grid container spacing={1} columns={5} height='calc(100% - 100px)'>
            {buttonsList.map((button, index) => (
                <Grid size={{ xs:button.sizeX ?? 1 }} key={button.label}>
                    {
                        !button.empty &&
                        <NumPadButton label={button.label} value={button.value} setInput={setInput} height={button.sizeY} />
                    }
                </Grid>
            ))}
        </Grid>
    );
}

type NumPadButtonProps = {
    label: string
    value: number | Action;
    setInput: (n: number | Action | null) => void;
    height?: number
};
const NumPadButton = (props: NumPadButtonProps) => {
    return (
        <Button
            sx={{
                height: props.height
                    ? "calc(" + props.height + "00% + " + (props.height - 1) * 8 + "px)"
                    : '100%',
                fontSize: '1.5em',
                minWidth: '0'
            }}
            fullWidth
            variant="contained"
            onMouseDown={() => props.setInput(props.value)}
            onMouseUp={() => props.setInput(null)}
            onMouseLeave={() => props.setInput(null)}
        >
            {props.label}
        </Button>
    );
};

export default MuiCalculator;