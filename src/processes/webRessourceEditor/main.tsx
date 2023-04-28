
import { Button, Dialog, DialogContent, Slide } from '@mui/material';
import { Stack } from '@mui/system';
import React, { forwardRef, useEffect, useState, } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../../utils/global/.processClass';
import HandymanIcon from '@mui/icons-material/Handyman';

import { GetExtensionId } from '../../utils/global/common';

import { MessageType } from '../../utils/types/Message';
import { useDictionnary } from '../../utils/hooks/use/useDictionnary';
import { ScriptNodeContent } from '../../utils/types/ScriptNodeContent';
import { CodeEditorCommon, CodeEditorDirectory, CodeEditorFile } from '../../utils/components/CodeEditorComponent/utils/types';
import CodeEditor from '../../utils/components/CodeEditorComponent/CodeEditor';
import { buildFileTree } from '../../utils/components/CodeEditorComponent/utils/fileManagement';
import { TransitionProps } from 'notistack';


class WebRessourceEditor extends ProcessButton {
    constructor() {
        super(
            'webressourceeditor',
            'Editor',
            <HandymanIcon />,
            100
        );
        this.process = WebRessourceEditorProcess;
    }

}

// const theme = createTheme({
//     components: {
//         MuiButton: {
//             styleOverrides: {
//                 root: {
//                     maxWidth: "46px",
//                     minWidth: "auto"
//                 },
//                 startIcon: {
//                     marginLeft: 0,
//                     marginRight: 0
//                 }
//             },
//         },
//     },
// });

// const dataTest = `/**
//                 * Name : tls_account_dis.js
//                 * JS File which has a dependency with the entity Account
//                 * into the CRM MDS365 DIS Sales
//                 */

//                /**
//                 * @description : Function that runs when the page is loaded
//                 * @param {*} executionContext
//                 */
//                function onLoad(executionContext) {
//                    alert("onload WIN!!!");
//                }

//                /**
//                 * @description Function that runs when the page is saved
//                 * @param {*} executionContext
//                 */
//                function onSave(executionContext) {
//                    alert("onSave WIN !!!");
//                }
//                `

const WebRessourceEditorProcess = forwardRef<ProcessRef, ProcessProps>(
    function WebRessourceEditorProcess(props: ProcessProps, ref) {

        const [scriptNodeContent, setScriptNodeContent] = useState<ScriptNodeContent[] | null>(null)
        const { dict: scriptsOverride, keys: scriptsSrc, values: scriptsContent, setDict: setScriptsOverride, setValue: setScriptOverrideItem, removeValue: removeScriptOverride } = useDictionnary<string>({})
        const [root, setRoot] = useState<CodeEditorDirectory | undefined>();
        const [open, setOpen] = useState(false);

        useEffect(() => {
            // setScriptOverrideItem('https://dev-crm.crm12.dynamics.com/%7b638173226750000200%7d/webresources/tls_account_dis.js', dataTest);
            console.log("document.querySelectorAl TEST");
            document.querySelectorAll('[id^="ClientApiFrame"]:not([id*="crm_header_global"]):not([id*="id"])');
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
                setScriptNodeContent(scriptNodeContentsNotNull);
            });
        }, []);

        useEffect(() => {
            console.log("buildFileTree TEST");
            if (!scriptNodeContent) return;
            const root = buildFileTree(scriptNodeContent);
            setRoot(root);
        }, [scriptNodeContent])



        // useEffect(() => {
        //     if (!enable) {
        //         const extensionId = GetExtensionId();
        //         chrome.runtime.sendMessage(extensionId, { type: MessageType.DISABLEREQUESTINTERCEPTION },
        //             function (response) {
        //                 console.log("WebRessourceEditorProcess ", MessageType.DISABLEREQUESTINTERCEPTION, response);
        //                 if (response.success) {
        //                 }
        //             }
        //         );
        //     }
        // }, [enable]);

        // useEffect(() => {
        //     if (enable) {
        //         const extensionId = GetExtensionId();
        //         chrome.runtime.sendMessage(extensionId, { type: MessageType.ENABLEREQUESTINTERCEPTION, data: scriptsOverride },
        //             function (response) {
        //                 console.log("WebRessourceEditorProcess ", MessageType.ENABLEREQUESTINTERCEPTION, response);
        //                 if (response.success) {
        //                 }
        //             }
        //         );
        //     }
        // }, [enable]);



        return (
            <Stack spacing={4} width='calc(100% - 10px)' padding='10px' alignItems='center'>
                <Button
                    onClick={() => {
                        setOpen(prev => !prev);
                    }}
                >
                    Test
                </Button>
                <Dialog
                    fullScreen
                    open={open}
                    maxWidth={false}
                    TransitionComponent={Transition}
                >
                    <DialogContent sx={{padding: '0',}}>
                        {root &&
                            <CodeEditor
                                root={root}
                                theme='vs-dark'
                                defaultLanguage='javascript'
                                onChange={(fileUnsaved: CodeEditorFile, rootCopy: CodeEditorDirectory) => {
                                    console.log("filesUnsaved:", fileUnsaved);
                                    setRoot(rootCopy);
                                }}
                                onSave={(fileSaved: CodeEditorFile, rootCopy: CodeEditorDirectory) => {
                                    console.log("filesSaved:", fileSaved);
                                    setRoot(rootCopy);
                                }}
                                onRootUpdate={(newElement: CodeEditorCommon, rootCopy: CodeEditorDirectory) => {
                                    setRoot(rootCopy);
                                }}
                                onClose={() => setOpen(false)}
                            />
                        }
                    </DialogContent>
                </Dialog>
            </Stack>
        );
    }
);

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