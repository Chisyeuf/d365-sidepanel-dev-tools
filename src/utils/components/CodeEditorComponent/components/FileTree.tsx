import { CodeEditorCommon, CodeEditorDirectory, CodeEditorFile, FileTreeProps, MonacoTheme } from "../utils/types";
import { Box, Stack, styled, SvgIcon, SvgIconProps } from "@mui/material";

import { useMemo, useState } from "react";
import React from "react";
import { getIcon } from "../utils/icon";


function MinusSquare(props: SvgIconProps) {
    return (
        <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
            {/* tslint:disable-next-line: max-line-length */}
            <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 11.023h-11.826q-.375 0-.669.281t-.294.682v0q0 .401.294 .682t.669.281h11.826q.375 0 .669-.281t.294-.682v0q0-.401-.294-.682t-.669-.281z" />
        </SvgIcon>
    );
}

function PlusSquare(props: SvgIconProps) {
    return (
        <SvgIcon fontSize="inherit" style={{ width: 14, height: 14 }} {...props}>
            {/* tslint:disable-next-line: max-line-length */}
            <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 12.977h-4.923v4.896q0 .401-.281.682t-.682.281v0q-.375 0-.669-.281t-.294-.682v-4.896h-4.923q-.401 0-.682-.294t-.281-.669v0q0-.401.281-.682t.682-.281h4.923v-4.896q0-.401.294-.682t.669-.281v0q.401 0 .682.281t.281.682v4.896h4.923q.401 0 .682.281t.281.682v0q0 .375-.281.669t-.682.294z" />
        </SvgIcon>
    );
}


declare module 'react' {
    interface CSSProperties {
        '--tree-view-color'?: string;
        '--tree-view-bg-color'?: string;
    }
}

function FileTree(props: FileTreeProps) {
    const { directory, selectedFile, onSelect, theme, fileTreeWidth, fileTreeZoom } = props;

    return (
        // <Stack
        //     direction='row'
        //     spacing={0}
        // >
        <Stack
            sx={{
                fontFamily: "monaco,Consolas,Lucida Console,monospace",
                color: theme === 'vs-dark' ? 'white' : 'black',
                fontSize: '14px',
                zoom: fileTreeZoom ?? '1',
                margin: '0',
                userSelect: 'none',
                backgroundColor: theme === 'vs-dark' ? 'rgb(37, 37, 37)' : '#F3F3F3',
                // overflowX: 'hidden'
                width: fileTreeWidth ? fileTreeWidth + 'px' : 'auto',
                flexShrink: 0
            }}>
            <SubTree
                directory={directory}
                selectedFile={selectedFile}
                onSelect={onSelect ?? (() => { })}
                theme={theme}
            />
        </Stack>
        //     <Box 
        //         width='2px'
        //         height='100%'
        //         flexShrink='0'
        //         sx={{
        //             backgroundColor:'yellow',
        //             cursor:'e-resize'
        //         }}
        //         onMouseDown={(e) => {console.log(e)}}
        //         onMouseUp={(e) => {console.log(e)}}
        //         onMouseMove={(e) => {console.log(e)}}
        //     />
        // </Stack>
    )
}

interface SubTreeProps {
    directory: CodeEditorDirectory;
    selectedFile: CodeEditorFile | null;
    onSelect: (file: CodeEditorCommon) => void;
    theme: MonacoTheme | undefined;
}

const SubTree = (props: SubTreeProps) => {
    return (
        <div>
            {
                props.directory.dirs
                    .sort(sortDir)
                    .map(dir => (
                        <React.Fragment key={dir.id}>
                            <DirDiv
                                directory={dir}
                                selectedFile={props.selectedFile}
                                onSelect={props.onSelect}
                                theme={props.theme}
                            />
                        </React.Fragment>
                    ))
            }
            {
                props.directory.files
                    .sort(sortFile)
                    .map(file => (
                        <React.Fragment key={file.id}>
                            <FileDiv
                                file={file}
                                selectedFile={props.selectedFile}
                                onClick={() => props.onSelect(file)}
                                theme={props.theme}
                            />
                        </React.Fragment>
                    ))
            }
        </div>
    )
}

const FileDiv = ({ file, icon, selectedFile, onClick, theme }: {
    file: CodeEditorFile | CodeEditorDirectory;
    icon?: string;
    selectedFile: CodeEditorFile | null;
    onClick: () => void;
    theme: MonacoTheme | undefined;
}) => {
    const isSelected = useMemo(() => selectedFile?.id === file.id, [selectedFile, file]);
    const depth = file.depth;
    return (
        <Div
            depth={depth}
            isSelected={isSelected}
            onClick={onClick}
            monacotheme={theme}
        >
            <FileIcon
                name={icon}
                extension={icon || file.name.split('.').pop() || ""} />
            <span style={{ marginLeft: 1, flexShrink: '0' }} title={file.name}>
                {file.name}
            </span>
        </Div>
    )
}

const Div = styled('div') <{
    depth: number;
    isSelected: boolean;
    monacotheme: MonacoTheme | undefined;
}>`
  display: flex;
  align-items: center;
  padding-left: ${props => props.depth * 16}px;
  padding-right: 16px;
  background-color: ${props => props.isSelected ? (props.monacotheme === 'vs-dark' ? "#373737" : "#E4E6F1") : "transparent"};

  :hover {
    cursor: pointer;
    background-color: ${props => props.isSelected ? (props.monacotheme === 'vs-dark' ? "#373737" : "#E4E6F1") : (props.monacotheme === 'vs-dark' ? "#2D2D2D" : "#E8E8E8")};
  }
`

const DirDiv = ({ directory, selectedFile, onSelect, theme }: {
    directory: CodeEditorDirectory;
    selectedFile: CodeEditorFile | null;
    onSelect: (file: CodeEditorCommon) => void;
    theme: MonacoTheme | undefined;
}) => {
    let defaultOpen = false;
    if (selectedFile)
        defaultOpen = isChildSelected(directory, selectedFile)
    const [open, setOpen] = useState(defaultOpen);
    return (
        <>
            <FileDiv
                file={directory}
                icon={open ? "openDirectory" : "closedDirectory"}
                selectedFile={selectedFile}
                onClick={() => { setOpen(!open); onSelect(directory) }}
                theme={theme}
            />
            {
                open ? (
                    <SubTree
                        directory={directory}
                        selectedFile={selectedFile}
                        onSelect={onSelect}
                        theme={theme}
                    />
                ) : null
            }
        </>
    )
}


const isChildSelected = (directory: CodeEditorDirectory, selectedFile: CodeEditorFile) => {
    let res: boolean = false;

    function isChild(dir: CodeEditorDirectory, file: CodeEditorFile) {
        if (selectedFile.parentId === dir.id) {
            res = true;
            return;
        }
        if (selectedFile.parentId === '0') {
            res = false;
            return;
        }
        dir.dirs.forEach((item) => {
            isChild(item, file);
        })
    }

    isChild(directory, selectedFile);
    return res;
}

const FileIcon = ({ extension, name }: { name?: string, extension?: string }) => {
    let icon = getIcon(extension || "", name || "");
    return (
        <Span>
            {icon}
        </Span>
    )
}

const Span = styled('span')(() => ({
    display: 'flex',
    flexShrink: '0',
    width: '32px',
    height: '32px',
    justifyContent: 'center',
    alignItems: 'center',
}));

export function sortDir(l: CodeEditorDirectory, r: CodeEditorDirectory) {
    return l.name.localeCompare(r.name);
}

export function sortFile(l: CodeEditorFile, r: CodeEditorFile) {
    return l.name.localeCompare(r.name);
}

export default FileTree;