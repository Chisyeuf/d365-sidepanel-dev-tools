import { Theme } from '@mui/material';
import { EditorLanguage } from 'monaco-editor/esm/metadata';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { ReactElement, ReactNode } from 'react';

export type MonacoTheme =
    | 'vs-dark'
    | 'light';

export type CodeEditorCommon = {
    readonly id: string,
    readonly name: string,
    readonly path: string,
    readonly type: Type,
    readonly parentId: string | undefined,
    readonly parentDir: CodeEditorDirectory | undefined,
    readonly depth: number,
}

export enum Type {
    FILE,
    DIRECTORY,
    DUMMY
}

export interface CodeEditorFile extends CodeEditorCommon {
    readonly url: string,
    readonly language: EditorLanguage | null,
    originalContent: string,
    modifiedContent: string,
}

export interface CodeEditorDirectory extends CodeEditorCommon {
    files: CodeEditorFile[];
    dirs: CodeEditorDirectory[];
    // getFiles(predicate: (file: CodeEditorFile) => boolean) : CodeEditorFile[];
    // getFile(predicate: (file: CodeEditorFile) => boolean) : CodeEditorFile[];
}

export type CodeEditorWindowProps = {
    file?: CodeEditorFile,
    onContentChange?: (newContent: string | undefined) => void,
    onContentSave?: () => void
    publishChanges?: () => void
    theme?: MonacoTheme,
    diffEditor?: boolean,
}

export type CodeEditorHeaderProps = {
    files: CodeEditorFile[],
    selectedFile?: CodeEditorFile | null,
    onSelect?: (selectedFile: CodeEditorFile) => void,
    onFileClose?: (closedFile: CodeEditorFile) => void,
    onClose?: () => void,
    theme?: MonacoTheme,
    fileTreeWidth?: number,
    fileTreeZoom?: number,
}

export type CodeEditorProps = {
    root: CodeEditorDirectory,
    theme?: MonacoTheme,
    defaultLanguage?: EditorLanguage,
    headerHidden?: boolean,
    fileTreeHidden?: boolean,
    onChange?: (filesUnsaved: CodeEditorFile, root: CodeEditorDirectory,) => void,
    onSave?: (filesSaved: CodeEditorFile, root: CodeEditorDirectory,) => void,
    onRootUpdate?: (newElement: CodeEditorDirectory | CodeEditorFile, rootCopy: CodeEditorDirectory) => void,
    onClose?: () => void,
}

export type CodeEditorTabProps = {
    file: CodeEditorFile,
    index: number,
    selected: boolean,
    unsaved: boolean,
    onSelect: (selectedFile: CodeEditorFile) => void,
    onClose: (closedFile: CodeEditorFile) => void,
    theme: MonacoTheme | undefined
}
export type EditorActionProps = {
    onClick?: () => void,
}

export type ChildrenProp = {
    children?: ReactNode | ReactElement | JSX.Element
}

export type FileTreeProps = {
    directory: CodeEditorDirectory
    selectedFile: CodeEditorFile | null
    onSelect?: (file: CodeEditorCommon) => void
    theme?: MonacoTheme | undefined,
    fileTreeWidth?: number,
    fileTreeZoom?: number,
}

export interface ScriptNodeContent {
    src: string,
    content: string,
    balise: HTMLScriptElement | {},
}