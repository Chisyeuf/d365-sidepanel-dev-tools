
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { ProcessButton, ProcessProps } from '../utils/global/.processClass'
import { Entity, AttributeMetadata, MSType, MSDateFormat } from '../utils/global/requestsType'
import { RetrieveEntities } from '../utils/hooks/RetrieveEntities'
import { RetrievePrimaryAttribute } from '../utils/hooks/RetrievePrimaryAttribute'
import { formatId } from '../utils/global/common'
import React from 'react'
import { RetrieveAttributesMetaData } from '../utils/hooks/RetrieveAttributesMetaData'
import { RetrieveAttributes } from '../utils/hooks/RetrieveAttributes'
import { RetrievePicklistValues } from '../utils/hooks/RetrievePicklistValues'
import SyncIcon from '@mui/icons-material/Sync';
import { Stack } from '@mui/system'
import { useBoolean } from 'usehooks-ts'
import { Autocomplete, Button, Checkbox, createTheme, Dialog, DialogContent, DialogTitle, Divider, FormControl, IconButton, InputAdornment, MenuItem, Select, SelectChangeEvent, TextField, Typography, ThemeProvider, Pagination } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { DatePicker, DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers'
import dayjs, { Dayjs } from 'dayjs';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import SearchIcon from '@mui/icons-material/Search';
import { DataGrid, GridColDef, gridPageCountSelector, gridPageSelector, GridToolbar, GridValidRowModel, useGridApiContext, useGridSelector } from '@mui/x-data-grid';
import { DialogActions } from '@material-ui/core'
import { RetrieveRecordsDisplayNames } from '../utils/hooks/RetrieveRecordsDisplayNames';
import { RetrieveAllRecords } from '../utils/hooks/RetrieveAllRecords'
import { SelectInputProps } from '@mui/material/Select/SelectInput'
import ClearIcon from '@mui/icons-material/Clear';


class UpdateRecordButton extends ProcessButton {
    constructor() {
        super(
            'updaterecord',
            'Update Record',
            <SyncIcon />,
            500
        )
        this.process = UpdateRecordProcess
    }
}


function UpdateRecordProcess(props: ProcessProps) {
    const [entityname, _setEntityname] = useState(Xrm.Page.data.entity.getEntityName())
    const [recordid, setRecordid] = useState(formatId(Xrm.Page.data.entity.getId().toLowerCase()))
    const [filterAttribute, setFilterAttribute] = useState("")

    const setEntityname = (entityname: string) => {
        _setEntityname(entityname)
        setRecordid("")
    }

    const setCurrentRecord = () => {
        setEntityname(Xrm.Page.data.entity.getEntityName())
        setRecordid(formatId(Xrm.Page.data.entity.getId().toLowerCase()))
    }

    // useEffect(() => {
    //     setCurrentRecord();
    // }, [])


    const launchUpdate = () => {
        console.log("Launch Update for " + entityname + " " + recordid)
    }


    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Stack spacing={"4px"} width="100%" padding="10px">
                <NavTopBar
                    setEntityname={setEntityname}
                    setRecordid={setRecordid}
                    setCurrentRecord={setCurrentRecord}
                    launchUpdate={launchUpdate}
                    setFilterAttribute={setFilterAttribute}
                    entityname={entityname}
                    recordid={recordid} />
                <Divider />
                <AttributesList entityname={entityname} recordid={recordid} filter={filterAttribute} />
                {entityname + " / " + recordid}
            </Stack>
        </LocalizationProvider>)
}

type AttributesListProps = {
    entityname: string,
    recordid: string,
    filter: string,
}
function AttributesList(props: AttributesListProps) {
    const entityname = props.entityname
    const recordid = props.recordid

    const attributesMetadataRetrieved = RetrieveAttributesMetaData(entityname)
    const attributesRetrieved = RetrieveAttributes(entityname, recordid, attributesMetadataRetrieved?.map((value) => {
        if (value.MStype !== MSType.Lookup) return value.LogicalName
        else return "_" + value.LogicalName + "_value"
    }) ?? [])


    return (<Stack spacing={"1px"} overflow="scroll">
        {attributesMetadataRetrieved?.map((metadata) => {
            const attributeName = metadata.MStype !== MSType.Lookup ? metadata.LogicalName : "_" + metadata.LogicalName + "_value"
            // console.log(metadata.LogicalName, metadata.MStype, attributeName)
            return (metadata.DisplayName.indexOf(props.filter) !== -1 ||
                metadata.LogicalName.indexOf(props.filter) !== -1 ||
                metadata.SchemaName.indexOf(props.filter) !== -1)
                && <AttributeNode disabled={!metadata.IsValidForUpdate} attribute={metadata} entityname={props.entityname} value={attributesRetrieved[attributeName]} />
        })}
    </Stack>)
}

type AttributeNodeProps = {
    attribute: AttributeMetadata,
    entityname: string,
    value: any,
    disabled: boolean
}
type AttributeProps = {
    attribute: AttributeMetadata,
    entityname: string,
    value: any,
    setToUpdate: () => void,
    reset: boolean,
    manageDirty: { set: () => void, remove: () => void },
    disabled: boolean
}
function AttributeNode(props: AttributeNodeProps) {
    const { value: isDirty, setTrue, setFalse } = useBoolean(false)
    const manageDirty = { setTrue, setFalse }

    const { value: isToUpdate, setTrue: setToUpdate, setFalse: removeToUpdate } = useBoolean(false)
    const { value: toReset, setTrue: setToReset, setFalse: resetToReset } = useBoolean(false)

    useEffect(() => {
        if (isToUpdate === false) {
            setToReset();
        }
    }, [isToUpdate, setToReset])
    useEffect(() => {
        if (toReset === true) {
            resetToReset()
        }
    }, [resetToReset, toReset])

    return (<Stack direction={"row"} width="100%" alignItems="center" spacing={"2px"}>
        <Typography
            onDoubleClick={() => { navigator.clipboard.writeText(props.attribute.LogicalName); setToUpdate() }}
            key={props.attribute.LogicalName + "_label"}
            title={props.attribute.DisplayName + "(" + props.attribute.LogicalName + ")"}
            width="80%"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            overflow="hidden"
            color={props.disabled ? "lightgray" : "#666"}
        >
            {props.attribute.DisplayName}
        </Typography>
        <FormControl size='small' fullWidth>
            <AttributeFactory
                key={props.attribute.LogicalName}
                attribute={props.attribute}
                entityname={props.entityname}
                value={props.value}
                setToUpdate={setToUpdate}
                manageDirty={{ set: manageDirty.setTrue, remove: manageDirty.setFalse }}
                reset={toReset}
                disabled={props.disabled}
            />
        </FormControl>
        <IconButton aria-label="delete" onClick={removeToUpdate}>
            <DeleteIcon fontSize='large' />
        </IconButton>

    </Stack >)
}

function AttributeFactory(props: AttributeProps) {

    switch (props.attribute.MStype) {
        case MSType.Lookup:
            return (<LookupNode
                attribute={props.attribute}
                entityname={props.entityname}
                value={props.value}
                setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                disabled={props.disabled}
            />)
        case MSType.String:
            return (<StringNode
                attribute={props.attribute}
                entityname={props.entityname}
                value={props.value}
                setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                disabled={props.disabled}
            />)
        case MSType.Memo:
            return (<MemoNode
                attribute={props.attribute}
                entityname={props.entityname}
                value={props.value}
                setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                disabled={props.disabled}
            />)
        case MSType.Decimal:
            return (<DecimalNode
                attribute={props.attribute}
                entityname={props.entityname}
                value={props.value}
                setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                disabled={props.disabled}
            />)
        case MSType.Double:
            return (<DoubleNode
                attribute={props.attribute}
                entityname={props.entityname}
                value={props.value}
                setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                disabled={props.disabled}
            />)
        case MSType.Money:
            return (<MoneyNode
                attribute={props.attribute}
                entityname={props.entityname}
                value={props.value}
                setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                disabled={props.disabled}
            />)
        case MSType.Integer:
            return (<IntegerNode
                attribute={props.attribute}
                entityname={props.entityname}
                value={props.value}
                setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                disabled={props.disabled}
            />)
        case MSType.BigInt:
            return (<BigIntNode
                attribute={props.attribute}
                entityname={props.entityname}
                value={props.value}
                setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                disabled={props.disabled}
            />)
        case MSType.Boolean:
            return (<BooleanNode
                attribute={props.attribute}
                entityname={props.entityname}
                value={props.value}
                setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                disabled={props.disabled}
            />)
        case MSType.DateTime:
            return (<DateTimeNode
                attribute={props.attribute}
                entityname={props.entityname}
                value={props.value}
                setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                disabled={props.disabled}
            />)
        case MSType.Status:
            return (<PicklistNode
                attribute={props.attribute}
                entityname={props.entityname}
                value={props.value}
                setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                disabled={props.disabled}
            />)
        case MSType.State:
            return (<PicklistNode
                attribute={props.attribute}
                entityname={props.entityname}
                value={props.value}
                setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                disabled={props.disabled}
            />)
        case MSType.Picklist:
            return (<PicklistNode
                nullable
                attribute={props.attribute}
                entityname={props.entityname}
                value={props.value}
                setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                disabled={props.disabled}
            />)
        case MSType.MultiSelectPicklist:
            return (<PicklistNode
                multiple
                attribute={props.attribute}
                entityname={props.entityname}
                value={props.value}
                setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                disabled={props.disabled}
            />)
        case MSType.Image:
            return (<ImageNode
                attribute={props.attribute}
                entityname={props.entityname}
                value={props.value}
                setToUpdate={props.setToUpdate}
                manageDirty={props.manageDirty}
                reset={props.reset}
                disabled={props.disabled}
            />)
        default:
            return (<></>)
    }
}

function LookupNode(props: AttributeProps) {
    const [oldValue, setOldValue] = useState(props.value)
    const [value, setValue] = useState(props.value)
    const setDirty = (newValue?: string) => {
        if (oldValue !== newValue) {
            props.manageDirty.set()
        }
        else {
            props.manageDirty.remove()
        }
    }

    useEffect(() => {
        setOldValue(props.value)
        setValue(props.value)
    }, [props.value])

    useEffect(() => {
        if (props.reset) {
            setValue(oldValue)
            props.manageDirty.remove()
        }
    }, [oldValue, props.manageDirty, props.reset])

    const onChange = (newValue?: string) => {
        props.setToUpdate()
        setValue(newValue)
        setDirty(newValue)
    }

    return <RecordSelector
        entityname={props.attribute.Parameters.Target}
        recordid={value}
        setRecordid={onChange}
        disabled={props.disabled}
    />
}
function StringNode(props: AttributeProps) {
    const [oldValue, setOldValue] = useState(props.value)
    const [value, setValue] = useState(props.value)
    const setDirty = (newValue?: string) => {
        if (oldValue !== newValue) {
            props.manageDirty.set()
        }
        else {
            props.manageDirty.remove()
        }
    }

    useEffect(() => {
        setOldValue(props.value)
        setValue(props.value)
    }, [props.value])

    useEffect(() => {
        if (props.reset) {
            setValue(oldValue)
            props.manageDirty.remove()
        }
    }, [oldValue, props.manageDirty, props.reset])

    const onChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        props.setToUpdate()
        setValue(newValue)
        setDirty(newValue)
    }

    return (<TextField
        placeholder='Enter a string'
        size={"small"}
        fullWidth
        inputProps={{ maxLength: props.attribute.Parameters.MaxLength }}
        value={value}
        onFocus={props.setToUpdate}
        onChange={onChange}
        disabled={props.disabled}
    />)
}
function MemoNode(props: AttributeProps) {
    const [oldValue, setOldValue] = useState(props.value)
    const [value, setValue] = useState(props.value)
    const setDirty = (newValue?: string) => {
        if (oldValue !== newValue) {
            props.manageDirty.set()
        }
        else {
            props.manageDirty.remove()
        }
    }

    useEffect(() => {
        setOldValue(props.value)
        setValue(props.value)
    }, [props.value])

    useEffect(() => {
        if (props.reset) {
            setValue(oldValue)
            props.manageDirty.remove()
        }
    }, [oldValue, props.manageDirty, props.reset])

    const onChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setValue(newValue)
        setDirty(newValue)
    }


    return (<TextField
        placeholder='Enter a string'
        size={"small"}
        fullWidth
        multiline
        rows={1}
        inputProps={{ maxLength: props.attribute.Parameters.MaxLength }}
        value={value}
        onFocus={props.setToUpdate}
        onChange={onChange}
        disabled={props.disabled}
    />)
}
function DecimalNode(props: AttributeProps) {
    const [oldValue, setOldValue] = useState<number | null>(props.value ? parseInt(props.value) : null);
    const [value, setValue] = useState<number | null>(props.value ? parseInt(props.value) : null)
    const setDirty = (newValue?: number | null) => {
        if (oldValue !== newValue) {
            props.manageDirty.set()
        }
        else {
            props.manageDirty.remove()
        }
    }

    useEffect(() => {
        setOldValue(props.value ? parseInt(props.value) : null)
        setValue(props.value ? parseInt(props.value) : null)
    }, [props.value])

    useEffect(() => {
        if (props.reset) {
            setValue(oldValue)
            props.manageDirty.remove()
        }
    }, [oldValue, props.manageDirty, props.reset])

    const onChange = (event: React.SyntheticEvent<HTMLElement>, newValue?: string) => {
        props.setToUpdate()
        setValue(newValue ? parseInt(newValue) : null)
        setDirty(newValue ? parseInt(newValue) : null)
    }

    return (<TextField
        inputMode='decimal'
        size={"small"}
        fullWidth
        placeholder={"Decimal by " + props.attribute.Parameters.Precision}
        inputProps={{
            min: props.attribute.Parameters.MinValue,
            max: props.attribute.Parameters.MaxValue,
            step: props.attribute.Parameters.Precision
        }}
        value={value?.toString()}
        onFocus={props.setToUpdate}
        onChange={onChange}
        disabled={props.disabled}
    />)
}
function DoubleNode(props: AttributeProps) {
    const [oldValue, setOldValue] = useState<number | null>(props.value ? parseInt(props.value) : null);
    const [value, setValue] = useState<number | null>(props.value ? parseInt(props.value) : null)
    const setDirty = (newValue?: number | null) => {
        if (oldValue !== newValue) {
            props.manageDirty.set()
        }
        else {
            props.manageDirty.remove()
        }
    }

    useEffect(() => {
        setOldValue(props.value ? parseInt(props.value) : null)
        setValue(props.value ? parseInt(props.value) : null)
    }, [props.value])

    useEffect(() => {
        if (props.reset) {
            setValue(oldValue)
            props.manageDirty.remove()
        }
    }, [oldValue, props.manageDirty, props.reset])

    const onChange = (event: React.SyntheticEvent<HTMLElement>, newValue?: string) => {
        props.setToUpdate()
        setValue(newValue ? parseInt(newValue) : null)
        setDirty(newValue ? parseInt(newValue) : null)
    }

    return (<TextField
        inputMode='decimal'
        size={"small"}
        fullWidth
        placeholder={"Double by " + props.attribute.Parameters.Precision}
        inputProps={{
            min: props.attribute.Parameters.MinValue,
            max: props.attribute.Parameters.MaxValue,
            step: props.attribute.Parameters.Precision
        }}
        value={value?.toString()}
        onFocus={props.setToUpdate}
        onChange={onChange}
        disabled={props.disabled}
    />)
}
function MoneyNode(props: AttributeProps) {
    const [oldValue, setOldValue] = useState<number | null>(props.value ? parseInt(props.value) : null);
    const [value, setValue] = useState<number | null>(props.value ? parseInt(props.value) : null)
    const setDirty = (newValue?: number | null) => {
        if (oldValue !== newValue) {
            props.manageDirty.set()
        }
        else {
            props.manageDirty.remove()
        }
    }

    useEffect(() => {
        setOldValue(props.value ? parseInt(props.value) : null)
        setValue(props.value ? parseInt(props.value) : null)
    }, [props.value])

    useEffect(() => {
        if (props.reset) {
            setValue(oldValue)
            props.manageDirty.remove()
        }
    }, [oldValue, props.manageDirty, props.reset])

    const onChange = (event: React.SyntheticEvent<HTMLElement>, newValue?: string) => {
        props.setToUpdate()
        setValue(newValue ? parseInt(newValue) : null)
        setDirty(newValue ? parseInt(newValue) : null)
    }

    return (<TextField
        inputMode='decimal'
        size={"small"}
        fullWidth
        placeholder={"Money by " + props.attribute.Parameters.Precision}
        inputProps={{
            min: props.attribute.Parameters.MinValue,
            max: props.attribute.Parameters.MaxValue,
            step: props.attribute.Parameters.Precision
        }}
        value={value?.toString()}
        onFocus={props.setToUpdate}
        onChange={onChange}
        disabled={props.disabled}
    />)
}
function IntegerNode(props: AttributeProps) {
    const [oldValue, setOldValue] = useState<number | null>(props.value ? parseInt(props.value) : null);
    const [value, setValue] = useState<number | null>(props.value ? parseInt(props.value) : null)
    const setDirty = (newValue?: number | null) => {
        if (oldValue !== newValue) {
            props.manageDirty.set()
        }
        else {
            props.manageDirty.remove()
        }
    }

    useEffect(() => {
        setOldValue(props.value ? parseInt(props.value) : null)
        setValue(props.value ? parseInt(props.value) : null)
    }, [props.value])

    useEffect(() => {
        if (props.reset) {
            setValue(oldValue)
            props.manageDirty.remove()
        }
    }, [oldValue, props.manageDirty, props.reset])

    const onChange = (event: React.SyntheticEvent<HTMLElement>, newValue?: string) => {
        props.setToUpdate()
        setValue(newValue ? parseInt(newValue) : null)
        setDirty(newValue ? parseInt(newValue) : null)
    }

    return (<TextField
        inputMode='numeric'
        size={"small"}
        fullWidth
        placeholder={"Integer"}
        inputProps={{
            min: props.attribute.Parameters.MinValue,
            max: props.attribute.Parameters.MaxValue,
            step: props.attribute.Parameters.Precision
        }}
        value={value?.toString()}
        onFocus={props.setToUpdate}
        onChange={onChange}
        disabled={props.disabled}
    />)
}
function BigIntNode(props: AttributeProps) {
    const [oldValue, setOldValue] = useState<number | null>(props.value ? parseInt(props.value) : null);
    const [value, setValue] = useState<number | null>(props.value ? parseInt(props.value) : null)
    const setDirty = (newValue?: number | null) => {
        if (oldValue !== newValue) {
            props.manageDirty.set()
        }
        else {
            props.manageDirty.remove()
        }
    }

    useEffect(() => {
        setOldValue(props.value ? parseInt(props.value) : null)
        setValue(props.value ? parseInt(props.value) : null)
    }, [props.value])

    useEffect(() => {
        if (props.reset) {
            setValue(oldValue)
            props.manageDirty.remove()
        }
    }, [oldValue, props.manageDirty, props.reset])

    const onChange = (event: React.SyntheticEvent<HTMLElement>, newValue?: string) => {
        props.setToUpdate()
        setValue(newValue ? parseInt(newValue) : null)
        setDirty(newValue ? parseInt(newValue) : null)
    }

    return (<TextField
        inputMode='numeric'
        size={"small"}
        fullWidth
        placeholder={"BigInt"}
        inputProps={{
            min: props.attribute.Parameters.MinValue,
            max: props.attribute.Parameters.MaxValue,
            step: props.attribute.Parameters.Precision
        }}
        value={value?.toString()}
        onFocus={props.setToUpdate}
        onChange={onChange}
        disabled={props.disabled}
    />)
}
function BooleanNode(props: AttributeProps) {
    const [oldValue, setOldValue] = useState(props.value);
    const [value, setValue] = useState(props.value)
    const setDirty = (checked?: boolean) => {
        console.log("Boolean test: " + oldValue, checked)
        if (oldValue !== checked) {
            props.manageDirty.set()
        }
        else {
            props.manageDirty.remove()
        }
    }

    useEffect(() => {
        setOldValue(props.value)
        setValue(props.value)
    }, [props.value])

    useEffect(() => {
        if (props.reset) {
            setValue(oldValue)
            props.manageDirty.remove()
        }
    }, [oldValue, props.manageDirty, props.reset])

    const onChange = (event: React.ChangeEvent<HTMLElement>, checked?: boolean) => {
        setValue(checked)
        setDirty(checked)
    }

    return (<Checkbox
        size={"small"}
        checked={value}
        onFocus={props.setToUpdate}
        onChange={onChange}
        disabled={props.disabled}
    />)
}
function DateTimeNode(props: AttributeProps) {
    const [oldValue, setOldValue] = useState<Dayjs | null>(dayjs(props.value));
    const [value, setValue] = useState<Dayjs | null>(dayjs(props.value))
    const setDirty = (date: Dayjs) => {
        console.log("debug date");

        if (oldValue !== date) {
            props.manageDirty.set()
        }
        else {
            props.manageDirty.remove()
        }
    }

    useEffect(() => {
        setOldValue(dayjs(props.value))
        setValue(dayjs(props.value))
    }, [props.value])

    useEffect(() => {
        if (props.reset) {
            setValue(oldValue)
            props.manageDirty.remove()
        }
    }, [oldValue, props.manageDirty, props.reset])

    const onChange = (date: Dayjs | null) => {
        props.setToUpdate()
        setValue(dayjs(date))
        setDirty(dayjs(date))
    }

    const onFormatDate = (date?: Date): string => {
        return !date ? '' : date.getDate() + '/' + (date.getMonth() + 1) + '/' + (date.getFullYear())
    }
    return (<>{props.attribute.Parameters.Format === MSDateFormat.DateOnly ?
        <DatePicker
            value={value}
            onChange={onChange}
            renderInput={(params) => <TextField {...params} size={"small"} fullWidth />}
            disabled={props.disabled}
        />
        :
        <DateTimePicker
            ampm={false}
            onChange={onChange}
            value={value}
            renderInput={(params) => (
                <TextField {...params} size={"small"} fullWidth />
            )}
            disabled={props.disabled}
        />}
    </>)
}
// function StatusNode(props: AttributeProps) {
//     const [oldValue, setOldValue] = useState(props.value);
//     const [value, setValue] = useState(props.value)
//     const setDirty = (newOption?: typeof value) => {
//         if (oldValue !== newOption) {
//             props.manageDirty.set()
//         }
//         else {
//             props.manageDirty.remove()
//         }
//     }

//     useEffect(() => {
//         setOldValue(props.value)
//         setValue(props.value)
//     }, [props.value])

//     useEffect(() => {
//         if (props.reset) {
//             setValue(oldValue)
//             props.manageDirty.remove()
//         }
//     }, [oldValue, props.manageDirty, props.reset])

//     const onChange = (event: SelectChangeEvent) => {
//         setValue(event.target.value)
//         setDirty(event.target.value)
//     }

//     const statusOptions = RetrievePicklistValues(props.entityname, props.attribute.MStype, props.attribute.LogicalName)
//     return (<Select
//         value={value}
//         onFocus={props.setToUpdate}
//         onChange={onChange}
//         size={"small"}
//         fullWidth
//         disabled={props.disabled}
//     >
//         {
//             statusOptions?.map((option) => {
//                 return <MenuItem value={option.value}>{option.text}</MenuItem>
//             })
//         }
//     </Select>)
// }
function PicklistNode(props: AttributeProps & { nullable?: boolean, multiple?: boolean }) {
    const [oldValue, setOldValue] = useState<number>(props.value);
    const [value, setValue] = useState<number>(props.value)
    const setDirty = (newOption: typeof value) => {
        if (oldValue !== newOption) {
            props.manageDirty.set()
        }
        else {
            props.manageDirty.remove()
        }
    }

    useEffect(() => {
        setOldValue(props.value)
        setValue(props.value)
    }, [props.value])

    useEffect(() => {
        if (props.reset) {
            setValue(oldValue)
            props.manageDirty.remove()
        }
    }, [oldValue, props.manageDirty, props.reset])

    const onChange = (event: SelectChangeEvent<number>) => {
        props.setToUpdate()
        const newValue = typeof event.target.value == 'string' ? -1 : event.target.value
        setValue(newValue)
        setDirty(newValue)
    }

    const stateOptions = RetrievePicklistValues(props.entityname, props.attribute.MStype, props.attribute.LogicalName)

    return (<Select
        multiple={props.multiple}
        value={value ?? -1}
        onFocus={props.setToUpdate}
        onChange={onChange}
        size={"small"}
        fullWidth
        disabled={props.disabled}
    >
        {props.nullable && <MenuItem value={-1}>- - -</MenuItem>}
        {
            stateOptions?.map((option) => {
                return <MenuItem value={option.value}>{option.text}</MenuItem>
            })
        }
    </Select>)
}
// function PicklistNode(props: AttributeProps) {
//     const [oldValue, setOldValue] = useState(props.value);
//     const [value, setValue] = useState(props.value)
//     const setDirty = (newOption?: typeof value) => {
//         if (oldValue !== newOption) {
//             props.manageDirty.set()
//         }
//         else {
//             props.manageDirty.remove()
//         }
//     }

//     useEffect(() => {
//         setOldValue(props.value)
//         setValue(props.value)
//     }, [props.value])

//     useEffect(() => {
//         if (props.reset) {
//             setValue(oldValue)
//             props.manageDirty.remove()
//         }
//     }, [oldValue, props.manageDirty, props.reset])

//     const onChange = (event: SelectChangeEvent) => {
//         props.setToUpdate()
//         setValue(event.target.value)
//         setDirty(event.target.value)
//     }

//     const picklistOptions = RetrievePicklistValues(props.entityname, props.attribute.MStype, props.attribute.LogicalName)
//     return (<Select
//         value={value ?? -1}
//         onFocus={props.setToUpdate}
//         onChange={onChange}
//         size={"small"}
//         fullWidth
//         disabled={props.disabled}
//     >
//         <MenuItem value={-1}>- - -</MenuItem>
//         {
//             picklistOptions?.map((option) => {
//                 return <MenuItem value={option.value}>{option.text}</MenuItem>
//             })
//         }
//     </Select>)
// }
// function MultiSelectPicklistNode(props: AttributeProps) {
//     const [oldValue, setOldValue] = useState<string[]>(props.value?.split(','));
//     const [valueList, setValue] = useState<string[]>(props.value?.split(','))
//     const setDirty = (option?: string[]) => {
//         if (oldValue !== option) {
//             props.manageDirty.set()
//         }
//         else {
//             props.manageDirty.remove()
//         }
//     }

//     useEffect(() => {
//         setOldValue(props.value?.split(','))
//         setValue(props.value?.split(','))
//     }, [props.value])

//     useEffect(() => {
//         if (props.reset) {
//             setValue(oldValue)
//             props.manageDirty.remove()
//         }
//     }, [oldValue, props.manageDirty, props.reset])

//     const onChange = (event: SelectChangeEvent<typeof valueList>) => {
//         props.setToUpdate()
//         const {
//             target: { value: value },
//         } = event;
//         setValue(typeof value === 'string' ? value.split(',') : value,)
//         setDirty(typeof value === 'string' ? value.split(',') : value,)
//     }

//     const multiSelectPicklistOptions = RetrievePicklistValues(props.entityname, props.attribute.MStype, props.attribute.LogicalName)
//     return (<Select
//         multiple
//         value={valueList}
//         onFocus={props.setToUpdate}
//         onChange={onChange}
//         size={"small"}
//         fullWidth
//         disabled={props.disabled}
//     >
//         {
//             multiSelectPicklistOptions?.map((option) => {
//                 return <MenuItem value={option.value}>{option.text}</MenuItem>
//             })
//         }
//     </Select>)
// }
function ImageNode(props: AttributeProps) {
    return (<img />)
}

type NavBarProps = {
    setEntityname: (str: string) => void,
    setRecordid: (str: string) => void,
    setCurrentRecord: () => void,
    launchUpdate: () => void,
    setFilterAttribute: (str: string) => void,
    entityname: string,
    recordid: string
}
function NavTopBar(props: NavBarProps) {

    return (<Stack key="topbar" spacing={0.5} width="100%">
        <Stack direction={"row"} key="entityrecordselectors" spacing={0.5} width="100%">
            <EntitySelector setEntityname={props.setEntityname} entityname={props.entityname} />
            <RecordSelector setRecordid={props.setRecordid} entityname={props.entityname} recordid={props.recordid} />
            <Button onClick={props.setCurrentRecord} >Refresh</Button>
        </Stack>
        <Stack direction={"row"} key="attributesselector" spacing={0.5} width="100%">
            <FilterInput returnFilterInput={props.setFilterAttribute} key='attributefilterinput' placeholder='Filter attributes' />
            <Button variant='contained' key='updatebutton' onClick={props.launchUpdate} ><SyncIcon /></Button>
        </Stack>
    </Stack>)
}

type AttributeFilterInputProps = {
    returnFilterInput: (str: string) => void,
    placeholder?:string
}
export const FilterInput: React.FunctionComponent<AttributeFilterInputProps> = (props: AttributeFilterInputProps) => {
        const [value, setValue] = useState("")

        return (<FormControl size='small' fullWidth>
            <TextField
                size='small'
                inputMode='search'
                value={value}
                onChange={(e) => {
                    setValue(e?.target.value ?? "")
                    props.returnFilterInput(e?.target.value ?? "")
                }}
                placeholder={props.placeholder}
                fullWidth
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <FilterAltIcon />
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <IconButton
                            sx={{ visibility: value ? "visible" : "hidden" }}
                            onClick={()=>{
                                setValue("")
                                props.returnFilterInput("")
                            }}
                        >
                            <ClearIcon />
                        </IconButton>
                    )
                }}

            />
        </FormControl>)
    }

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

    return (<FormControl size='small' fullWidth>
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
    </FormControl>)
}

type RecordSelectorProps = {
    setRecordid: (str: string) => void,
    entityname: string,
    recordid: string,
    disabled?: boolean
}
type RecordOption = {
    id: string,
    label: string
}
const RecordSelector: React.FunctionComponent<RecordSelectorProps> = (props) => {
    const { setRecordid, entityname, recordid, disabled } = props;

    const [recordsIds, setRecordsIds] = useState<string[]>([recordid])
    const recordsDisplayNames = RetrieveRecordsDisplayNames(entityname, recordsIds)
    const { value: isDialogOpen, setValue: setDialogOpen, setTrue: openDialog, setFalse: closeDialog, toggle: toggleDialog } = useBoolean(false)

    useEffect(() => {
        setRecordsIds([recordid])
    }, [recordid])


    return (<>
        <TextField
            size='small'
            fullWidth
            placeholder={'Search ' + entityname}
            onClick={openDialog}
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <SearchIcon />
                    </InputAdornment>
                ),
                readOnly: true,
                style: { cursor: !disabled ? "pointer" : "auto" }
            }}
            inputProps={{
                style: { cursor: !disabled ? "pointer" : "auto" }
            }}
            sx={{ cursor: !disabled ? "pointer" : "auto" }}
            value={recordsDisplayNames.map(r => r.displayName).join(", ")}
            disabled={disabled}
        />
        {!disabled && <RecordSelectorDialog
            closeDialog={closeDialog}
            entityname={entityname}
            open={isDialogOpen}
            records={recordsIds}
            setRecordsIds={setRecordsIds}
        />}
    </>
    )
}

type RecordSelectorDialogProps = {
    open: boolean,
    closeDialog: () => void,
    entityname: string,
    records: string[],
    setRecordsIds: (records: string[]) => void,
    multiple?: boolean
}
const RecordSelectorDialog: React.FunctionComponent<RecordSelectorDialogProps> = (props) => {
    const { closeDialog, open, entityname, records, setRecordsIds: registerRecords, multiple } = props;

    const primaryNameLogicalName = RetrievePrimaryAttribute(entityname)
    const [selectedRecordsIds, setSelectedRecordsIds] = useState<string[]>(records)
    const entityMetadata = RetrieveAttributesMetaData(entityname)
    const allRecords = RetrieveAllRecords(entityname, entityMetadata?.map((value) => {
        if (value.MStype !== MSType.Lookup) return value.LogicalName
        else return "_" + value.LogicalName + "_value"
    }) ?? [])

    useEffect(() => {
        setSelectedRecordsIds(records)
    }, [open])

    const addRecord = (row: GridValidRowModel) => {
        if (multiple) {
            setSelectedRecordsIds([...selectedRecordsIds, row[entityname + "id"]])
        }
        else {
            setSelectedRecordsIds([row[entityname + "id"]])
        }
    }

    const onClose = () => {
        closeDialog();
    }


    const columns: GridColDef[] = useMemo(() => {
        return entityMetadata.map<GridColDef>(meta => {
            return {
                field: meta.LogicalName,
                headerName: meta.DisplayName,
                resizable: true,
                hideable: meta.LogicalName != primaryNameLogicalName,
                hide: meta.LogicalName != primaryNameLogicalName
            }
        })
    }, [entityMetadata])

    const rows: { id: string }[] = useMemo(() => {
        return selectedRecordsIds.map(record => {
            return {
                id: record
            }
        })
    }, [selectedRecordsIds])

    return (<Dialog onClose={onClose} open={open} maxWidth={false}>
        <DialogTitle>
            <Stack direction={"row"} spacing={"5px"} justifyContent="space-between">
            </Stack>
        </DialogTitle>
        <DialogContent style={{ height: "55vh", width: "55vw" }}>
            <DataGrid
                rows={allRecords}
                columns={columns}
                pageSize={25}
                checkboxSelection={multiple ?? false}
                onRowClick={(params) => {
                    addRecord(params.row)
                }}
                onRowDoubleClick={(params) => {
                    addRecord(params.row)
                }}
                components={{
                    Toolbar: CustomToolBar,
                    Pagination: CustomPagination,
                }}
                getRowId={(row) => row[entityname + "id"]}
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose} variant='contained' >Close</Button>
        </DialogActions>
    </Dialog>)
}
function CustomToolBar() {
    return (
        <>
            <GridToolbar />
            <FilterInput returnFilterInput={()=>{}} placeholder='Search Records'/>
        </>
    )
}
function CustomPagination() {
    const apiRef = useGridApiContext();
    const page = useGridSelector(apiRef, gridPageSelector);
    const pageCount = useGridSelector(apiRef, gridPageCountSelector);

    return (
        <Pagination
            color="primary"
            count={pageCount}
            page={page + 1}
            onChange={(event, value) => apiRef.current.setPage(value - 1)}
        />
    );
}

let updateRecord = new UpdateRecordButton()
export default updateRecord