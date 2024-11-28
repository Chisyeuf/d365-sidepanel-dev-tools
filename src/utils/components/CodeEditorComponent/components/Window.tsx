
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Editor, { DiffEditor, Monaco } from "@monaco-editor/react";
import { IDisposable, KeyCode, KeyMod, editor } from 'monaco-editor';
import { CodeEditorWindowProps } from '../utils/types';

const setRef = (ref: React.ForwardedRef<editor.IStandaloneCodeEditor>, editor: editor.IStandaloneCodeEditor) => {
    if (typeof ref === 'function') {
        ref(editor);
    } else if (ref) {
        ref.current = editor;
    }
}

const CodeEditorWindow = React.forwardRef<editor.IStandaloneCodeEditor, CodeEditorWindowProps>(function CodeEditorWindow(props: CodeEditorWindowProps, ref: React.ForwardedRef<editor.IStandaloneCodeEditor>) {
    const { file, onContentChange, onContentSave, publishChanges, theme, diffEditor } = props;

    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const [editorMount, setEditorMount] = useState<boolean>(false);

    const onChangeRef = useRef<IDisposable>();
    const onMouseLeaveRef = useRef<IDisposable>();

    let timer: NodeJS.Timeout;
    const handleEditorChangeWithDelay = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            if (editorRef.current) {
                sendNewContent();
            }
        }, 500);
    }
    const sendNewContentValue = useCallback(
        (newValue: string | undefined) => {
            onContentChange?.(newValue);
        },
        [onContentChange],
    );
    const sendNewContent = useCallback(
        () => {
            if (editorRef.current) {
                sendNewContentValue(editorRef.current.getValue());
            }
        },
        [sendNewContentValue],
    );


    const handleEditorSave = useCallback(
        () => {
            onContentSave?.();
        },
        [onContentSave],
    );

    const handlePublish = useCallback(
        () => {
            publishChanges?.();
        },
        [publishChanges],
    );

    useEffect(() => {
        if (editorRef.current)
            handleEditorMountGeneric(editorRef.current);
    }, [editorMount]);


    function handleEditorMountGeneric(editor: editor.IStandaloneCodeEditor) {
        setRef(ref, editor);
        editor.focus();

        const sendNewContentValue = (_: any) => {
            sendNewContentValue(editor.getValue());
        }
        onChangeRef.current?.dispose();
        onChangeRef.current = editor.onDidChangeModelContent(handleEditorChangeWithDelay);

        onMouseLeaveRef.current?.dispose();
        onMouseLeaveRef.current = editor.onMouseLeave(sendNewContentValue);

        editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyS, () => {
            sendNewContent();
            handleEditorSave();
        });

        editor.addCommand(KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyP, () => {
            handlePublish();
        });
    }

    function handleEditorMount(editor: editor.IStandaloneCodeEditor, monaco: Monaco) {
        editorRef.current = editor;
        setEditorMount(prev => !prev);
    }
    function handleDiffEditorMount(editor: editor.IStandaloneDiffEditor, monaco: Monaco) {
        editorRef.current = editor.getModifiedEditor();
        setEditorMount(prev => !prev);
    }
    useEffect(() => {
        setEditorMount(prev => !prev);
    }, [file?.id])




    return (
        <>
            {
                !diffEditor ?
                    <Editor
                        keepCurrentModel
                        path={file?.path}
                        theme={theme}
                        value={file?.modifiedContent}
                        defaultLanguage={file?.language ?? undefined}
                        language={file?.language ?? undefined}
                        onMount={handleEditorMount}
                    />
                    :
                    <DiffEditor
                        keepCurrentModifiedModel
                        originalModelPath={file?.path + '_original'}
                        modifiedModelPath={file?.path}
                        theme={theme}
                        modified={file?.modifiedContent}
                        original={file?.previousContent}
                        language={file?.language ?? undefined}
                        onMount={handleDiffEditorMount}
                    />
            }
        </>
    );
});

export default CodeEditorWindow;
