import { Button, ButtonGroup, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControlLabel, IconButton, List, ListItem, ListItemButton, ListItemText, ListSubheader, Slide, Stack, Switch, Typography } from '@mui/material';
import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState, } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../../utils/global/.processClass';
import { useDictionnary } from '../../utils/hooks/use/useDictionnary';
import { ScriptNodeContent } from '../../utils/types/ScriptNodeContent';
import { CodeEditorCommon, CodeEditorDirectory, CodeEditorFile, CodeEditorForwardRef } from '../../utils/components/CodeEditorComponent/utils/types';
import CodeEditor from '../../utils/components/CodeEditorComponent/CodeEditor';
import { buildFileTree, getAllFiles, getFiles } from '../../utils/components/CodeEditorComponent/utils/fileManagement';
import { TransitionProps } from '@mui/material/transitions';
import RestoreIcon from '@mui/icons-material/Restore';
import { GetExtensionId, debugLog, waitForElmList } from '../../utils/global/common';
import { MessageType } from '../../utils/types/Message';
import { useXrmUpdated } from '../../utils/hooks/use/useXrmUpdated';
import { ScriptOverride, ScriptOverrideContent } from '../../utils/types/ScriptOverride';
import CodeIcon from '@mui/icons-material/Code';
import { SvgIconComponent } from '@mui/icons-material';
import { useBoolean } from 'usehooks-ts';
import CircularProgressOverflow from '../../utils/components/CircularProgressOverflow';

const separationOfUrlAndFileName = 'webresources/';

class WebResourceEditor extends ProcessButton {
    constructor() {
        super(
            'webresourceeditor',
            'WebResources Editor',
            <CodeIcon />,
            300
        );
        this.process = WebResourceEditorProcess;
    }

}

const WebResourceEditorProcess = forwardRef<ProcessRef, ProcessProps>(
    function WebRessourceEditorProcess(props: ProcessProps, ref) {

        const xrmUpdated = useXrmUpdated();

        const [isFetching, setIsFetching] = useState(false);
        const [scriptNodeContent, setScriptNodeContent] = useState<ScriptNodeContent[] | null>(null);
        const { dict: scriptsOverrided, keys: scriptsOverridedSrc, setDict: setScriptsOverride, setValue: setScriptOverrideItem, removeValue: removeScriptOverrideItem } = useDictionnary<ScriptOverrideContent>({})
        const [root, setRoot] = useState<CodeEditorDirectory | undefined>();
        const [editorOpen, setEditorOpen] = useState(false);
        const { value: confirmPublishOpen, setTrue: openConfirmPublish, setFalse: closeConfirmPublish } = useBoolean(false);

        useEffect(() => {
            const extensionId = GetExtensionId();
            chrome.runtime.sendMessage(extensionId, { type: MessageType.GETCURRENTSCRIPTOVERRIDING },
                function (response: ScriptOverride | null) {
                    if (response) {
                        setScriptsOverride(response);
                    }
                }
            );
        }, []);


        useEffect(() => {
            setScriptNodeContent(null);
            setIsFetching(true);

            waitForElmList<HTMLIFrameElement>('[id^="ClientApiFrame"]:not([id*="crm_header_global"]):not([id*="id"])').then((docs) => {
                docs &&
                    Promise.all(Array.from(docs).flatMap(doc => {
                        if (doc.contentWindow)
                            return Array.prototype.slice
                                .apply(doc.contentWindow.document.querySelectorAll('script'))
                                .filter((s: HTMLScriptElement, index, array) => s.src.startsWith(Xrm.Utility.getGlobalContext().getClientUrl()))
                                .map<Promise<ScriptNodeContent>>(async (s: HTMLScriptElement) => {
                                    const fileName = s.src.substring(s.src.search(separationOfUrlAndFileName) + separationOfUrlAndFileName.length);
                                    return {
                                        srcRegex: s.src.replace(/\/%7b.*%7d\/webresources/, "/.*/webresources"),
                                        fileName: fileName,
                                        content: await fetch(s.src).then(r => r.text()),
                                        crmId: (await Xrm.WebApi.retrieveMultipleRecords("webresource", `?$select=webresourceid&$filter=(name eq '${fileName}')`).then(
                                            function success(results) {
                                                return results.entities[0]["webresourceid"] as string;
                                            },
                                            function (error) {
                                                console.error(`Error when attempt of retrieve webresource id with : ${error.message}`);
                                            }
                                        ))
                                    } as ScriptNodeContent;
                                });
                    })).then((scriptNodeContents) => {
                        if (!scriptNodeContents) return;
                        const scriptNodeContentsDistinctNotNull: ScriptNodeContent[] = scriptNodeContents.filter((i, index, array) => i && array.findIndex(a => a?.srcRegex === i.srcRegex) === index) as any;
                        debugLog("Scripts found:", scriptNodeContentsDistinctNotNull);
                        setScriptNodeContent(scriptNodeContentsDistinctNotNull);
                        setIsFetching(false);
                    });
            });

        }, [xrmUpdated]);


        useEffect(() => {
            if (!scriptNodeContent) return;
            const root = buildFileTree(scriptNodeContent);
            setRoot(root);
        }, [scriptNodeContent]);

        const overridedFiles = useMemo(() => root && getFiles(root, (file => scriptsOverridedSrc.indexOf(file.src) !== -1)) || [], [root, scriptsOverridedSrc, getFiles]);
        const unloadOverridedFiles = useMemo(() => scriptsOverridedSrc.filter(scriptSrc => !overridedFiles.some(file => file.src === scriptSrc)), [scriptsOverridedSrc, overridedFiles]);

        const handleOnSave = useCallback(
            (fileSaved: CodeEditorFile, rootCopy: CodeEditorDirectory) => {
                setRoot(rootCopy);

                if (!scriptsOverridedSrc.includes(fileSaved.src)) {
                    if (scriptNodeContent?.find(s => s.srcRegex === fileSaved.src)?.content === fileSaved.modifiedContent) {
                        removeScriptOverrideItem(fileSaved.src);
                        return;
                    }
                    const originalContent = scriptNodeContent?.find(script => script.srcRegex === fileSaved.src)?.content ?? "";
                    setScriptOverrideItem(fileSaved.src, { modified: fileSaved.modifiedContent, original: originalContent, webresourceid: fileSaved.crmId });
                }
                else {
                    if (scriptsOverrided[fileSaved.src].original === fileSaved.modifiedContent) {
                        removeScriptOverrideItem(fileSaved.src);
                        return;
                    }
                    if (scriptsOverrided[fileSaved.src].modified !== fileSaved.modifiedContent) {
                        setScriptOverrideItem(fileSaved.src, { ...scriptsOverrided[fileSaved.src], modified: fileSaved.modifiedContent });
                        return;
                    }
                }
            },
            [scriptsOverrided, scriptNodeContent, setScriptOverrideItem, removeScriptOverrideItem, setRoot]
        );
        const handleOnChange = useCallback((fileUnsaved: CodeEditorFile, rootCopy: CodeEditorDirectory) => {
            setRoot(rootCopy);
        }, [setRoot]);
        const handleOnRootUpdate = useCallback((newElement: CodeEditorCommon, rootCopy: CodeEditorDirectory) => {
            setRoot(rootCopy);
        }, [setRoot]);


        const _publishChanges = useCallback(() => {
            closeConfirmPublish();
            setEditorOpen(false);

            Xrm.Utility.showProgressIndicator(`Start webresources update.`);

            scriptsOverridedSrc.forEach(scriptSrc => {
                Xrm.Utility.showProgressIndicator(`Updating Webresource: ${scriptNodeContent?.find(s => s.srcRegex === scriptSrc)?.fileName}.`);

                const record = {
                    content: btoa(unescape(encodeURIComponent(scriptsOverrided[scriptSrc].modified)))
                };

                Xrm.WebApi.updateRecord("webresource", scriptsOverrided[scriptSrc].webresourceid, record).then(
                    function success(result) {
                        var updatedId = result.id;
                        debugLog(`Webresource ${updatedId} content updated`);
                    },
                    function (error) {
                        console.error(`Error when attempt to update the webResource ${scriptSrc}: ${error.message}`);
                    }
                );
            });
            Xrm.Utility.closeProgressIndicator();

            const execute_PublishXml_Request = {
                ParameterXml: `<importexportxml><webresources>${scriptsOverridedSrc.map(scriptSrc => `<webresource>${scriptsOverrided[scriptSrc].webresourceid}</webresource>`).join('')}</webresources></importexportxml>`,
                getMetadata: function () {
                    return {
                        boundParameter: null,
                        parameterTypes: {
                            ParameterXml: { typeName: "Edm.String", structuralProperty: 1 }
                        },
                        operationType: 0, operationName: "PublishXml"
                    };
                }
            };

            Xrm.Utility.showProgressIndicator(`Publishing updated webresources`);
            Xrm.WebApi.online.execute(execute_PublishXml_Request).then(
                function success(response) {
                    if (response.ok) { debugLog("Publish Done"); }
                    Xrm.Utility.closeProgressIndicator();
                }
            ).catch(function (error) {
                console.error(`Error when attempt to publish webressources ${error.message}`);
                Xrm.Utility.closeProgressIndicator();
            });
        }, [scriptsOverridedSrc, scriptNodeContent, scriptsOverrided, closeConfirmPublish]);


        const publishChanges = useCallback(() => {
            if (scriptsOverridedSrc.length === 0) return;
            openConfirmPublish();
        }, [openConfirmPublish, scriptsOverridedSrc]);
        

        const launchLiveTest = useCallback(() => {
            const extensionId = GetExtensionId();
            chrome.runtime.sendMessage(extensionId, { type: MessageType.ENABLESCRIPTOVERRIDING, data: scriptsOverrided },
                function (response) {
                    debugLog("WebRessourceEditorProcess ", MessageType.ENABLESCRIPTOVERRIDING, response);
                    if (response.success) {
                    }
                }
            );

            chrome.runtime.sendMessage(extensionId, { type: MessageType.REFRESHBYPASSCACHE },
                function (response) {
                    if (response.success) {
                    }
                }
            );
        }, [scriptsOverrided]);


        const codeEditorRef = useRef<CodeEditorForwardRef>(null);

        const selectFile = useCallback((selectedFile: CodeEditorFile) => {
            codeEditorRef.current?.selectFile(selectedFile);
            setEditorOpen(true);
        }, [codeEditorRef]);

        const removeScriptOverride = useCallback((selectedFile: CodeEditorFile) => {
            setRoot(oldRoot => {
                if (!oldRoot) {
                    return;
                }
                const [file] = getFiles(oldRoot, file => file.src === selectedFile.src);
                if (file) {
                    file.modifiedContent = scriptsOverrided[selectedFile.src].original;
                    file.previousContent = scriptsOverrided[selectedFile.src].original;
                }
                return oldRoot;
            })
            removeScriptOverrideItem(selectedFile.src);
        }, [scriptsOverrided, removeScriptOverrideItem]);

        return (
            <>
                <Stack spacing={1} height='calc(100% - 10px)' padding='10px' alignItems='center'>

                    <Stack width='100%' direction='column'>
                        <ButtonGroup variant="contained" fullWidth>

                            <Button
                                sx={{
                                    flex: '1'
                                }}
                                onClick={launchLiveTest}
                            >
                                Send scripts & Launch LiveTest
                            </Button>

                        </ButtonGroup>
                        <ButtonGroup variant='outlined' fullWidth>

                            <Button
                                onClick={publishChanges}
                            >
                                Publish
                            </Button>

                            <Button
                                onClick={() => {
                                    setEditorOpen(prev => !prev);
                                }}
                            >
                                Open Editor
                            </Button>

                        </ButtonGroup>
                    </Stack>
                    {
                        unloadOverridedFiles?.length > 0 && <List
                            sx={{ width: '100%', bgcolor: 'background.paper', overflowX: 'hidden', overflowY: 'auto', flex: '0.5' }}
                            component="nav"
                            disablePadding
                            subheader={
                                <ListSubheader component="div">
                                    <strong>Overrided scripts not load:</strong>
                                </ListSubheader>
                            }
                        >
                            {
                                unloadOverridedFiles.map(item => {
                                    const name = item.split("/webresources/")[1]?.split(/[\\/¥₩]+/i).slice(-1)[0] ?? <i>Unfound name</i>;
                                    return <ListItem disablePadding>
                                        <ListItemText
                                            primary={name}
                                            primaryTypographyProps={{
                                                fontSize: '0.85rem',
                                                lineHeight: '1',
                                                padding: "4px 16px"
                                            }}
                                            title={name} />
                                    </ListItem>;
                                })
                            }
                        </List>
                    }
                    <ScriptList
                        text='Overrided scripts:'
                        items={overridedFiles}
                        primaryLabel={(item) => item.name}
                        primaryAction={selectFile}
                        secondaryAction={removeScriptOverride}
                        secondaryIcon={RestoreIcon}
                        secondaryTitle='Restore file'
                    />
                    <CircularProgressOverflow
                        loading={isFetching}
                        disableShrink
                        size={60}
                    >
                        <ScriptList
                            text='Scripts found on this page:'
                            items={root && getAllFiles(root) || []}
                            primaryLabel={(item) => scriptsOverrided[item.src] ? <strong>{item.name}</strong> : item.name}
                            primaryAction={selectFile}
                        />
                    </CircularProgressOverflow>
                </Stack >
                <Dialog
                    fullScreen
                    open={editorOpen}
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
                                onClose={() => setEditorOpen(false)}
                                publishChanges={publishChanges}
                            />
                        }
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={confirmPublishOpen}
                    onClose={closeConfirmPublish}
                >
                    <DialogTitle>
                        Publishing Confirmation
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure to publish these files?
                            <List>
                                {
                                    scriptsOverridedSrc.map(scriptSrc => {
                                        return <ListItem><ListItemText>{scriptSrc.split("/webresources/")[1]?.split(/[\\/¥₩]+/i).slice(-1)[0] ?? <i>Unfound name</i>}</ListItemText></ListItem>;
                                    })
                                }
                            </List>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={closeConfirmPublish}>Cancel</Button>
                        <Button variant='contained' onClick={_publishChanges}>Publish</Button>
                    </DialogActions>
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
    secondaryIcon?: SvgIconComponent,
    secondaryTitle?: string,
}
function ScriptList<T>(props: ScriptListProps<T>) {
    return (
        <List
            sx={{ width: '100%', bgcolor: 'background.paper', overflowX: 'hidden', overflowY: 'auto', flex: '1 1 50%', height: '100%' }}
            component="nav"
            disablePadding
            subheader={
                <ListSubheader component="div">
                    <Typography variant='h6' color='black'>{props.text}</Typography>
                </ListSubheader>
            }
        >
            {
                props.items?.map(item => (
                    <ListItem
                        secondaryAction={
                            props.secondaryAction && props.secondaryIcon && (
                                <IconButton edge="end" title={props.secondaryTitle} onClick={() => props.secondaryAction!(item)}>
                                    <props.secondaryIcon />
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


const webResourceEditor = new WebResourceEditor();
export default webResourceEditor;