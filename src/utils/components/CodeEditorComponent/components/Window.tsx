
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Editor, { DiffEditor, Monaco } from "@monaco-editor/react";
import { IDisposable, KeyCode, KeyMod, Selection, editor } from 'monaco-editor';
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
    // const onChangeRef = useRef<IDisposable>();
    const onPasteRef = useRef<IDisposable>();
    const onKeyUpRef = useRef<IDisposable>();
    const onKeyDownRef = useRef<IDisposable>();
    const onMouseUpRef = useRef<IDisposable>();
    const onMouseDownRef = useRef<IDisposable>();

    const [cursorSelection, setCursorSelection] = useState<Selection | null>(null);

    // useEffect(() => {
    //     if (isEditorReady && editorRef.current && onContentChange && onContentSave) {

    //         const editor = editorRef.current;

    //         setRef(ref, editor);
    //         editor.focus();

    //         if (cursorSelection)
    //             editor.setSelection(cursorSelection);

    //         editor.onDidChangeCursorSelection((e: editor.ICursorSelectionChangedEvent) => {
    //             setCursorSelection(e.selection);
    //         });

    //         editor.onDidChangeModel((e) => {
    //             const { oldModelUrl, newModelUrl } = e;
    //             // console.log("onDidChangeModel", oldModelUrl, newModelUrl);
    //             if (newModelUrl) {
    //                 // console.log("onChangeRef.current?.dispose();")
    //                 onChangeRef.current?.dispose();
    //             }
    //         });

    //         onChangeRef.current?.dispose();
    //         onChangeRef.current = editor.onDidChangeModelContent((_) => {
    //             console.log("onDidChangeModelContent")
    //             handleEditorChange(editor.getValue());
    //         });

    //         editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyS, () => {
    //             handleEditorSave();
    //         });

    //         editor.addCommand(KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyP, () => {
    //             handlePublish();
    //         });
    //     }
    // }, [isEditorReady, onContentChange, onContentSave, handlePublish]);


    const handleEditorChange = useCallback(
        (value: string | undefined) => {
            onContentChange?.(value);
        },
        [onContentChange],
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
        console.log("editorMount")
        if (editorRef.current)
            handleEditorMountGeneric(editorRef.current);
    }, [editorMount]);


    function handleEditorMountGeneric(editor: editor.IStandaloneCodeEditor) {
        setRef(ref, editor);
        editor.focus();

        // if (cursorSelection)
        //     editor.setSelection(cursorSelection);

        // editor.onDidChangeCursorSelection((e: editor.ICursorSelectionChangedEvent) => {
        //     setCursorSelection(e.selection);
        // });

        // editor.onDidChangeModel((e) => {
        //     const { oldModelUrl, newModelUrl } = e;
        //     console.log("onDidChangeModel", oldModelUrl, newModelUrl);
        //     if (newModelUrl) {
        //         console.log("onChangeRef.current?.dispose();");
        //         onChangeRef.current?.dispose();
        //     }
        // });

        const sendNewContentValue = (_:any) => {
            console.log("onDidContent");
            handleEditorChange(editor.getValue());
        }
        // onChangeRef.current?.dispose();
        // onChangeRef.current = editor.onDidChangeModelContent(sendNewContentValue);
        onPasteRef.current?.dispose();
        onKeyUpRef.current?.dispose();
        onKeyDownRef.current?.dispose();
        onMouseUpRef.current?.dispose();
        onMouseDownRef.current?.dispose();

        onPasteRef.current = editor.onDidPaste(sendNewContentValue);
        onKeyUpRef.current = editor.onKeyUp(sendNewContentValue);
        onKeyDownRef.current = editor.onKeyDown(sendNewContentValue);
        onMouseUpRef.current = editor.onMouseUp(sendNewContentValue);
        onMouseDownRef.current = editor.onMouseDown(sendNewContentValue);

        editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyS, () => {
            handleEditorSave();
        });

        editor.addCommand(KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyP, () => {
            handlePublish();
        });
    }

    function handleEditorMount(editor: editor.IStandaloneCodeEditor, monaco: Monaco) {
        editorRef.current = editor;
        // handleEditorMountGeneric(editor, monaco);
        setEditorMount(prev => !prev);
    }
    function handleDiffEditorMount(editor: editor.IStandaloneDiffEditor, monaco: Monaco) {
        editorRef.current = editor.getModifiedEditor();
        // handleEditorMountGeneric(editor.getModifiedEditor(), monaco);
        setEditorMount(prev => !prev);
    }
    useEffect(() => {
        setEditorMount(prev => !prev);
    }, [file])




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
                        original={file?.originalContent}
                        modified={file?.modifiedContent}
                        language={file?.language ?? undefined}
                        onMount={handleDiffEditorMount}
                    />
            }
        </>
    );
});

export default CodeEditorWindow;
