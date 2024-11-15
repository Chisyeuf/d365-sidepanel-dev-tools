
import { Box, Button, ButtonGroup, createTheme, Divider, List, ListItemButton, ListItemText, Skeleton, Stack, ThemeProvider } from '@mui/material';
import React, { forwardRef, useCallback, useEffect, useMemo, useState, } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../../utils/global/.processClass';

import { RetrieveAllAttributes } from '../../utils/hooks/XrmApi/RetrieveAllAttributes';

import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useCurrentRecord } from '../../utils/hooks/use/useCurrentRecord';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import CopyMenu from '../../utils/components/CopyMenu';
import { useBoolean, useCopyToClipboard } from 'usehooks-ts';
import JsonView from '@uiw/react-json-view';
import { vscodeTheme } from '@uiw/react-json-view/vscode';
import ReactDOM from 'react-dom';
import MuiVirtuoso from '../../utils/components/MuiVirtuoso';


class AllFieldsButton extends ProcessButton {
    constructor() {
        super(
            'allfields',
            'All Attributes',
            <FormatListBulletedIcon />,
            450
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

const jsonStyle: React.CSSProperties = {
    width: 'calc(100% - 16px)',
    height: 'calc(100% - 16px)',
    overflow: 'auto',
    padding: 8,
    fontSize: 15,
    overflowWrap: 'break-word',
}

type AttributeSetType = {
    [attributeName: string]: {
        value: { value: any, selector: string },
        [x: string]: { value: any, selector: string };
    }
}

const AllFieldsButtonProcess = forwardRef<ProcessRef, ProcessProps>(
    function AllFieldsButtonProcess(props: ProcessProps, ref) {

        const [, copy] = useCopyToClipboard();

        const { entityName, isEntityRecord, recordId, forceRefresh } = useCurrentRecord();

        const [attributes, isFetching] = RetrieveAllAttributes(entityName ?? '', recordId);

        const [filter, setFilter] = useState<string>('');
        const [forceOpenAll, setForceOpenAll] = useState<boolean>(false);
        const [forceCloseAll, setForceCloseAll] = useState<boolean>(false);
        const { value: showRaw, toggle: toggleShowRaw } = useBoolean(false);


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

        const attributesRawFiltered = useMemo(() => {
            const filterLower = filter.toLowerCase();
            return Object.entries(attributes).reduce<{ [key: string]: any }>((acc, [key, value]) => {
                if (key.toLowerCase().includes(filterLower) || value?.toString().toLowerCase().includes(filterLower)) {
                    acc[key] = attributes[key];
                }
                return acc;
            }, {});
        }, [attributes, filter]);

        const attributesRawFilteredString = useMemo(() => {
            return JSON.stringify(attributesRawFiltered, null, 2);
        }, [attributesRawFiltered]);

        const attributesSet: AttributeSetType = useMemo(() => {
            return Object.entries(attributes)
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
        }, [attributes]);

        const attributesSetFiltered = useMemo(() => {
            const lowerFilter = filter.toLowerCase();
            return Object.fromEntries(Object.entries(attributesSet).filter(([key, values]) =>
                key.toLowerCase().includes(lowerFilter) || String(values.value.value).toLowerCase().includes(lowerFilter) || Object.entries(values).some(([innerKey, innerValue]) => String(innerValue.value).toLowerCase().includes(lowerFilter)))
            );
        }, [attributesSet, filter]);


        const openRawInTab = useCallback(() => {
            var newTab = window.open();
            newTab?.document.open();
            newTab?.document.write('<html><body style="margin:0"></body></html>');
            ReactDOM.render(
                <Box height='calc(100% - 96px)' width='100%'>
                    <JsonView
                        value={attributesRawFiltered}
                        style={{ ...vscodeTheme, ...jsonStyle }}
                        collapsed={1}
                        highlightUpdates={false}
                        // displayDataTypes={false}
                        shortenTextAfterLength={36}
                        indentWidth={50}
                    >
                        <JsonView.Quote>
                            <span />
                        </JsonView.Quote>
                    </JsonView>
                </Box>
                , newTab?.document.querySelector('body')!);
            newTab?.document.close();
        }, [attributesRawFiltered]);

        const [copying, setCopying] = useState(false);
        const copyRawInClipboard = useCallback(() => {
            setCopying(true);
            copy(attributesRawFilteredString);
            setTimeout(() => {
                setCopying(false);
            }, 1500);
        }, [attributesRawFiltered, copy]);


        return (
            <ThemeProvider theme={theme}>
                {
                    showRaw ?
                        <AttributeListRaw
                            attributesRawFiltered={attributesRawFiltered}
                            copyRawInClipboard={copyRawInClipboard}
                            copying={copying}
                            forceRefresh={forceRefresh}
                            isFetching={isFetching}
                            openRawInTab={openRawInTab}
                            toggleShowRaw={toggleShowRaw}
                        />
                        :
                        <AttributeList
                            toggleForceOpen={toggleForceOpen}
                            toggleForceClose={toggleForceClose}
                            forceOpenAll={forceOpenAll}
                            forceCloseAll={forceCloseAll}
                            attributesSetFiltered={attributesSetFiltered}
                            forceRefresh={forceRefresh}
                            toggleShowRaw={toggleShowRaw}
                            isFetching={isFetching}
                        />
                }
            </ThemeProvider>
        );
    }
);


interface AttributeListCommonProps {
    forceRefresh: () => void
    toggleShowRaw: () => void
    isFetching: boolean
}
interface AttributeListProps {
    toggleForceOpen: () => void
    toggleForceClose: () => void
    forceOpenAll: boolean
    forceCloseAll: boolean
    attributesSetFiltered: {
        [k: string]: {
            [x: string]: {
                value: any;
                selector: string;
            };
            value: {
                value: any;
                selector: string;
            };
        };
    }
}
interface AttributeListRawProps {
    copyRawInClipboard: () => void
    openRawInTab: () => void
    copying: boolean
    attributesRawFiltered: { [key: string]: any; }
}
const AttributeListRaw = React.memo((props: AttributeListRawProps & AttributeListCommonProps) => {
    const { attributesRawFiltered, copyRawInClipboard, forceRefresh, isFetching, openRawInTab, toggleShowRaw, copying } = props;

    return (
        <ThemeProvider theme={theme}>
            <Stack spacing={1} height='calc(100% - 10px)' width='calc(100% - 20px)' padding='10px' pr={0} pt={0} alignItems='center'>

                <ButtonGroup variant="contained" fullWidth size='small'>
                    <Button onClick={copyRawInClipboard}>{copying ? "Copied!" : "Copy"}</Button>
                    <Button onClick={openRawInTab}>Open in tab</Button>
                    <Button onClick={forceRefresh}>Refresh</Button>
                    <Button onClick={toggleShowRaw}>Hide Raw</Button>
                </ButtonGroup>

                <Box height='calc(100% - 30px)' width='100%'>
                    <JsonView
                        value={isFetching ? { "Fetching...": "" } : attributesRawFiltered}
                        style={jsonStyle}
                        collapsed={1}
                        highlightUpdates={false}
                        // displayDataTypes={false}
                        shortenTextAfterLength={36}
                        indentWidth={20}
                    >
                        <JsonView.Quote>
                            <span />
                        </JsonView.Quote>
                    </JsonView>
                </Box>
            </Stack>
        </ThemeProvider>
    );
});

const AttributeList = React.memo((props: AttributeListProps & AttributeListCommonProps) => {
    const { attributesSetFiltered, forceRefresh, isFetching, toggleShowRaw, toggleForceClose, toggleForceOpen, forceCloseAll, forceOpenAll } = props;

    return (
        <ThemeProvider theme={theme}>
            <Stack spacing={1} height='calc(100% - 10px)' width='calc(100% - 20px)' padding='10px' pr={0} pt={0} alignItems='center'>

                <ButtonGroup variant="contained" fullWidth size='small'>
                    <Button onClick={toggleForceOpen}>Open All</Button>
                    <Button onClick={toggleForceClose}>Close All</Button>
                    <Button onClick={forceRefresh}>Refresh</Button>
                    <Button onClick={toggleShowRaw}>Show Raw</Button>
                </ButtonGroup>

                <List
                    sx={{ width: '100%', height: '100%', bgcolor: 'background.paper', overflowY: 'auto' }}
                >
                    {
                        isFetching ?
                            <Stack width='100%' height='100%' spacing={0.5}>
                                {[...Array(13)].map(() => <Skeleton variant='rounded' height={'55px'} />)}
                            </Stack>
                            :
                            (
                                <MuiVirtuoso
                                    data={Object.entries(attributesSetFiltered)}
                                    itemContent={(index, [key, value]) => {
                                        return (
                                            <AttributeListItem
                                                forceOpen={forceOpenAll}
                                                forceClose={forceCloseAll}
                                                key={'attributelistitem' + index}
                                                attributeName={key}
                                                values={value}
                                            />
                                        );
                                    }}
                                />
                                //             Object.entries(attributesSetFiltered).map(([key, value], index) => {
                                //                 return (
                                // <AttributeListItem
                                //     forceOpen={forceOpenAll}
                                //     forceClose={forceCloseAll}
                                //     key={'attributelistitem' + index}
                                //     attributeName={key}
                                //     values={value}
                                // />
                                // );
                                // })
                            )
                    }
                </List>
            </Stack>
        </ThemeProvider>
    );
});


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