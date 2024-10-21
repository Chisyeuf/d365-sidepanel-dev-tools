import { Button, Stack, Theme } from "@mui/material"
import React from "react"
import EntitySelector from "./EntitySelector"
import RecordSelector from "./RecordSelector"
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import { IconButton } from "@material-ui/core"

type RecordSearchBarProps = {
    setEntityName: (str: string) => void,
    setRecordIds: React.Dispatch<React.SetStateAction<string[]>>,
    reset: () => void,
    entityName: string,
    recordIds: string[],
    theme?: Theme,
    multiple?: boolean,
}
const RecordSearchBar: React.FunctionComponent<RecordSearchBarProps> = (props) => {

    const { entityName, multiple, recordIds, setEntityName, setRecordIds, theme, reset } = props;

    return (
        <Stack direction={"row"} spacing={0.5} width="100%">
            <EntitySelector setEntityname={setEntityName} entityname={entityName} />
            <RecordSelector setRecordsIds={setRecordIds} entityname={entityName} recordsIds={recordIds} multiple={props.multiple} theme={theme} />
            <Button
                onClick={reset}
                sx={{
                    fontSize: '0.8em',
                    lineHeight: 'normal'
                }}
            >
                Reset Record
            </Button>
        </Stack>
    )
}

type RecordSearchBarComponentProps = {
    setEntityName: (str: string) => void,
    setRecordId: React.Dispatch<React.SetStateAction<string[]>>,
    reset: () => void,
    entityName: string,
    recordIds: string[],
    theme?: Theme,
    multiple?: boolean,
}
function RecordSearchBarComponent(props: RecordSearchBarComponentProps) {
    const { entityName, multiple, recordIds, setEntityName, setRecordId, theme, reset } = props;
    return (
        <Stack direction={"row"} spacing={0.5} width="100%">
            <EntitySelector setEntityname={setEntityName} entityname={entityName} />
            <RecordSelector setRecordsIds={setRecordId} entityname={entityName} recordsIds={recordIds} multiple={multiple} theme={theme} />
            <IconButton onClick={reset}>
                <RotateLeftIcon />
            </IconButton>
        </Stack>
    )
}

export default RecordSearchBar