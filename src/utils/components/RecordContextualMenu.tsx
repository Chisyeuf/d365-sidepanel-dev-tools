import { useCallback } from 'react'
import { Divider, Menu, MenuItem } from "@mui/material";
import React from 'react';
import { useCopyToClipboard } from 'usehooks-ts';

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
                {recordId && <CopyGuid entityName={entityName} recordId={recordId} onClose={onClose} />}
                {entityName && <CopyEntityname entityName={entityName} recordId={recordId} onClose={onClose} />}

                {(recordId || entityName) && <Divider />}

                <OpenNewTab entityName={entityName} recordId={recordId} onClose={onClose} />
                <OpenThisTab entityName={entityName} recordId={recordId} onClose={onClose} />
                <OpenDialog entityName={entityName} recordId={recordId} onClose={onClose} />
            </Menu>
        </>
    );
}

function OpenNewTab(props: RecordContextualMenuItemProps) {
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
function OpenThisTab(props: RecordContextualMenuItemProps) {
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
function OpenDialog(props: RecordContextualMenuItemProps) {
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
function CopyGuid(props: RecordContextualMenuItemProps) {
    const { onClose, recordId } = props;
    const [, copy] = useCopyToClipboard();
    const onClick = useCallback(() => {
        recordId && copy(recordId);
    }, [copy, recordId]);
    return (
        <RecordContextualMenuItem text='Copy GUID' onClose={onClose} onClick={onClick} />
    );
}
function CopyEntityname(props: RecordContextualMenuItemProps) {
    const { onClose, entityName } = props;
    const [, copy] = useCopyToClipboard();
    const onClick = useCallback(() => {
        entityName && copy(entityName);
    }, [copy, entityName]);
    return (
        <RecordContextualMenuItem text='Copy Entityname' onClose={onClose} onClick={onClick} />
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