import createTheme from '@mui/material/styles/createTheme';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import Typography from '@mui/material/Typography';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../../utils/global/.processClass';
import CopyMenu from '../../utils/components/CopyMenu';
import { useCurrentFormContext } from '../../utils/hooks/use/useCurrentFormContext';
import DirtyLensIcon from '@mui/icons-material/DirtyLens';
import DOMObserver from '../../utils/global/DOMObserver';
import { RetrieveAllAttributes } from '../../utils/hooks/XrmApi/RetrieveAllAttributes';
import { useCurrentRecord } from '../../utils/hooks/use/useCurrentRecord';
import { isArraysEquals, setStyle } from '../../utils/global/common';
import { useBoolean } from 'usehooks-ts';
import { FormContext } from '../../utils/types/FormContext';


class DirtyFieldsButton extends ProcessButton {
    constructor() {
        super(
            'dirtyfields',
            'Dirty Attributes',
            <DirtyLensIcon />,
            350
        );
        this.process = DirtyFieldsButtonProcess;
    }
}

declare module '@mui/material/Divider' {
    interface DividerPropsVariantOverrides {
        bold: true;
    }
}

let theme = createTheme({});

var domObserver: DOMObserver | null = null;

const DirtyFieldsButtonProcess = forwardRef<ProcessRef, ProcessProps>(
    function DirtyFieldsButtonProcess(props: ProcessProps, ref) {

        const [domUpdated, setDomUpdated] = useState<boolean>(false);
        useImperativeHandle(ref, () => {
            return ({
                onClose() {
                    domObserver?.removeListener(xrmObserverCallback);
                    setStyle('styleModifier-dirtyfields', {});
                }
            });
        }, []);
        const xrmObserverCallback = useCallback(() => {
            setDomUpdated(prev => !prev);
        }, []);
        useEffect(() => {
            if (!domObserver) {
                domObserver = new DOMObserver('dirtyfield-domupdated', document.querySelector('#shell-container'), { childList: true, subtree: true });
            }
            domObserver.addListener(xrmObserverCallback);
        }, []);


        const currentFormContext = useCurrentFormContext();
        const { entityName, isEntityRecord, recordId, forceRefresh } = useCurrentRecord();

        const [attributes, isFetching] = RetrieveAllAttributes(entityName ?? '', recordId);
        const [dirtyAttributes, setDirtyAttributes] = useState<Xrm.Attributes.Attribute[]>([]);

        const { value: squareFormEnabled, toggle: toggleSquareFormEnabled } = useBoolean(false);


        useEffect(() => {
            const currentDirty = currentFormContext?.getAttribute(a => a.getIsDirty());
            if (currentDirty && dirtyAttributes) {
                const isUnchanged = isArraysEquals(currentDirty.map(a => a.getName()), dirtyAttributes.map(a => a.getName()))
                if (!isUnchanged) {
                    setDirtyAttributes(currentDirty);
                }
            }

        }, [currentFormContext, domUpdated]);

        useEffect(() => {
            if (squareFormEnabled) {
                const selector = dirtyAttributes?.flatMap(attribute => attribute.controls.get().map(control => `[data-control-name='${control.getName()}']>div`)).join(',');
                if (selector !== undefined) {
                    setStyle('styleModifier-dirtyfields', {
                        [selector]: ['outline: 2px dashed #ff2500', "outline-offset: -2px"]
                    });
                }
            }
            else {
                setStyle('styleModifier-dirtyfields', {});
            }
        }, [dirtyAttributes, squareFormEnabled]);

        useEffect(() => {
            props.setBadge(dirtyAttributes.length || null);
        }, [dirtyAttributes, props.setBadge]);


        return (
            <ThemeProvider theme={theme}>
                <Stack spacing={4} height='calc(100% - 10px)' padding='10px' alignItems='center'>
                    <List
                        sx={{ width: '100%', bgcolor: 'background.paper', overflowY: 'auto' }}
                        component="nav"
                        subheader={
                            <ListSubheader component="div" sx={{ lineHeight: 'unset' }}>
                                <Divider />
                                <FormControl component="fieldset" variant="standard">
                                    <FormControlLabel
                                        control={
                                            <Switch checked={squareFormEnabled} onClick={toggleSquareFormEnabled} />
                                        }
                                        label="Display in form"
                                    />
                                </FormControl>
                                <Divider />
                            </ListSubheader>
                        }
                    >
                        {
                            dirtyAttributes.map((attribute, index) => {
                                const attributeName = attribute.getName();
                                const attributeValue = getAttributeValueString(attribute);
                                const oldAttributeSelector = attribute.getAttributeType() === 'lookup' ? `_${attributeName}_value` : attributeName;
                                return (
                                    <DirtyAttributeItem
                                        key={attributeName + 'dirty'}
                                        currentFormContext={currentFormContext}
                                        name={attributeName}
                                        oldValue={attributes[oldAttributeSelector]}
                                        value={attributeValue}
                                    />
                                );
                            })
                        }
                    </List>

                </Stack>
            </ThemeProvider>
        );
    }
);

function getAttributeValueString(attribute: Xrm.Attributes.Attribute<any>): string | undefined {
    switch (attribute.getAttributeType()) {
        case 'boolean':
        case 'decimal':
        case 'double':
        case 'integer':
        case 'memo':
        case 'money':
        case 'optionset':
        case 'string':
            return '' + attribute.getValue();

        case 'lookup':
            return attribute.getValue() ? attribute.getValue()[0].id.replace('{', '').replace('}', '') : 'null';

        case 'datetime':
            return attribute.getValue() ? attribute.getValue().toISOString() : '' + attribute.getValue();
    }
}

interface DirtyAttributeItemProps {
    name: string
    value: any
    oldValue: any
    currentFormContext: FormContext
}
const DirtyAttributeItem = React.memo((props: DirtyAttributeItemProps) => {
    const { name, oldValue, value, currentFormContext } = props;

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClick = useCallback(() => {
        currentFormContext?.getAttribute<Xrm.Attributes.Attribute>(name).controls.get(0)?.setFocus?.()
    }, [currentFormContext, name]);

    const handleOpenContextualMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        setAnchorEl(e.currentTarget);
        e.preventDefault();
    }, [setAnchorEl]);

    const handleCloseContextualMenu = useCallback(() => {
        setAnchorEl(null);
    }, [setAnchorEl]);


    const copyContent = useMemo(() => {
        return [
            { title: 'logicalname', content: name },
            { title: 'new value', content: value },
            { title: 'old value', content: oldValue },
        ]
    }, [name, oldValue, value]);

    return (
        <ListItem key={'dirtyField' + name}  sx={{ p: 0 }}>
            <ListItemButton onClick={handleClick} onContextMenu={handleOpenContextualMenu}>
                <ListItemText
                    primary={name}
                    secondary={
                        <>
                            <ValueDisplay title='New Value' value={value} />
                            <ValueDisplay title='Previous Value' value={oldValue} />
                        </>
                    }
                />

            </ListItemButton>
            <CopyMenu anchorElement={anchorEl} onClose={handleCloseContextualMenu} items={copyContent} />
            <Divider />
        </ListItem>
    );
});

interface ValueDisplayProps {
    title: string
    value: any
}
function ValueDisplay(props: ValueDisplayProps) {
    return (
        <Typography
            component="p"
            variant="caption"
            color="text.secondary"
        >
            {props.title}:
            <Typography
                sx={{ display: "inline", ml: 1 }}
                component="p"
                variant="body2"
                color="text.primary"
            >
                {props.value}
            </Typography>
        </Typography>
    )
}

const dirtyFields = new DirtyFieldsButton();
export default dirtyFields;