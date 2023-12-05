import { Stack, ThemeProvider, createTheme } from "@mui/material";
import CodeEditorHeader, { ChangeLanguage, ContextualMenuAction, DiffEditorAction } from './components/Header';
import CodeEditorWindow from './components/Window';
import { CodeEditorProps, CodeEditorFile, CodeEditorDirectory, CodeEditorCommon, Type, CodeEditorForwardRef } from './utils/types';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { editor } from 'monaco-editor';
import FileTree from "./components/FileTree";
import { getDirectories, getFiles, getLanguageByExtension } from "./utils/fileManagement";
import { ConfirmProvider, useConfirm } from "material-ui-confirm";
import React from "react";
import { EditorLanguage } from "monaco-editor/esm/metadata";

const lightTheme = createTheme({
    palette: {
        mode: 'light',
    },
});
const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

// const CodeEditor = forwardRef<CodeEditorForwardRef, CodeEditorProps>((props: CodeEditorProps, ref) => {
//     return <CodeEditorContainer {...props} />
// })

const CodeEditor = forwardRef<CodeEditorForwardRef, CodeEditorProps>((props: CodeEditorProps, ref) => {
    const editorRef = useRef<CodeEditorForwardRef>(null);

    useImperativeHandle(ref, () => ({
        selectFile: editorRef.current?.selectFile ?? (() => { console.error("Error in CodeEditor.tsx"); })
    }));

    return (
        <ThemeProvider theme={props.theme === 'vs-dark' ? darkTheme : lightTheme}>
            <ConfirmProvider>
                <CodeEditorComponent ref={editorRef} {...props} />
            </ConfirmProvider>
        </ThemeProvider>
    )
});

const CodeEditorComponent = forwardRef<CodeEditorForwardRef, CodeEditorProps>((props: CodeEditorProps, ref) => {

    useImperativeHandle(ref, () => ({
        selectFile: OnFileSelect
    }));

    const { root, defaultLanguage, theme, headerHidden, fileTreeHidden, onChange, onSave, onRootUpdate, onClose, publishChanges } = props;

    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

    const openConfirmDialog = useConfirm();
    const [openFiles, setOpenFiles] = useState<CodeEditorFile[]>([]);
    const [selectedFile, setSelectedFile] = useState<CodeEditorFile | null>(null);
    const [language, setLanguage] = useState<EditorLanguage | null>(null)
    const [selectedTreeElement, setSelectedTreeElement] = useState<CodeEditorCommon>(root);

    const [diffEditorEnabled, setDiffEditorEnabled] = useState<boolean>(false);

    const [fileTreeWidth, setFileTreeWidth] = useState<number>(250);
    const fileTreeZoom = 0.8;


    useEffect(() => {
        if (selectedTreeElement && selectedTreeElement.type === Type.FILE) {
            OnFileSelect(selectedTreeElement as CodeEditorFile);
        }
    }, [selectedTreeElement])


    useEffect(() => {
        if (root) {
            setOpenFiles(old => {
                return old.map((openFile: CodeEditorFile) => getFiles(root, (file: CodeEditorFile) => file.id === openFile.id).at(0)!)
            });
        }
    }, [root]);

    const OnFileSelect = (selectedFile: CodeEditorFile) => {
        setOpenFiles(prev => {
            if (!prev.find(p => p.id === selectedFile.id))
                prev.push(selectedFile);
            return prev;
        });
        setSelectedFile(selectedFile);
    }

    const OnFileClose = async (closedFile: CodeEditorFile) => {
        if (closedFile.originalContent !== closedFile.modifiedContent) {
            await openConfirmDialog({
                title: `Do you want to close ${closedFile.name}?`,
                description: "Your changes will be lost if you don't save them.",
                confirmationText: "Yes",
                confirmationButtonProps: { variant: "outlined" },
                cancellationText: "No, keep the changes",
                cancellationButtonProps: { variant: "contained" },
                buttonOrder: ["confirm", "cancel"]
            });
            closedFile.modifiedContent = closedFile.originalContent;
        }
        if (closedFile.id === selectedFile?.id) {
            const index = openFiles.findIndex(p => p.id !== closedFile.id);
            if (index !== -1)
                setSelectedFile(openFiles.at(index) ?? null);
            else
                setSelectedFile(null);
        }
        setOpenFiles(prev => prev.filter(p => p.id !== closedFile.id));

    }

    useEffect(() => {
        editorRef.current?.focus();
        setLanguage(selectedFile?.language ?? null);
    }, [selectedFile]);


    const _publishChanges = () => {
        publishChanges?.();
    }

    const formatDocument = () => {
        editorRef.current?.getAction("editor.action.formatDocument")?.run();
    }

    const createElement = (type: Type) => {
        if (!selectedTreeElement) return;
        let parentDir: CodeEditorDirectory;

        if (selectedTreeElement.type === Type.DIRECTORY) {
            parentDir = selectedTreeElement as CodeEditorDirectory;
        }
        else {
            if (!selectedTreeElement.parentDir) return;
            parentDir = selectedTreeElement.parentDir;
        }

        const rootCopy = { ...root };
        const parentDirCopy = getDirectories(rootCopy, (dir: CodeEditorDirectory) => dir.id === parentDir.id).at(0)!;

        const elemName = 'testcopy.js';
        const extension = elemName.split('.');

        const commonElem: CodeEditorCommon = {
            id: parentDirCopy.path + '/' + elemName + ':' + (parentDirCopy.depth + 1),
            name: elemName,
            path: parentDirCopy.path + '/' + elemName,
            parentId: parentDirCopy.id,
            parentDir: parentDirCopy,
            type: type,
            depth: parentDirCopy.depth + 1,
        }

        if (type === Type.DIRECTORY) {
            const newDir: CodeEditorDirectory = {
                ...commonElem,
                dirs: [],
                files: [],
            }
            parentDirCopy.dirs.push(newDir);
            handleOnRootUpdated(newDir, rootCopy);
        }
        else {
            const newFile: CodeEditorFile = {
                ...commonElem,
                originalContent: '',
                modifiedContent: '',
                url: 'no-url',
                crmId: 'nor-id',
                language: getLanguageByExtension(extension[extension.length - 1]),
            }
            parentDirCopy.files.push(newFile);
            handleOnRootUpdated(newFile, rootCopy);
        }
    }
    const createFile = () => {
        createElement(Type.FILE);
    }
    const createDirectory = () => {
        createElement(Type.DIRECTORY);
    }

    const handleOnRootUpdated = (newElement: CodeEditorDirectory | CodeEditorFile, rootCopy: CodeEditorDirectory) => {
        onRootUpdate?.(newElement, rootCopy);
    }

    const handleOnLanguageChange = (newLanguage: EditorLanguage | 'text') => {
        if (selectedFile) {
            const rootCopy = { ...root };
            const files = getFiles(rootCopy, (f: CodeEditorFile) => f.id === selectedFile.id);
            if (files.length > 0) {
                files[0].language = newLanguage === 'text' ? null : newLanguage;
            }

            onChange?.(files[0], rootCopy);
        }
    }

    const handleOnContentChange = (newContent: string | undefined) => {
        if (selectedFile) {
            const rootCopy = { ...root };
            const files = getFiles(rootCopy, (f: CodeEditorFile) => f.id === selectedFile.id);
            if (files.length > 0) {
                files[0].modifiedContent = newContent ?? '';
            }

            onChange?.(files[0], rootCopy);
        }
    }

    const handleOnSave = () => {
        if (selectedFile) {
            const rootCopy = { ...root };
            const files = getFiles(rootCopy, (f: CodeEditorFile) => f.id === selectedFile.id);
            if (files.length > 0) {
                files[0].originalContent = files[0].modifiedContent;
            }

            onSave?.(files[0], rootCopy);
        }
    }

    return (
        <>
            {!headerHidden &&
                <CodeEditorHeader
                    files={openFiles}
                    selectedFile={selectedFile}
                    onSelect={OnFileSelect}
                    onFileClose={OnFileClose}
                    onClose={onClose}
                    theme={theme}
                    fileTreeWidth={fileTreeWidth}
                    fileTreeZoom={fileTreeZoom}
                >
                    <ChangeLanguage currentLanguage={selectedFile?.language} overrideLanguage={handleOnLanguageChange} />
                    <DiffEditorAction onClick={() => setDiffEditorEnabled((prev) => !prev)} />
                    <ContextualMenuAction actions={{
                        Save: handleOnSave,
                        Format: formatDocument,
                        Publish: _publishChanges,
                        AddFile: createFile,
                        AddFolder: createDirectory,
                    }} />
                </CodeEditorHeader>
            }
            <Stack
                direction='row'
                width='100%'
                height={!headerHidden ? 'calc(100% - 45px)' : '100%'}
                overflow='hidden'
                sx={{
                    backgroundColor: theme === 'vs-dark' ? 'rgb(37, 37, 37)' : '#F3F3F3'
                }}
            >

                {!fileTreeHidden &&
                    <FileTree
                        directory={root}
                        selectedFile={selectedFile}
                        onSelect={setSelectedTreeElement}
                        theme={theme}
                        fileTreeWidth={fileTreeWidth}
                        fileTreeZoom={fileTreeZoom}
                    />}
                <Stack
                    width='100%'
                    height='100%'
                >
                    <CodeEditorWindow
                        ref={editorRef}
                        theme={theme}
                        file={selectedFile ?? undefined}
                        diffEditor={diffEditorEnabled}
                        onContentChange={handleOnContentChange}
                        onContentSave={handleOnSave}
                        publishChanges={_publishChanges}
                    />
                </Stack>
            </Stack>
        </>
    )
});

export default CodeEditor;