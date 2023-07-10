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


    // const { entityName: currentEntityName, isEntityRecord, recordId: currentRecordId } = useCurrentRecord();

    // const [entityName, setEntityName] = useState<string>(currentEntityName ?? '');
    // const [recordIds, setRecordIds] = useState<string[]>([currentRecordId ?? '']);
    // const [isOverrided, setIsOverrided] = useState<boolean>(false);
    // const [autoRefresh, setAutoRefresh] = useState<boolean>(props.autoRefresh ?? false);

    // useEffect(() => {
    //     if (!isOverrided || !autoRefresh) return;
    //     setEntityName(currentEntityName ?? '');
    // }, [currentEntityName, isOverrided]);

    // useEffect(() => {
    //     if (!isOverrided || !autoRefresh) return;
    //     setRecordIds([currentRecordId ?? '']);
    // }, [currentRecordId, isOverrided]);

    // const override = useCallback((newEntityName: string, newRecordIds: string[]) => {
    //     setEntityName(newEntityName);
    //     setRecordIds(newRecordIds);
    //     setIsOverrided(true);
    //     setAutoRefresh(false);
    // }, []);

    // const reset = useCallback(() => {
    //     setIsOverrided(false);
    //     setAutoRefresh(props.autoRefresh ?? false);
    // }, []);



    return (
        <Stack direction={"row"} spacing={0.5} width="100%">
            <EntitySelector setEntityname={setEntityName} entityname={entityName} />
            <RecordSelector setRecordsIds={setRecordIds} entityname={entityName} recordsIds={recordIds} multiple={props.multiple} theme={theme} />
            <Button onClick={reset}>
                Reset
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