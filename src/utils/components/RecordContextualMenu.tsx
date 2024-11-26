import { useCallback } from 'react'
import { Menu, MenuItem } from "@mui/material";
import React from 'react';

interface RecordContextualMenuProps {
    open: boolean,
    onClose?: () => void,
    anchorElement?: Element | (() => Element) | null | undefined,
    recordId?: string,
    entityName?: string,
}
function RecordContextualMenu(props: RecordContextualMenuProps) {
    const { open, onClose, anchorElement, entityName, recordId } = props;


    return (
        <>
            <Menu
                anchorEl={anchorElement}
                open={open}
                onClose={onClose}
            >
                <MenuNewTab entityName={entityName} recordId={recordId} onClose={onClose} />
                <MenuThisTab entityName={entityName} recordId={recordId} onClose={onClose} />
                <MenuDialog entityName={entityName} recordId={recordId} onClose={onClose} />
                {/* <MenuSidePanel entityName={entityName} recordId={recordId} onClose={onClose} /> */}
            </Menu>
        </>
    );
}

function MenuNewTab(props: RecordContextualMenuItemProps) {
    const { onClose, entityName, recordId } = props;
    const onClick = useCallback(
        () => {
            const origin = window.location.origin + window.location.pathname;
            const newUrl = origin + "?pagetype=entityrecord&etn=" + entityName + "&id=" + recordId;
            window.open(newUrl);
        },
        [entityName, recordId]);
    return (
        <RecordContextualMenuItem text='Open in a New Tab' onClose={onClose} onClick={onClick} />
    );
}
function MenuThisTab(props: RecordContextualMenuItemProps) {
    const { onClose, entityName, recordId } = props;

    const onClick = useCallback(
        () => {
            Xrm.Navigation.navigateTo(
                {
                    pageType: 'entityrecord',
                    entityName: entityName ?? '',
                    entityId: recordId ?? ''
                },
                {
                    target: 1,
                }).then();
        },
        [entityName, recordId]);
    return (
        <RecordContextualMenuItem text='Open in this Tab' onClose={onClose} onClick={onClick} />
    );
}
function MenuDialog(props: RecordContextualMenuItemProps) {
    const { onClose, entityName, recordId } = props;
    const onClick = useCallback(
        () => {
            Xrm.Navigation.navigateTo(
                {
                    pageType: 'entityrecord',
                    entityName: entityName ?? '',
                    entityId: recordId ?? ''
                },
                {
                    target: 2,
                    height: { value: 80, unit: "%" },
                    width: { value: 70, unit: "%" },
                    position: 1
                }).then();
        },
        [entityName, recordId]);
    return (
        <RecordContextualMenuItem text='Open in a Dialog' onClose={onClose} onClick={onClick} />
    );
}
function MenuSidePanel(props: RecordContextualMenuItemProps) {
    const { onClose, entityName, recordId } = props;
    const onClick = useCallback(
        () => {

        },
        []);
    return (
        <RecordContextualMenuItem text='Open in a Side Panel' onClose={onClose} onClick={onClick} />
    );
}

interface RecordContextualMenuItemProps {
    onClose?: () => void,
    onClick?: () => void,
    text?: string,
    recordId?: string,
    entityName?: string,

}
function RecordContextualMenuItem(props: RecordContextualMenuItemProps) {
    const { onClick, text, onClose } = props;

    const handleOnClick = () => {
        onClick?.();
        onClose?.();
    }

    return (
        <MenuItem onClick={handleOnClick}>{text}</MenuItem>
    );
}

export default RecordContextualMenu;