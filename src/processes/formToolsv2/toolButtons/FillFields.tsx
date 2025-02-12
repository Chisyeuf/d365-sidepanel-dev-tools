import { Stack, Menu, MenuItem, Divider } from '@mui/material';

import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { RetrieveAttributesMetaData } from '../../../utils/hooks/XrmApi/RetrieveAttributesMetaData';
import { useBoolean } from 'usehooks-ts';
import { debugLog } from '../../../utils/global/common';
import { getRandomValue } from '../../../utils/global/fieldsValueManagement';


import ModeEditIcon from '@mui/icons-material/ModeEdit';
import EditOffOutlinedIcon from '@mui/icons-material/EditOffOutlined';
import { IToolButtonStandard, ToolButton } from '../ToolButton';
import { FormToolContext } from '../context';

const excludedFields = ["statecode", "statuscode"];

function FillFields(props: IToolButtonStandard) {

    const { formContext, formDocument, domUpdated } = useContext(FormToolContext);

    const anchorRef = React.useRef(null);

    const { value: open, setTrue: setOpen, setFalse: setClose, toggle: toggleOpen } = useBoolean(false);

    const [attributeMetadata, isFetching] = RetrieveAttributesMetaData(formContext?.data?.entity?.getEntityName() ?? '');

    // ---------- Fill on click mode ----------
    const [fillOnClickEnable, setFillOnClick] = useState<boolean>(false);

    const toggleMode = () => {
        setFillOnClick(!fillOnClickEnable);
    }

    const fieldsControls = useMemo(() => {
        if (formContext) {
            const controls: Xrm.Controls.Control[] = formContext.getControl();

            return controls;
        }
        else {
            return null;
        }

    }, [formContext]);

    const onClickField = useCallback((event: Event) => {
        if (!formContext) return;

        const controlName = (event.currentTarget as HTMLElement | undefined)?.parentElement?.getAttribute('data-control-name');
        if (!controlName) return;

        const control = formContext.getControl(controlName);
        const attributeName = (control as any).controlDescriptor.Id;
        const attribute = formContext.getAttribute(attributeName);
        const metadata = attributeMetadata.find(meta => meta.LogicalName === attributeName);

        if (!metadata) return;

        getRandomValue(formContext, attribute, metadata).then((randomValue) => {
            attribute.setValue(randomValue);
            debugLog("Field filled with :", attribute.getName(), randomValue);
        });
    }, [attributeMetadata, formContext]);


    useEffect(() => {
        const toggle = async () => {
            fieldsControls?.map((c) => {
                const controlName = c.getName();
                const controlNodeT = (formDocument ?? document).querySelector(`[data-id="${controlName}"] > div`);
                controlNodeT?.removeEventListener('click', onClickField);
                if (fillOnClickEnable)
                    controlNodeT?.addEventListener('click', onClickField);
            });
        }

        toggle();
    }, [formContext, formDocument, domUpdated, fillOnClickEnable, fieldsControls]);
    // ---------- END Fill on click mode ----------


    // ---------- Fill on menu ----------
    const attributes = useMemo(() => {
        if (formContext) {
            const controls: Xrm.Attributes.Attribute[] = formContext.getAttribute();
            // debugLog("currentControlsFound", controls);
            return controls;
        }
        else {
            return null;
        }
    }, [formContext]);

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

    const buttons: { label: string; action: (attribute: Xrm.Attributes.Attribute) => void; divider?: boolean; }[] = useMemo(() => [

        {
            label: "Fill Mandatory fields",
            action: (attribute: Xrm.Attributes.Attribute) => {
                const metadata = attributeMetadata.find(meta => meta.LogicalName === attribute.getName());
                if (!metadata) return;
                if (!metadata.IsValidForUpdate) return;

                if (attribute.getRequiredLevel() === 'required' && !attribute.getValue()) {
                    getRandomValue(formContext, attribute, metadata).then((randomValue) => {
                        attribute.setValue(randomValue);
                        debugLog("Filled Field:", attribute.getName(), randomValue);
                    });
                }
            }
        },
        {
            label: "Fill BPF fields",
            action: (attribute: Xrm.Attributes.Attribute) => {
                const metadata = attributeMetadata.find(meta => meta.LogicalName === attribute.getName());
                if (!metadata) return;
                if (!metadata.IsValidForUpdate) return;

                if (attribute.controls.get().some(c => c.getName().startsWith('header_process_')) && !attribute.getValue()) {
                    getRandomValue(formContext, attribute, metadata).then((randomValue) => {
                        attribute.setValue(randomValue);
                        debugLog("Filled Field:", attribute.getName(), randomValue);
                    });
                }
            }
        },
        {
            label: "Fill All fields",
            action: (attribute: Xrm.Attributes.Attribute) => {
                const metadata = attributeMetadata.find(meta => meta.LogicalName === attribute.getName());
                if (!metadata) return;
                if (!metadata.IsValidForUpdate) return;

                if (!attribute.getValue()) {
                    debugLog("Filled Fields list:");
                    getRandomValue(formContext, attribute, metadata).then((randomValue) => {
                        if (randomValue !== undefined) {
                            attribute.setValue(randomValue);
                            debugLog("Filled Field:", attribute.getName(), randomValue);
                        }
                    });
                }
            }
        },
        {
            divider: true,
            label: fillOnClickEnable ? "Disable Fill on Click" : "Enable Fill on Click",
            action: toggleMode,
        },
        {
            divider: true,
            label: "Clear all fields",
            action: (attribute: Xrm.Attributes.Attribute) => {
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
            action: (attribute: Xrm.Attributes.Attribute) => {
                const metadata = attributeMetadata.find(meta => meta.LogicalName === attribute.getName());
                if (!metadata) return;
                if (!metadata.IsValidForUpdate) return;

                const originalValue = originalValues?.find((v) => v.name === attribute.getName());
                attribute.setValue(originalValue?.value);
                debugLog("Filled Field:", attribute.getName(), originalValue?.value);

            }
        },
    ], [attributeMetadata, formContext, originalValues, fillOnClickEnable]);

    // ---------- END Fill on menu ----------

    return (
        <>
            <ToolButton
                ref={anchorRef}
                controlled={false}
                icon={fillOnClickEnable ? <ModeEditIcon /> : <EditOffOutlinedIcon />}
                tooltip='Fill Fields'
                onClick={toggleOpen}
            />
            <Menu
                id="basic-menu"
                anchorEl={anchorRef.current}
                open={open}
                onClose={setClose}
                onClick={setClose}
                slotProps={{
                    paper: {
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
                    }
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
                    {/* <MenuItem onClick={toggleMode}>
                        {fillOnClickEnable ? "Disable Fill on Click" : "Enable Fill on Click"}
                    </MenuItem> */}
                    {
                        buttons.map(button => {
                            const menuButton = (
                                <MenuItem onClick={() => executeOnEachAttribute(button.action)}>
                                    {button.label}
                                </MenuItem>
                            );
                            if (button.divider) {
                                return <>
                                    <Divider sx={{ my: 0.5 }} />
                                    {menuButton}
                                </>
                            }
                            return menuButton;
                        })
                    }
                </Stack>
            </Menu>
        </>
    );
}


export default FillFields;