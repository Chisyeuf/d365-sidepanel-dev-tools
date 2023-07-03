
import { Collapse, createTheme, Divider, List, ListItemButton, ListItemIcon, ListItemText, ListSubheader, ThemeProvider, Tooltip, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState, } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../../utils/global/.processClass';
import HandymanIcon from '@mui/icons-material/Handyman';

import { debugLog } from '../../utils/global/common';

import { Env } from '../../utils/global/var';
import { RetrieveAllAttributes } from '../../utils/hooks/XrmApi/RetrieveAllAttributes';


import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

class AllFieldsButton extends ProcessButton {
    constructor() {
        super(
            'allfields',
            'All Fields',
            <HandymanIcon />,
            200
        );
        this.process = AllFieldsButtonProcess;
    }
}

const theme = createTheme({
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
                    // background:'red',

                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    // "&:hover > .MuiListItemText-primary": {
                    //   transform: "translateX(-100%)",
                    //   left: "100%"
                    // },
                    // "&:hover::before": {
                    //   width: "40px",
                    // },
                    // "&:before": {
                    //   content: '""',
                    //   position: "absolute",
                    //   top: 0,
                    //   height: "100%",
                    //   width: "20px",
                    //   left: 0,
                    //   transition: "width 2s linear",
                    //   background:
                    //     "linear-gradient(to left,rgba(255, 255, 255, 0),rgba(255, 255, 255, 1));"
                    // },
                    // "&:after": {
                    //   content: '""',
                    //   position: "absolute",
                    //   top: 0,
                    //   height: "100%",
                    //   width: "40px",
                    //   right: '0px',
                    //   background:
                    //     "linear-gradient(to right,rgba(255, 255, 255, 0),rgba(255, 255, 255, 1));"
                    // }
                },
                primary: {
                    // background:'yellow',

                    display: "inline-block",

                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    width: 'fit-content'
                    // position: "relative",
                    // textOverflow: "ellipsis",
                    // overflow: "visible",
                    // whiteSpace: "nowrap",
                    // transition: "all 2s linear",
                    // left: "0%"
                }
            }
        }
    }
});

const AllFieldsButtonProcess = forwardRef<ProcessRef, ProcessProps>(
    function AllFieldsButtonProcess(props: ProcessProps, ref) {

        const entityName: string = 'opportunity';
        const recordId: string = 'a97587bd-4cb1-4d9b-ad8b-927bfc71b560';

        const [attributes, isFetching] = RetrieveAllAttributes(entityName, recordId);

        const attributesSet: {
            [attributeName: string]: {
                value: any,
                [x: string]: any;
            };
        } = useMemo(() => {
            return Object.entries(attributes).reduce((previousValue: { [key: string]: any; }, currentValue: [string, any], index) => {
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
                                [subName]: value
                            }
                        };
                    } else {
                        return {
                            ...previousValue,
                            [attName]: {
                                value: value
                            }
                        };
                    }
                } else {
                    const copy = { ...previousValue };
                    if (attMore && subName) {
                        copy[attName] = {
                            ...copy[attName],
                            [subName]: value
                        };
                    }
                    else {
                        copy[attName] = {
                            ...copy[attName],
                            value: value
                        };
                    }
                    return copy;
                }
            }, {});
        }, [attributes]);

        return (
            <ThemeProvider theme={theme}>
                <Stack spacing={4} width='calc(100% - 10px)' padding='10px' alignItems='center'>
                    <List
                        sx={{ width: '100%', bgcolor: 'background.paper' }}
                        component="nav"
                        aria-labelledby="nested-list-subheader"
                        subheader={
                            <ListSubheader component="div" id="nested-list-subheader">
                                Nested List Items
                            </ListSubheader>
                        }
                    >
                        {
                            Object.entries(attributesSet).map(([key, value], index) => {
                                return <AttributeListItem key={'attributelistitem' + index} attributeName={key} value={value} />;
                            })
                        }
                    </List>
                </Stack>
            </ThemeProvider>
        );
    }
);

interface AttributeListItemProps {
    attributeName: string,
    value: any,
}
function AttributeListItem(props: AttributeListItemProps) {
    const { attributeName, value } = props;

    const [open, setOpen] = useState(true);

    const handleClick = () => {
        setOpen(value => !value);
    };

    return (
        <>
            <ListItemButton sx={{ pl: 3 }} onClick={handleClick}>
                <ListItemText title={attributeName} primary={attributeName} />
                {open ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    <Stack spacing={0.5} direction='row'>
                        <ListItemText
                            title={value || "empty"}
                            primary={value || "empty"}
                            primaryTypographyProps={{
                                textAlign: "right"
                            }}
                            secondary='Value'
                        />
                        <Divider variant="middle" orientation="vertical" flexItem />
                        <ListItemText
                            title={value || "empty"}
                            primary={value || "empty"}
                            primaryTypographyProps={{
                                textAlign: "right"
                            }}
                            secondary='FormatedValue'
                        />
                        <Divider variant="middle" orientation="vertical" flexItem />
                        <ListItemText
                            title={value || "empty"}
                            primary={value || "empty"}
                            primaryTypographyProps={{
                                textAlign: "right"
                            }}
                            secondary='LookupLogicalName'
                        />
                    </Stack>
                </List>
            </Collapse>
            <Divider />
        </>
    )
}



const allFields = new AllFieldsButton();
export default allFields;