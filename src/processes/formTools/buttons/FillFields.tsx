import { Tooltip, Button, Stack, Menu, MenuItem } from '@mui/material';

import React, { useMemo } from 'react';
import { SubProcessProps } from '../main';

import FormatPaintIcon from '@mui/icons-material/FormatPaint';
import { RetrieveAttributesMetaData } from '../../../utils/hooks/XrmApi/RetrieveAttributesMetaData';
import { AttributeMetadata, MSType, StringAttributeFormat } from '../../../utils/types/requestsType';
import { LookupValue } from '../../../utils/types/LookupValue';
import { useBoolean } from 'usehooks-ts';
import { debugLog } from '../../../utils/global/common';

const excludedFields = ["statecode", "statuscode"];

function FillFields(props: SubProcessProps) {

    const { currentFormContext } = props;


    const anchorRef = React.useRef(null);

    const { value: open, setValue: setOpen, setFalse: setClose, toggle: toggleOpen } = useBoolean(false);

    const [attributeMetadata, isFetching] = RetrieveAttributesMetaData(currentFormContext?.data.entity.getEntityName() ?? '');

    const executeOnEachAttribute = (f: (attribute: Xrm.Attributes.Attribute) => void) => {
        if (!attributes) return;
        const attributesToFill = attributes.filter(attribute => !excludedFields.includes(attribute.getName()));
        attributesToFill.forEach(f);
    }

    const buttons = [
        {
            label: "Fill Mandatory fields",
            function: (attribute: Xrm.Attributes.Attribute) => {
                const metadata = attributeMetadata.find(meta => meta.LogicalName === attribute.getName());
                if (!metadata) return;
                if (!metadata.IsValidForUpdate) return;

                if (attribute.getRequiredLevel() === 'required' && !attribute.getValue()) {
                    getRandomValue(attribute, metadata).then((randomValue) => {
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
                    getRandomValue(attribute, metadata).then((randomValue) => {
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
                    getRandomValue(attribute, metadata).then((randomValue) => {
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
    ];

    const getRandomValue = async (attribute: Xrm.Attributes.Attribute, metadata: AttributeMetadata) => {

        switch (metadata.MStype) {
            case MSType.Lookup:
                return getRandomLookup(metadata.Parameters.Target);
            case MSType.String:
            case MSType.Memo:
                return getRandomString(metadata.Parameters.MaxLength, metadata.Parameters.Format);
            case MSType.Decimal:
            case MSType.Double:
            case MSType.Money:
            case MSType.Integer:
            case MSType.BigInt:
                return getRandomNumber(metadata.Parameters.MinValue, metadata.Parameters.MaxValue, metadata.Parameters.Precision);
            case MSType.DateTime:
                return getRandomDate(metadata.Parameters.Format);
            case MSType.Boolean:
            case MSType.Status:
            case MSType.State:
            case MSType.Picklist:
            case MSType.MultiSelectPicklist:
                if (!currentFormContext) return null;
                const options = Object.values(
                    (await Xrm.Utility.getEntityMetadata(
                        currentFormContext.data.entity.getEntityName(),
                        [attribute.getName()])).Attributes.get(0).OptionSet
                ).map((o: any) => o.value);
                return getRandomPickList(options);
            case MSType.Uniqueidentifier:
            case MSType.Null:
                return null;
        }
    }

    const attributes = useMemo(() => {
        if (currentFormContext) {
            const controls: Xrm.Attributes.Attribute[] = currentFormContext.getAttribute();
            debugLog("currentControlsFound", controls);
            return controls;
        }
        else {
            return null;
        }
    }, [currentFormContext]);

    const originalValues = useMemo(() => {
        if (!attributes) return null;

        return attributes.map((attribute) => {
            const name = attribute.getName();
            const value = attribute.getValue();
            return { name, value };
        })
    }, [attributes]);

    return (
        <>
            <Tooltip title='Fill Fields' placement='left'>
                <Button
                    ref={anchorRef}
                    variant='contained'
                    onClick={toggleOpen}
                    startIcon={<FormatPaintIcon />}
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

function getRandomNumber(minValue: number, maxValue: number, precision: number = 0) {
    const number = minValue + Math.random() * (maxValue - minValue);
    return Number(number.toFixed(precision));
}

function getRandomStringGenerator(maxLength: number, allowSpaces = false, forceLowerCase = false) {
    const length = maxLength;

    const characters = 'bcdfghjklmnpqrstvwxyz';
    const vowels = "aeiou";
    const charactersLength = characters.length;
    const vowelsLength = vowels.length;

    let result = '';
    let counter = 0;
    let nextCharIsVowel = false;
    while (counter < length) {

        if (allowSpaces && Math.random() < 0.1 && counter < length - 3 && result.at(-1) !== ' ') {
            result += ' ';
        }
        else {
            nextCharIsVowel = characters.includes(result.at(-1) ?? ' ') || (result.at(-1) === ' ' && Math.random() < 0.4);
            if (nextCharIsVowel)
                result += vowels.charAt(Math.floor(Math.random() * vowelsLength));
            else
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        counter += 1;
    }
    if (!forceLowerCase) {
        const arr = result.split(' ');
        for (var i = 0; i < arr.length; i++) {
            arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1).toLowerCase();
        }
        return arr.join(' ');
    }
    else {
        return result;
    }
}

function getRandomString(maxLength: number, format: string) {
    switch (format) {
        case StringAttributeFormat.Email:
            return `${getRandomStringGenerator(Math.min((maxLength / 3), 15), false, true)}@${getRandomStringGenerator(Math.min((maxLength / 3), 10), false, true)}.${getRandomStringGenerator(getRandomNumber(2, 3), false, true)}`;
        case StringAttributeFormat.Phone:
        case StringAttributeFormat.Text:
        case StringAttributeFormat.TextArea:
        case StringAttributeFormat.TickerSymbol:
            return getRandomStringGenerator(Math.min((maxLength / 3), 50), true);
        case StringAttributeFormat.URL:
            return `www.${getRandomStringGenerator(Math.min((maxLength / 3), 20))}.${getRandomStringGenerator(3)}`;
    }
    return '';
}

function getRandomPickList(options: number[]) {
    const randomIndex = getRandomNumber(0, options.length - 1);
    return options.at(randomIndex);
}

async function getRandomLookup(target: string): Promise<LookupValue[] | null> {
    const randomIndex = getRandomNumber(1, 5);
    const primaryIdAttribute = (await Xrm.Utility.getEntityMetadata(target)).PrimaryIdAttribute;
    const primaryNameAttribute = (await Xrm.Utility.getEntityMetadata(target)).PrimaryNameAttribute;
    const record = (await Xrm.WebApi.online.retrieveMultipleRecords(target, `?$select=${primaryIdAttribute},${primaryNameAttribute}`, randomIndex)).entities.at(randomIndex - 1);
    if (!record) return null;
    return [{
        id: record[primaryIdAttribute],
        name: record[primaryNameAttribute],
        entityType: target,
    }];
}

function getRandomDate(format: string) {
    const start = new Date(1753, 1, 1);
    const end = new Date(9999, 12, 31);
    return new Date(getRandomNumber(start.getTime(), end.getTime()));
}

export default FillFields;