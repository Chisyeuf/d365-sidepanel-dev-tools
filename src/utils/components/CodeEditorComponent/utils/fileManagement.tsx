import { EditorLanguage } from "monaco-editor/esm/metadata";
import { CodeEditorDirectory, CodeEditorFile, Type } from "./types";
import { ScriptNodeContent } from "../../../types/ScriptNodeContent";

export function buildFileTree(filespath: ScriptNodeContent[]): CodeEditorDirectory {

    const SEPARATOR_EXPRESSION = /[\\/¥₩]+/i;

    function searchAndCreateDirectory(root: CodeEditorDirectory, splitPath: string[], fileToCreate: ScriptNodeContent): void {

        if (splitPath.length === 1) {
            const fileName = splitPath[0];
            const extension = fileName.split('.');

            const newFile: CodeEditorFile = {
                id: root.path + '/' + fileName + ':' + (root.depth + 1),
                name: fileName,
                path: root.path + '/' + fileName,
                parentId: root.id,
                parentDir: root,
                type: Type.FILE,
                depth: root.depth + 1,
                previousContent: fileToCreate.content,
                modifiedContent: fileToCreate.content,
                src: fileToCreate.srcRegex,
                crmId: fileToCreate.crmId,
                language: getLanguageByExtension(extension[extension.length - 1]),
            }
            root.files.push(newFile);
            return;
        }

        const nextFolder = splitPath[0];
        if (!root.dirs.find(d => d.name === nextFolder)) {
            const newDir: CodeEditorDirectory = {
                id: root.path + '/' + nextFolder + ':' + (root.depth + 1),
                name: nextFolder,
                path: root.path + '/' + nextFolder,
                parentId: root.id,
                parentDir: root,
                type: Type.DIRECTORY,
                depth: root.depth + 1,
                dirs: [],
                files: [],
            };
            root.dirs.push(newDir);
            searchAndCreateDirectory(newDir, splitPath.slice(1), fileToCreate);
        }
    }

    let rootDir: CodeEditorDirectory = {
        id: "0",
        name: "root",
        path: '.',
        parentId: undefined,
        parentDir: undefined,
        type: Type.DIRECTORY,
        depth: 0,
        dirs: [],
        files: [],
    };


    filespath.forEach((filePath, filePathIndex) => {
        const path = filePath.srcRegex.split("/webresources/")[1];
        searchAndCreateDirectory(rootDir, path.split(SEPARATOR_EXPRESSION), filePath);
    });

    return rootDir;
}

export function getAllFiles(directory: CodeEditorDirectory): CodeEditorFile[] {
    return [...directory.files, ...directory.dirs.flatMap(d => getAllFiles(d))]
}
export function getFiles(directory: CodeEditorDirectory, predicate: (file: CodeEditorFile) => boolean): CodeEditorFile[] {
    return [...directory.files.filter(predicate), ...directory.dirs.flatMap(d => getFiles(d, predicate))]
}
export function getDirectories(directory: CodeEditorDirectory, predicate: (dir: CodeEditorDirectory) => boolean): CodeEditorDirectory[] {
    if (predicate(directory)) {
        return [directory, ...directory.dirs.flatMap(d => getDirectories(d, predicate))];
    }
    return [...directory.dirs.flatMap(d => getDirectories(d, predicate))]
}

export function getLanguageByExtension(extension: string): EditorLanguage | null {
    const cache = new Map<string, EditorLanguage | null>();
    cache.set("js", "javascript");
    cache.set("jsx", "javascript");
    cache.set("ts", "typescript");
    cache.set("tsx", "typescript");
    cache.set("css", "css");
    cache.set("json", "json");
    cache.set("html", "html");
    if (cache.has(extension))
        return cache.get(extension) ?? null;
    else
        return null;
}

export function getExtensionByLanguage(language: EditorLanguage): string | null {
    const cache = new Map<EditorLanguage, string>();
    cache.set("javascript", "js");
    cache.set("javascript", "jsx");
    cache.set("typescript", "ts");
    cache.set("typescript", "tsx");
    cache.set("css", "css");
    cache.set("json", "json");
    cache.set("html", "html");
    if (cache.has(language))
        return cache.get(language) ?? null;
    else
        return null;
}