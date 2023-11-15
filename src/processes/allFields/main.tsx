
import { Button, ButtonGroup, createTheme, Divider, List, ListItemButton, ListItemText, ListSubheader, Skeleton, Stack, ThemeProvider } from '@mui/material';
import React, { forwardRef, useCallback, useEffect, useMemo, useState, } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../../utils/global/.processClass';

import { RetrieveAllAttributes } from '../../utils/hooks/XrmApi/RetrieveAllAttributes';

import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FilterInput from '../../utils/components/FilterInput';
import { useCurrentRecord } from '../../utils/hooks/use/useCurrentRecord';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import CopyMenu from '../../utils/components/CopyMenu';

class AllFieldsButton extends ProcessButton {
    constructor() {
        super(
            'allfields',
            'All Attributes',
            <FormatListBulletedIcon />,
            350
        );
        this.process = AllFieldsButtonProcess;
    }
}

declare module '@mui/material/Divider' {
    interface DividerPropsVariantOverrides {
        bold: true;
    }
}

let theme = createTheme({});

theme = createTheme(theme, {
    components: {
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    '& hr': {
                        mx: 1,
                    },
                }
            }
        },
        MuiListItemText: {
            styleOverrides: {
                root: {
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                },
                primary: {
                    display: "inline-block",

                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    width: 'fit-content',
                }
            }
        },
        MuiDivider: {
            variants: [
                {
                    props: { variant: 'bold' },
                    style: {
                        backgroundColor: theme.palette.divider,
                        border: "none",
                        height: 2,
                        margin: 0,
                    }
                }
            ]
        }
    }
});



const AllFieldsButtonProcess = forwardRef<ProcessRef, ProcessProps>(
    function AllFieldsButtonProcess(props: ProcessProps, ref) {

        // const entityName: string = 'opportunity';
        // const recordId: string = 'a97587bd-4cb1-4d9b-ad8b-927bfc71b560';

        const { entityName, isEntityRecord, recordId, forceRefresh } = useCurrentRecord();

        const [attributes, isFetching] = RetrieveAllAttributes(entityName ?? '', recordId);

        const [filter, setFilter] = useState<string>('');
        const [forceOpenAll, setForceOpenAll] = useState<boolean>(false);
        const [forceCloseAll, setForceCloseAll] = useState<boolean>(false);


        const toggleForceOpen = useCallback(() => {
            setForceOpenAll(true);
            setTimeout(() => {
                setForceOpenAll(false);
            }, 500);
        }, [setForceOpenAll]);

        const toggleForceClose = useCallback(() => {
            setForceCloseAll(true);
            setTimeout(() => {
                setForceCloseAll(false);
            }, 500);
        }, [setForceCloseAll]);

        const attributesSet: {
            [attributeName: string]: {
                value: { value: any, selector: string },
                [x: string]: { value: any, selector: string };
            };
        } = useMemo(() => {
            return Object.entries(attributes)
                .filter(([key, value]) => key.includes(filter))
                .reduce((previousValue: { [key: string]: any; }, currentValue: [string, any], index) => {
                    const [key, value] = currentValue;
                    const attSplit = key.split("@");
                    const attName = attSplit[0];
                    const attMore = attSplit[1];
                    const subName = attMore?.split(".").at(-1);
                    if (!previousValue[attName]) {
                        if (attMore && subName) {
                            return {
                                ...previousValue,
                                [attName]: {
                                    [subName]: { value: value, selector: key }
                                }
                            };
                        } else {
                            return {
                                ...previousValue,
                                [attName]: {
                                    value: { value: value, selector: key }
                                }
                            };
                        }
                    } else {
                        const copy = { ...previousValue };
                        if (attMore && subName) {
                            copy[attName] = {
                                ...copy[attName],
                                [subName]: { value: value, selector: key },
                            };
                        }
                        else {
                            copy[attName] = {
                                ...copy[attName],
                                value: { value: value, selector: key }
                            };
                        }
                        return copy;
                    }
                }, {});
        }, [attributes, filter]);

        return (
            <ThemeProvider theme={theme}>
                <Stack spacing={4} width='calc(100% - 10px)' padding='10px' alignItems='center'>
                    <List
                        sx={{ width: '100%', bgcolor: 'background.paper', overflowY: 'auto' }}
                        component="nav"
                        subheader={
                            <ListSubheader component="div">
                                <ButtonGroup variant="contained" fullWidth size='small'>
                                    <Button onClick={toggleForceOpen}>Open All</Button>
                                    <Button onClick={toggleForceClose}>Close All</Button>
                                    <Button onClick={forceRefresh}>Refresh</Button>
                                </ButtonGroup>
                                <FilterInput fullWidth placeholder='Search by Attribute Name' defaultValue={filter} returnFilterInput={setFilter} />
                            </ListSubheader>
                        }
                    >
                        {
                            isFetching ?
                                <Stack width='100%' height='100%' spacing={0.5}>
                                    {[...Array(13)].map(() => <Skeleton variant='rounded' height={'55px'} />)}
                                </Stack>
                                :
                                Object.entries(attributesSet).map(([key, value], index) => {
                                    return (
                                        <AttributeListItem
                                            forceOpen={forceOpenAll}
                                            forceClose={forceCloseAll}
                                            key={'attributelistitem' + index}
                                            attributeName={key}
                                            values={value}
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

interface AttributeListItemProps {
    forceOpen: boolean,
    forceClose: boolean,
    attributeName: string,
    values: {
        value: { value: any, selector: string },
        [x: string]: {
            value: any;
            selector: string;
        }
    },
}
const AttributeListItem = React.memo((props: AttributeListItemProps) => {
    const { forceOpen, forceClose, attributeName, values: { value, ...otherValues } } = props;

    const [open, setOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleOpenContextualMenu = (e: React.MouseEvent<HTMLDivElement>) => {
        setAnchorEl(e.currentTarget);
        e.preventDefault();
    }
    const handleCloseContextualMenu = () => {
        setAnchorEl(null);
    }

    useEffect(() => {
        if (forceOpen) {
            setOpen(true);
        }
    }, [forceOpen]);

    useEffect(() => {
        if (forceClose) {
            setOpen(false);
        }
    }, [forceClose]);

    const handleClick = () => {
        setOpen(value => !value);
    };

    const valueDisplay = useMemo(() => {
        return !!value?.value || value?.value === false || value?.value === 0 ? value.value + '' : <i>null</i>
    }, [value]);


    const copyContent = useMemo(() => (
        [
            { title: 'logicalname', content: attributeName },
            { title: 'value', content: value?.value },
        ]
    ), [attributeName, value]);

    return (
        <>
            <Divider variant='bold' />

            <ListItemButton sx={{ pl: 1, pb: 0, pt: 0 }} onClick={handleClick} onContextMenu={handleOpenContextualMenu}>
                <ListItemText title={attributeName} primary={attributeName} secondary={!open ? valueDisplay : null} />
                {open ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <CopyMenu anchorElement={anchorEl} onClose={handleCloseContextualMenu} items={copyContent} />

            {open && <>
                <Divider variant="middle" />

                <List component="div" sx={{ pt: 0 }}>
                    <AttributeListItemValue key='value' title='Value' value={value} />
                    {
                        Object.entries(otherValues).map(([key, value]) => {
                            return (
                                <AttributeListItemValue key={key} title={key} value={value} />
                            )
                        })
                    }

                </List>
            </>}
        </>
    )
});

interface AttributeListItemValueProps {
    title: string,
    value: {
        value: any;
        selector: string;
    },
}
const AttributeListItemValue = React.memo((props: AttributeListItemValueProps) => {
    const { title, value: { value, selector } } = props;


    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleOpenContextualMenu = (e: React.MouseEvent<HTMLDivElement>) => {
        setAnchorEl(e.currentTarget);
        e.preventDefault();
    }
    const handleCloseContextualMenu = () => {
        setAnchorEl(null);
    }

    const valueDisplay = useMemo(() => (value || value === false || value === 0 ? value + '' : <i>null</i>), [value]);

    const copyContent = useMemo(() => (
        [
            { title: title, content: value },
            { title: 'selector', content: selector },
        ]
    ), [title, value, selector]);

    return (
        <>
            <ListItemButton sx={{ p: 0, pl: 1 }} onContextMenu={handleOpenContextualMenu}>
                <ListItemText
                    title={value ?? "--empty--"}
                    primary={valueDisplay}
                    // primaryTypographyProps={{
                    //     textAlign: "right"
                    // }}
                    secondary={title}
                    sx={{
                        display: "flex",
                        flexDirection: "column-reverse",
                        pl: 2
                    }}
                />
            </ListItemButton>
            <CopyMenu anchorElement={anchorEl} onClose={handleCloseContextualMenu} items={copyContent} />
            <Divider variant="middle" />
        </>
    );
});



const allFields = new AllFieldsButton();
export default allFields;