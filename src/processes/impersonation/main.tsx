
import { Box, Button, Checkbox, createTheme, Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Skeleton, Theme, ThemeProvider, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../../utils/global/.processClass';
import HandymanIcon from '@mui/icons-material/Handyman';
import XrmObserver from '../../utils/global/XrmObserver';

import { debugLog, GetExtensionId } from '../../utils/global/common';
import { useBoolean } from 'usehooks-ts';

import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import { Tooltip } from '@material-ui/core';
import ObserveDOM from '../../utils/global/DOMObserver';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import { RetrieveActiveUsersWithSecurityRoles } from '../../utils/hooks/XrmApi/RetrieveActiveUsersWithSecurityRoles';
import FilterInput from '../../utils/components/FilterInput';

import SecurityIcon from '@mui/icons-material/Security';
import { RetrieveSecurityRole } from '../../utils/hooks/XrmApi/RetrieveSecurityRole';
import { useStateCallback } from '../../utils/hooks/use/useStateCallback';
import { MessageType } from '../../utils/types/Message';
import { ActiveUser } from '../../utils/types/ActiveUser';
import { SecurityRole } from '../../utils/types/SecurityRole';

class ImpersonationButton extends ProcessButton {
    constructor() {
        super(
            'impersonate',
            'Impersonation',
            <PersonSearchIcon />,
            100
        );
        this.process = ImpersonationProcess;
    }
}

const rowHeight = 35;

const ImpersonationProcess = forwardRef<ProcessRef, ProcessProps>(
    function ImpersonationProcess(props: ProcessProps, ref) {

        const [userSelected, setUserSelected] = useStateCallback<ActiveUser | null>(null);
        const [securityRoleSeclected, setSecurityRoleSeclected] = useState<SecurityRole[]>([]);

        const [filter, setFilter] = useState('');

        const [activeUsers, isFetching] = RetrieveActiveUsersWithSecurityRoles();

        const extensionId = GetExtensionId();

        const handleSelect = (user: typeof activeUsers[0]) => () => {
            setUserSelected((oldUser) => oldUser?.systemuserid !== user.systemuserid ? user : null,
                (newUser) => {
                    const data = { userSelected: newUser, selectedon: new Date(), url: Xrm.Utility.getGlobalContext().getClientUrl() };
                    chrome.runtime.sendMessage(extensionId, { type: MessageType.IMPERSONATE, data: data },
                        function (response) {
                            if (response.success) {
                            }
                        }
                    );
                });
        }

        useEffect(() => {
            if (!activeUsers) return;
            chrome.runtime.sendMessage(extensionId, { type: MessageType.GETIMPERSONATION },
                function (existingRules: chrome.declarativeNetRequest.Rule[]) {
                    console.log(existingRules);

                    const url = Xrm.Utility.getGlobalContext().getClientUrl();
                    const currentRule = existingRules.find(r => r.condition.urlFilter?.includes(url));

                    if (currentRule) {
                        const currentAzureId = currentRule.action.requestHeaders?.at(0)?.value;
                        if (currentAzureId) {
                            const impersonateUser = activeUsers.find(u => u.azureObjectId === currentAzureId);
                            setUserSelected(impersonateUser ?? null);
                        }
                    }
                }
            );
        }, [activeUsers]);


        // useEffect(() => {
        //     chrome.runtime.sendMessage(extensionId, { type: 'impersonate', data: { userSelected: userSelected, selectedon: new Date() } },
        //         function (response) {
        //             if (!response.success)
        //                 console.log('error');
        //         }
        //     );
        // }, [userSelected]);


        return (
            <Stack direction='column' spacing={0.5} width="-webkit-fill-available" padding="10px">
                <Stack direction='row' spacing={0.5} width="-webkit-fill-available">
                    <FilterInput fullWidth placeholder='Name or Email address' returnFilterInput={setFilter} />
                    <SecurityRoleMenu securityRoleSeclected={securityRoleSeclected} setSecurityRoleSeclected={setSecurityRoleSeclected} />
                </Stack>
                <Divider />
                {
                    isFetching ?
                        [...Array(22)].map(() => <Skeleton variant='rounded' height={rowHeight + 'px'} />)
                        :
                        <List sx={{ width: '100%', overflowY: 'scroll' }}>
                            {
                                activeUsers.map((user) => {

                                    if (securityRoleSeclected.filter(role =>
                                        user.securityRoles.filter(r =>
                                            r.roleid === role.roleid).length).length !== securityRoleSeclected.length) {
                                        return null;
                                    }

                                    if (!user.fullName.includes(filter) && !user.emailAddress.includes(filter)) {
                                        return null;
                                    }

                                    const labelId = `checkbox-list-label-${user.systemuserid}`;

                                    return (
                                        <ListItem
                                            key={user.systemuserid}
                                            disablePadding
                                        >
                                            <ListItemButton role={undefined} onClick={handleSelect(user)} dense>
                                                <ListItemIcon
                                                    sx={{
                                                        minWidth: '28px'
                                                    }}
                                                >
                                                    <Checkbox
                                                        edge="start"
                                                        checked={userSelected?.systemuserid === user.systemuserid}
                                                        tabIndex={-1}
                                                        disableRipple
                                                        inputProps={{ 'aria-labelledby': labelId }}
                                                        sx={{
                                                            padding: '3px'
                                                        }}
                                                    />
                                                </ListItemIcon>
                                                <ListItemText
                                                    id={labelId}
                                                    primary={user.fullName}
                                                    secondary={user.emailAddress}
                                                    sx={{
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        marginTop: '4px',
                                                        marginBottom: '4px',
                                                        '& p': {
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                            fontSize: '0.72rem',
                                                            lineHeight: '1.2',
                                                            letterSpacing: 'unset',
                                                        },
                                                        '& span': {
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                            lineHeight: '1.2',
                                                        }
                                                    }} />
                                            </ListItemButton>
                                        </ListItem>
                                    );
                                })
                            }
                        </List>
                }
            </Stack>
        );
    }
);

interface SecurityRoleMenuProps {
    securityRoleSeclected: SecurityRole[]
    setSecurityRoleSeclected: React.Dispatch<React.SetStateAction<SecurityRole[]>>
}
function SecurityRoleMenu(props: SecurityRoleMenuProps) {
    const { securityRoleSeclected, setSecurityRoleSeclected } = props;

    const [securityRoles, isFetching] = RetrieveSecurityRole();

    const [filter, setFilter] = useState('');

    const [open, setOpen] = useState(false);


    const handleClick = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    const handleSelect = (role: SecurityRole) => () => {
        setSecurityRoleSeclected((oldRoles) => {
            if (oldRoles.includes(role)) {
                return oldRoles.filter(r => r.roleid !== role.roleid);
            }
            else {
                return [...oldRoles, role];
            }
        })
    }


    return (
        <Tooltip title={'Select security roles'}>
            <>
                <IconButton
                    onClick={handleClick}
                >
                    <SecurityIcon />
                </IconButton>
                <Drawer
                    anchor={'right'}
                    open={open}
                    onClose={handleClose}
                    sx={{
                        width: '25%'
                    }}
                >
                    <Box
                        padding={1}
                    >
                        <FilterInput fullWidth placeholder='Filter users by name or email address' returnFilterInput={setFilter} forcedValue={filter} />
                    </Box>
                    <Divider />
                    <List sx={{ width: '25vw', overflowY: 'scroll' }}>
                        {
                            securityRoles.map(role => {
                                if (!role.name.toLowerCase().includes(filter.toLowerCase())) {
                                    return null;
                                }

                                return <SecurityRoleItem handleSelect={handleSelect} role={role} securityRoleSeclected={securityRoleSeclected} />;
                            })
                        }
                    </List>
                </Drawer>
            </>
        </Tooltip>
    );
}
interface SecurityRoleItemProps {
    role: SecurityRole
    handleSelect: (role: SecurityRole) => () => void
    securityRoleSeclected: SecurityRole[]
}
function SecurityRoleItem(props: SecurityRoleItemProps) {
    const { role, handleSelect, securityRoleSeclected } = props;

    return (
        <ListItem
            sx={{
                padding: '2px 12px'
            }}
        >
            <ListItemButton role={undefined} onClick={handleSelect(role)} dense>
                <ListItemIcon
                    sx={{
                        minWidth: '28px'
                    }}
                >
                    <Checkbox
                        edge="start"
                        checked={securityRoleSeclected.includes(role)}
                        tabIndex={-1}
                        disableRipple
                        sx={{
                            padding: '3px'
                        }}
                    />
                </ListItemIcon>
                <Typography variant="inherit">{role.name}</Typography>
            </ListItemButton>
        </ListItem>
    )
}

const impersonation = new ImpersonationButton();
export default impersonation;