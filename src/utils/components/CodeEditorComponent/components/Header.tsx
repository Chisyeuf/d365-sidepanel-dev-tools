import { Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, MenuList, Stack, SvgIconTypeMap, Tooltip, Typography, Button, AppBar, Toolbar, Box, FormControl, Select, SelectChangeEvent } from '@mui/material';
import { ChildrenProp, CodeEditorHeaderProps, CodeEditorTabProps, EditorActionProps, editorLanguageArray } from "../utils/types";
import CloseIcon from '@mui/icons-material/Close';
import { useHover } from "usehooks-ts";
import { useEffect, useRef, useState } from "react";
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import MenuIcon from '@mui/icons-material/Menu';
import CompareIcon from '@mui/icons-material/Compare';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import SaveIcon from '@mui/icons-material/Save';
import PublishIcon from '@mui/icons-material/Publish';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { Key } from 'ts-key-enum';
import { useHotkeys } from 'react-hotkeys-hook';
import React from 'react';
import { EditorLanguage } from 'monaco-editor/esm/metadata';
import { capitalizeFirstLetter } from '../../../global/common';
import { getIcon } from '../utils/icon';
import { getExtensionByLanguage } from '../utils/fileManagement';


function CodeEditorHeader(props: CodeEditorHeaderProps & ChildrenProp) {
    const { files, selectedFile, onSelect: onSelectedFileChanged, onFileClose, onClose, theme, fileTreeWidth, fileTreeZoom } = props;

    return (
        <AppBar sx={{ position: 'static' }}>
            <Toolbar style={{
                height: '45px',
                minHeight: 'unset'
            }}>
                <Box sx={{
                    width: fileTreeWidth ? `calc(${fileTreeWidth * (fileTreeZoom ?? 1) + 'px'} - 25px)` : 'auto',
                    flexShrink: 0
                }}>
                    {onClose &&
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={onClose}
                            aria-label="close"
                        >
                            <CloseIcon />
                        </IconButton>
                    }
                </Box>
                <TabsList
                    files={files}
                    selectedFile={selectedFile}
                    onSelect={onSelectedFileChanged}
                    onFileClose={onFileClose}
                    theme={theme}
                />
                {props.children &&
                    <Stack
                        direction='row'
                    >
                        {props.children}
                    </Stack>
                }
            </Toolbar>
        </AppBar>
        // <Stack
        //     direction='row'
        //     sx={{
        //         backgroundColor: theme === 'vs-dark' ? 'rgb(37, 37, 38)' : '#F3F3F3'
        //     }}
        // >
        //     <TabsList
        //         files={files}
        //         selectedFile={selectedFile}
        //         onSelect={onSelectedFileChanged}
        //         onFileClose={onFileClose}
        //         theme={theme}
        //     />
        //     {props.children &&
        //         <Stack
        //             direction='row'
        //         >
        //             {props.children}
        //         </Stack>
        //     }
        // </Stack>
    );
}

function TabsList(props: CodeEditorHeaderProps) {
    const { files, selectedFile, onSelect, onFileClose, theme } = props;

    return (
        <Stack
            direction='row'
            overflow='hidden'
            width='-webkit-fill-available'
            flexShrink={1}
            spacing='1px'
            onWheel={(e) => { e.currentTarget.scrollLeft += e.deltaY / 2 }}
        >
            {
                files?.map((file, index) => {
                    return (
                        <Tab
                            key={file.id + index}
                            file={file}
                            index={index}
                            selected={file.id === selectedFile?.id}
                            unsaved={file.originalContent !== file.modifiedContent}
                            onSelect={onSelect ?? (() => { })}
                            onClose={onFileClose ?? (() => { })}
                            theme={theme}
                        />
                    );
                })
            }
        </Stack>
    );
}

const darkTabs = {
    backgroundSelected: 'rgb(30, 30, 30)',
    backgroundNotSelected: 'rgb(45, 45, 45)',
    colorSelected: 'rgb(255, 255, 255)',
    colorNotSelected: 'rgba(255, 255, 255, 0.5)',
    colorInvisible: 'rgba(255, 255, 255, 0)',
    border: '1px solid rgb(37, 37, 38)'
}
const lightTabs = {
    backgroundSelected: 'rgb(255, 255, 255)',
    backgroundNotSelected: 'rgb(236, 236, 236)',
    colorSelected: 'rgb(0, 0, 0)',
    colorNotSelected: 'rgba(0, 0, 0, 0.5)',
    colorInvisible: 'rgba(0, 0, 0, 0)',
    border: '1px solid rgb(243, 243, 243)'
}
function Tab(props: CodeEditorTabProps) {
    const { file, selected, unsaved, onSelect, onClose, theme } = props;

    const tabRef = useRef<HTMLDivElement>(null);
    const isHover = useHover(tabRef);

    const tabsColor = theme === 'vs-dark' ? darkTabs : lightTabs;

    // useEffect(() => {
    //     if (tabRef.current) {
    //         tabRef.current.onmousedown = (event) => {
    //             if (event.button === 1) {
    //                 handleClose(event);
    //             }
    //         }
    //     }
    // }, [tabRef])



    const handleSelect = () => {
        onSelect(file);
    }

    const handleClose = (event: MouseEvent | React.MouseEvent<Element, MouseEvent>) => {
        onClose(file);
        event.stopPropagation();
    }

    return (
        <Stack
            ref={tabRef}
            direction='row'
            alignItems='center'
            paddingLeft='15px'
            paddingRight='5px'
            height='35px'
            spacing={0.5}
            onClick={handleSelect}
            sx={{
                backgroundColor: selected ? tabsColor.backgroundSelected : tabsColor.backgroundNotSelected,
                color: selected ? tabsColor.colorSelected : tabsColor.colorNotSelected,
                borderRight: tabsColor.border,
                cursor: 'pointer',
                userSelect: 'none',
            }}
        >
            <Typography variant='body2'>{file.name}</Typography>
            <Button
                onClick={(e: React.MouseEvent<Element, MouseEvent>) => handleClose(e)}
                size='small'
                sx={{
                    width: '25px',
                    height: '25px',
                    minWidth: 'unset',
                    color: selected ? tabsColor.colorSelected : isHover ? tabsColor.colorNotSelected : tabsColor.colorInvisible,
                    '&:hover': {
                        backgroundColor: 'rgb(255 255 255 / 20%)'
                    }
                }}
            >
                {
                    unsaved && !isHover ?
                        <FiberManualRecordIcon fontSize='small' sx={{ color: selected ? tabsColor.colorSelected : tabsColor.colorNotSelected, zoom: 0.7 }} />
                        :
                        <CloseIcon fontSize='small' />
                }
            </Button>
        </Stack>
    );
}

export function ChangeLanguage(props: EditorActionProps & { currentLanguage?: EditorLanguage | null, overrideLanguage: ((newLanguage: EditorLanguage | 'text') => void) }) {
    const { onClick, currentLanguage, overrideLanguage } = props;

    const handleOnChange = (event: SelectChangeEvent<EditorLanguage | 'text'>, child: React.ReactNode) => {
        overrideLanguage(event.target.value as EditorLanguage | 'text');
    }

    return (
        <FormControl sx={{ m: 1, width: '180px' }} size="small">
            <Select
                defaultValue='text'
                value={currentLanguage ?? 'text'}
                onChange={handleOnChange}
                onClick={onClick}
            >
                <MenuItem value={'text'}>Text</MenuItem>
                {
                    editorLanguageArray.map(l => {
                        const extension = getExtensionByLanguage(l);
                        let icon = null;
                        if (extension) icon = getIcon(extension, '');
                        return <MenuItem value={l}>{icon} {capitalizeFirstLetter(l)}</MenuItem>;
                    })
                }
            </Select>
        </FormControl>
    );
}

export function DiffEditorAction(props: EditorActionProps) {
    const { onClick } = props;

    return (
        <Tooltip title='Switch to diff screen'>
            <IconButton onClick={onClick}>
                <CompareIcon fontSize='small' />
            </IconButton>
        </Tooltip>
    )
}

export function ContextualMenuAction(props: EditorActionProps & { actions: { [key: string]: () => void } }) {
    const { onClick, actions } = props;

    useHotkeys(`${Key.Control}+s`, (e: any) => {
        actions.Save?.();
    }, {
        preventDefault: true,
        enabled: true
    });

    useHotkeys(`${Key.Alt}+${Key.Shift}+f`, (e: any) => {
        actions.Format?.()
    }, {
        preventDefault: true,
        enabled: true
    });

    useHotkeys(`${Key.Control}+${Key.Shift}+p`, (e: any) => {
        actions.Publish?.()
    }, {
        preventDefault: true,
        enabled: true
    });

    const MenuItemCustom = (props: { Icon: OverridableComponent<SvgIconTypeMap<{}, "svg">>, text: string, shortCut?: string, onClick?: () => void }) => {
        const { Icon, text, shortCut, onClick } = props;
        return (
            <MenuItem onClick={onClick}>
                <ListItemIcon>
                    <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText>{text}</ListItemText>
                {shortCut &&
                    <Typography variant="body2" color="text.secondary" paddingLeft={'10px'}>
                        {shortCut}
                    </Typography>
                }
            </MenuItem>
        )
    }

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (<>
        <Tooltip title='Contextual Menu'>
            <IconButton onClick={handleClick}>
                <MenuIcon fontSize='small' />
            </IconButton>
        </Tooltip>
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
                'aria-labelledby': 'basic-button',
            }}
        >
            <MenuList dense>
                {/* <MenuItemCustom
                    Icon={NoteAddIcon}
                    text='Add File'
                    shortCut='Ctrl + N'
                    onClick={actions.AddFile} />
                <MenuItemCustom
                    Icon={CreateNewFolderIcon}
                    text='Add Folder'
                    shortCut='Ctrl + Shift + M'
                    onClick={actions.AddFolder} /> */}
                <MenuItemCustom
                    Icon={SaveIcon}
                    text='Save'
                    shortCut='Ctrl + S'
                    onClick={actions.Save} />

                <Divider />

                <MenuItemCustom
                    Icon={FormatAlignLeftIcon}
                    text='Format Document'
                    shortCut='Alt + Shift + F'
                    onClick={actions.Format} />

                <Divider />

                <MenuItemCustom
                    Icon={PublishIcon}
                    text='Publish Changes'
                    shortCut='Ctrl + Shift + P' />
            </MenuList>
        </Menu>
    </>
    )
}


export default CodeEditorHeader;