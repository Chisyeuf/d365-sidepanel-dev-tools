import { Tooltip, Button, Stack, Menu, MenuItem } from '@mui/material';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SubProcessProps } from '../main';

import { RetrieveAttributesMetaData } from '../../../utils/hooks/XrmApi/RetrieveAttributesMetaData';
import { useBoolean, useHover } from 'usehooks-ts';
import { debugLog } from '../../../utils/global/common';
import { getRandomValue } from '../../../utils/global/fieldsValueManagement';


import ModeEditIcon from '@mui/icons-material/ModeEdit';
import EditOffOutlinedIcon from '@mui/icons-material/EditOffOutlined';

const excludedFields = ["statecode", "statuscode"];

function FillFields(props: SubProcessProps) {

    const { currentFormContext, domUpdated } = props;

    const anchorRef = React.useRef(null);

    const { value: open, setTrue: setOpen, setFalse: setClose, toggle: toggleOpen } = useBoolean(false);

    const [attributeMetadata, isFetching] = RetrieveAttributesMetaData(currentFormContext?.data.entity.getEntityName() ?? '');

    // ---------- Fill on click mode ----------
    const [fillOnClickEnable, setFillOnClick] = useState<boolean>(false);

    const toggleMode = () => {
        setFillOnClick(!fillOnClickEnable);
    }

    const fieldsControls = useMemo(() => {
        if (currentFormContext) {
            const controls: Xrm.Controls.Control[] = currentFormContext.getControl();

            return controls;
        }
        else {
            return null;
        }

    }, [currentFormContext]);

    const onClickField = useCallback((event: Event) => {
        if (!currentFormContext) return;

        const controlName = (event.currentTarget as HTMLElement | undefined)?.parentElement?.getAttribute('data-control-name');
        if (!controlName) return;

        const control = currentFormContext.getControl(controlName);
        const attributeName = (control as any).controlDescriptor.Id;
        const attribute = currentFormContext.getAttribute(attributeName);
        const metadata = attributeMetadata.find(meta => meta.LogicalName === attributeName);

        if (!metadata) return;

        getRandomValue(currentFormContext, attribute, metadata).then((randomValue) => {
            attribute.setValue(randomValue);
            debugLog("Field filled with :", attribute.getName(), randomValue);
        });
    }, [attributeMetadata, currentFormContext]);

    const toggle = async () => {
        fieldsControls?.map((c) => {
            const controlName = c.getName();
            const controlNodeT = document.querySelector(`[data-id="${controlName}"] > div`);
            controlNodeT?.removeEventListener('click', onClickField);
            if (fillOnClickEnable)
                controlNodeT?.addEventListener('click', onClickField);
        });
    }

    useEffect(() => {
        toggle();
    }, [currentFormContext, domUpdated, fillOnClickEnable, fieldsControls]);
    // ---------- END Fill on click mode ----------

    // ---------- Fill on menu ----------
    const attributes = useMemo(() => {
        if (currentFormContext) {
            const controls: Xrm.Attributes.Attribute[] = currentFormContext.getAttribute();
            // debugLog("currentControlsFound", controls);
            return controls;
        }
        else {
            return null;
        }
    }, [currentFormContext]);

    const executeOnEachAttribute = (f: (attribute: Xrm.Attributes.Attribute) => void) => {
        if (!attributes) return;
        const attributesToFill = attributes.filter(attribute => !excludedFields.includes(attribute.getName()));
        attributesToFill.forEach(f);
    }

    const originalValues = useMemo(() => {
        if (!attributes) return null;

        return attributes.map((attribute) => {
            const name = attribute.getName();
            const value = attribute.getValue();
            return { name, value };
        })
    }, [attributes]);

    const buttons = useMemo(() => [
        {
            label: "Fill Mandatory fields",
            function: (attribute: Xrm.Attributes.Attribute) => {
                const metadata = attributeMetadata.find(meta => meta.LogicalName === attribute.getName());
                if (!metadata) return;
                if (!metadata.IsValidForUpdate) return;

                if (attribute.getRequiredLevel() === 'required' && !attribute.getValue()) {
                    getRandomValue(currentFormContext, attribute, metadata).then((randomValue) => {
                        attribute.setValue(randomValue);
                        debugLog("Filled Field:", attribute.getName(), randomValue);
                    });
                }
            }
        },
        {
            label: "Fill BPF fields",
            function: (attribute: Xrm.Attributes.Attribute) => {
                const metadata = attributeMetadata.find(meta => meta.LogicalName === attribute.getName());
                if (!metadata) return;
                if (!metadata.IsValidForUpdate) return;

                if (attribute.controls.get().some(c => c.getName().startsWith('header_process_')) && !attribute.getValue()) {
                    getRandomValue(currentFormContext, attribute, metadata).then((randomValue) => {
                        attribute.setValue(randomValue);
                        debugLog("Filled Field:", attribute.getName(), randomValue);
                    });
                }
            }
        },
        {
            label: "Fill All fields",
            function: (attribute: Xrm.Attributes.Attribute) => {
                const metadata = attributeMetadata.find(meta => meta.LogicalName === attribute.getName());
                if (!metadata) return;
                if (!metadata.IsValidForUpdate) return;

                if (!attribute.getValue()) {
                    debugLog("Filled Fields list:");
                    getRandomValue(currentFormContext, attribute, metadata).then((randomValue) => {
                        if (randomValue !== undefined) {
                            attribute.setValue(randomValue);
                            debugLog("Filled Field:", attribute.getName(), randomValue);
                        }
                    });
                }
            }
        },
        {
            label: "Clear all fields",
            function: (attribute: Xrm.Attributes.Attribute) => {
                const metadata = attributeMetadata.find(meta => meta.LogicalName === attribute.getName());
                if (!metadata) return;
                if (!metadata.IsValidForUpdate) return;

                if (attribute.getValue()) {
                    attribute.setValue(null);
                    debugLog("Filled Field:", attribute.getName(), null);
                }
            }
        },
        {
            label: "Restore original values",
            function: (attribute: Xrm.Attributes.Attribute) => {
                const metadata = attributeMetadata.find(meta => meta.LogicalName === attribute.getName());
                if (!metadata) return;
                if (!metadata.IsValidForUpdate) return;

                const originalValue = originalValues?.find((v) => v.name === attribute.getName());
                attribute.setValue(originalValue?.value);
                debugLog("Filled Field:", attribute.getName(), originalValue?.value);

            }
        },
    ], [attributeMetadata, currentFormContext, originalValues]);

    // ---------- END Fill on menu ----------

    return (
        <>
            <Tooltip title='Fill Fields' placement='left'>
                {/* <Button
                    ref={anchorRef}
                    variant='contained'
                    onClick={toggleOpen}
                    startIcon={<FormatPaintIcon />}
                /> */}
                <Button
                    ref={anchorRef}
                    variant='contained'
                    onClick={toggleOpen}
                    onContextMenu={(e) => {toggleOpen(); e.preventDefault()}}
                    startIcon={fillOnClickEnable ? <ModeEditIcon /> : <EditOffOutlinedIcon />}
                />
            </Tooltip>
            <Menu
                id="basic-menu"
                anchorEl={anchorRef.current}
                open={open}
                onClose={setClose}
                onClick={setClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 'calc(50% - 4px)',
                            right: 0,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateX(50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
                anchorOrigin={{
                    vertical: 'center',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'center',
                    horizontal: 'right',
                }}
            >
                <Stack direction='column' spacing={0.5}>
                    <MenuItem onClick={toggleMode}>
                        {fillOnClickEnable ? "Disable Fill on Click" : "Enable Fill on Click"}
                    </MenuItem>
                    {
                        buttons.map(b => {
                            return (
                                <MenuItem onClick={() => executeOnEachAttribute(b.function)}>
                                    {b.label}
                                </MenuItem>
                            )
                        })
                    }
                </Stack>
            </Menu>
        </>
    );
}


export default FillFields;