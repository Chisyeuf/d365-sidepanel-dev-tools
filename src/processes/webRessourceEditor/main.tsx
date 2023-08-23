import { Button, Dialog, DialogContent, Divider, FormControlLabel, IconButton, List, ListItem, ListItemButton, ListItemText, ListSubheader, Slide, Stack, Switch } from '@mui/material';
import React, { forwardRef, useCallback, useEffect, useRef, useState, } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../../utils/global/.processClass';
import { useDictionnary } from '../../utils/hooks/use/useDictionnary';
import { ScriptNodeContent } from '../../utils/types/ScriptNodeContent';
import { CodeEditorCommon, CodeEditorDirectory, CodeEditorFile, CodeEditorForwardRef } from '../../utils/components/CodeEditorComponent/utils/types';
import CodeEditor from '../../utils/components/CodeEditorComponent/CodeEditor';
import { buildFileTree, getAllFiles, getFiles } from '../../utils/components/CodeEditorComponent/utils/fileManagement';
import { TransitionProps } from '@mui/material/transitions';
import RestoreIcon from '@mui/icons-material/Restore';
import { GetExtensionId, debugLog } from '../../utils/global/common';
import { MessageType } from '../../utils/types/Message';
import { useXrmUpdated } from '../../utils/hooks/use/useXrmUpdated';
import { ScriptOverride } from '../../utils/types/ScriptOverride';
import CodeIcon from '@mui/icons-material/Code';



class WebRessourceEditor extends ProcessButton {
    constructor() {
        super(
            'webressourceeditor',
            'WebRessources Editor',
            <CodeIcon />,
            300
        );
        this.process = WebRessourceEditorProcess;
    }

}

const WebRessourceEditorProcess = forwardRef<ProcessRef, ProcessProps>(
    function WebRessourceEditorProcess(props: ProcessProps, ref) {

        const xrmUpdated = useXrmUpdated();

        const [scriptNodeContent, setScriptNodeContent] = useState<ScriptNodeContent[] | null>(null);
        const { dict: scriptsOverride, keys: scriptsId, values: scriptsContent, setDict: setScriptsOverride, setValue: setScriptOverrideItem, removeValue: removeScriptOverrideItem } = useDictionnary<string>({})
        const [root, setRoot] = useState<CodeEditorDirectory | undefined>();
        const [open, setOpen] = useState(false);
        const [liveTestEnabled, setLiveTestEnabled] = useState<boolean>(false);

        const [liveTestEnabledInitDone, setLiveTestEnabledInitDone] = useState<boolean>(false);
        const [scriptOverrideIntiDone, setScriptOverrideIntiDone] = useState<boolean>(false);

        useEffect(() => {
            const extensionId = GetExtensionId();
            chrome.runtime.sendMessage(extensionId, { type: MessageType.GETCURRENTREQUESTINTERCEPTION },
                function (response: ScriptOverride | null) {
                    if (response) {
                        setScriptsOverride(response);
                    }
                    setScriptOverrideIntiDone(true);
                }
            );
            chrome.runtime.sendMessage(extensionId, { type: MessageType.ISDEBUGGERATTACHED },
                function (response: boolean) {
                    setLiveTestEnabled(response);
                    setTimeout(() => {
                        setLiveTestEnabledInitDone(true);
                    }, 500);
                }
            );
        }, []);


        useEffect(() => {
            document.querySelectorAll('[id^="ClientApiFrame"]:not([id*="crm_header_global"]):not([id*="id"])');
            setScriptNodeContent(null);
            const docs = document.querySelectorAll<HTMLIFrameElement>('[id^="ClientApiFrame"]');
            Promise.all(Array.from(docs).flatMap(doc => {
                if (doc.contentWindow)
                    return Array.prototype.slice
                        .apply(doc.contentWindow.document.querySelectorAll('script'))
                        .filter((s: HTMLScriptElement) => s.src.startsWith(Xrm.Utility.getGlobalContext().getClientUrl()))
                        .map<Promise<ScriptNodeContent>>(async (s: HTMLScriptElement) => {
                            return {
                                src: s.src,
                                content: await fetch(s.src).then(r => r.text())
                            } as ScriptNodeContent;
                        })
            })).then((scriptNodeContents) => {
                if (!scriptNodeContents) return;
                const scriptNodeContentsNotNull: ScriptNodeContent[] = scriptNodeContents.filter(i => i) as any;
                debugLog("Scripts found:", scriptNodeContentsNotNull);
                setScriptNodeContent(scriptNodeContentsNotNull);
            });
        }, [xrmUpdated]);

        useEffect(() => {
            if (!scriptNodeContent) return;
            const root = buildFileTree(scriptNodeContent);
            setRoot(root);
        }, [scriptNodeContent]);


        const handleOnSave = useCallback(
            (fileSaved: CodeEditorFile, rootCopy: CodeEditorDirectory) => {
                // console.log("filesSaved:", fileSaved);
                setRoot(rootCopy);
                if (scriptNodeContent?.find(s => s.src === fileSaved.url)?.content === fileSaved.modifiedContent) {
                    removeScriptOverrideItem(fileSaved.url);
                    return;
                }
                if (scriptsOverride[fileSaved.url] !== fileSaved.modifiedContent) {
                    setScriptOverrideItem(fileSaved.url, fileSaved.modifiedContent);
                    return;
                }
            },
            [scriptsOverride, scriptNodeContent, setScriptOverrideItem, removeScriptOverrideItem, setRoot]
        );
        const handleOnChange = useCallback(
            (fileUnsaved: CodeEditorFile, rootCopy: CodeEditorDirectory) => {
                // console.log("filesUnsaved:", fileUnsaved);
                setRoot(rootCopy);
            },
            [setRoot]
        );
        const handleOnRootUpdate = useCallback(
            (newElement: CodeEditorCommon, rootCopy: CodeEditorDirectory) => {
                setRoot(rootCopy);
            },
            [setRoot]
        );


        useEffect(() => {
            console.log(scriptsOverride);
        }, [scriptsOverride]);



        useEffect(() => {
            if (!liveTestEnabledInitDone) return;
            if (!scriptOverrideIntiDone) return;
            
            const extensionId = GetExtensionId();

            if (liveTestEnabled) {
                chrome.runtime.sendMessage(extensionId, { type: MessageType.ENABLEREQUESTINTERCEPTION, data: scriptsOverride },
                    function (response) {
                        debugLog("WebRessourceEditorProcess ", MessageType.ENABLEREQUESTINTERCEPTION, response);
                        if (response.success) {
                        }
                    }
                );
            }
            else {
                chrome.runtime.sendMessage(extensionId, { type: MessageType.DISABLEREQUESTINTERCEPTION },
                    function (response) {
                        debugLog("WebRessourceEditorProcess ", MessageType.DISABLEREQUESTINTERCEPTION, response);
                        if (response.success) {
                        }
                    }
                );
            }
        }, [liveTestEnabled, scriptsOverride]);


        const codeEditorRef = useRef<CodeEditorForwardRef>(null);

        const selectFile = useCallback((selectedFile: CodeEditorFile) => {
            codeEditorRef.current?.selectFile(selectedFile);
            setOpen(true);
        }, [codeEditorRef]);

        const removeScriptOverride = useCallback((selectedFile: CodeEditorFile) => {
            removeScriptOverrideItem(selectedFile.id);
        }, [removeScriptOverrideItem]);


        return (
            <>
                <Stack spacing={1} width='calc(100% - 10px)' padding='10px' alignItems='center'>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={liveTestEnabled}
                                onClick={() => {
                                    setLiveTestEnabled(prev => !prev);
                                }}
                            />
                        }
                        label="Live Testing Enabled"
                    />
                    
                    <Button
                        variant='contained'
                        onClick={() => {
                            const extensionId = GetExtensionId();
                            chrome.runtime.sendMessage(extensionId, { type: MessageType.REFRESHBYPASSCACHE },
                                function (response) {
                                    if (response.success) {
                                    }
                                }
                            );
                        }}
                    >
                        Refresh without cache
                    </Button>

                    <Divider />

                    <Button
                        variant='contained'
                        onClick={() => {

                        }}
                    >
                        Publish Overrided Content
                    </Button>

                    <Divider />

                    <Button
                        variant='contained'
                        onClick={() => {
                            setOpen(prev => !prev);
                        }}
                    >
                        Open Editor
                    </Button>

                    <ScriptList
                        text='Scripts overrided :'
                        items={root && getFiles(root, (file => scriptsId.indexOf(file.url) !== -1)) || []}
                        primaryLabel={(item) => item.name}
                        primaryAction={selectFile}
                        secondaryAction={removeScriptOverride}
                    />
                    <ScriptList
                        text='Scripts found in this page :'
                        items={root && getAllFiles(root) || []}
                        primaryLabel={(item) => scriptsOverride[item.url] ? <strong>{item.name}</strong> : item.name}
                        primaryAction={selectFile}
                    />
                </Stack >
                <Dialog
                    fullScreen
                    open={open}
                    maxWidth={false}
                    TransitionComponent={Transition}
                    keepMounted
                >
                    <DialogContent sx={{ padding: '0', }}>
                        {root &&
                            <CodeEditor
                                ref={codeEditorRef}
                                root={root}
                                theme='vs-dark'
                                defaultLanguage='javascript'
                                onChange={handleOnChange}
                                onSave={handleOnSave}
                                onRootUpdate={handleOnRootUpdate}
                                onClose={() => setOpen(false)}
                            />
                        }
                    </DialogContent>
                </Dialog>
            </>
        );
    }
);

type ScriptListProps<T> = {
    text: string,
    items: T[],
    primaryLabel: (item: T) => React.ReactNode,
    primaryAction: (item: T) => void,
    secondaryAction?: (item: T) => void,
}
function ScriptList<T>(props: ScriptListProps<T>) {
    return (
        <List
            sx={{ width: '100%', bgcolor: 'background.paper' }}
            component="nav"
            disablePadding
            subheader={
                <ListSubheader component="div">
                    <strong>{props.text}</strong>
                </ListSubheader>
            }
        >
            {
                props.items?.map(item => (
                    <ListItem
                        secondaryAction={
                            props.secondaryAction && (
                                <IconButton edge="end" title='Restore file' onClick={() => props.secondaryAction!(item)}>
                                    <RestoreIcon />
                                </IconButton>
                            )
                        }
                        disablePadding
                    >
                        <ListItemButton dense onClick={() => props.primaryAction(item)}>
                            <ListItemText
                                primary={props.primaryLabel(item)}
                                primaryTypographyProps={{
                                    fontSize: '0.85rem',
                                    lineHeight: '1',
                                }} />
                        </ListItemButton>
                    </ListItem>)
                )
            }
        </List>
    );
}

const Transition = forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});


const webRessourceEditor = new WebRessourceEditor();
export default webRessourceEditor;