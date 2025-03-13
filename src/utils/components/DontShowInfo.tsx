import { Alert, Stack, FormControlLabel, Checkbox, Button } from "@mui/material";
import OpenOptionsButton from "./OpenOptionsButton";
import { PropsWithChildren, useState } from "react";
import { MessageType } from "../types/Message";
import { STORAGE_DontShowInfo, TYPE_DontShowInfo } from "../global/var";
import { useEffectOnce } from "../hooks/use/useEffectOnce";
import { useDictionnary } from "../hooks/use/useDictionnary";
import { useSpDevTools } from "../global/spContext";
import MessageManager from "../global/MessageManager";
import { debugLog } from "../global/common";



interface DontShowInfoProps {
    storageName: string;
    displayOpenOptionButton?: boolean;
}
function DontShowInfo(props: DontShowInfoProps & PropsWithChildren) {
    const { storageName, displayOpenOptionButton = false, children } = props;

    const { isDebug } = useSpDevTools();

    const { dict: dontShowInfos, setValue: setDontShowInfo, setDict: setDontShowInfos } = useDictionnary<TYPE_DontShowInfo['']>({});
    const [closeInfo, setCloseInfo] = useState<boolean>(true);

    useEffectOnce(
        () => {
            MessageManager.sendMessage(MessageType.GETCONFIGURATION, { key: STORAGE_DontShowInfo }).then(
                function (response: TYPE_DontShowInfo | null) {
                    setDontShowInfos(response ?? {});
                    setCloseInfo(response?.[storageName] ?? false);
                }
            );
        }
    );

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const dontShowInfoValue = event.target.checked;

        MessageManager.sendMessage(MessageType.GETCONFIGURATION, { key: STORAGE_DontShowInfo }).then(
            function (response: TYPE_DontShowInfo | null) {
                setDontShowInfo(storageName, dontShowInfoValue);
                setTimeout(() => {
                    MessageManager.sendMessage(MessageType.SETCONFIGURATION, { key: STORAGE_DontShowInfo, configurations: { [storageName]: dontShowInfoValue, ...response } });
                }, 1000);
            }
        );
    };


    return (
        !closeInfo ?

            <Alert severity='info'>
                <Stack direction='column' spacing={0.5}>
                    {children}
                    <Stack direction='row' justifyContent='space-between'>
                        <FormControlLabel control={<Checkbox checked={dontShowInfos[storageName]} onChange={handleChange} size='small' />} label="Don't show again" sx={{ whiteSpace: 'nowrap' }} />
                        <Button variant='outlined' onClick={() => setCloseInfo(true)} sx={{ whiteSpace: 'nowrap' }} >Close info</Button>
                    </Stack>
                    <Stack direction='row' spacing={1}>
                        {displayOpenOptionButton && <OpenOptionsButton variant='contained' />}
                        {isDebug.value && <Button variant="contained" onClick={() => debugLog("DontShowInfo - Storage Content", dontShowInfos)}>Log Storage Content</Button>}
                    </Stack>
                </Stack>
            </Alert>

            : null
    )
}

export default DontShowInfo;