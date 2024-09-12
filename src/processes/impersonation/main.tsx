
import { Box, Checkbox, Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Skeleton, Stack, Tooltip, Typography } from '@mui/material';
import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../../utils/global/.processClass';

import { GetExtensionId, debugLog } from '../../utils/global/common';

import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import { RetrieveActiveUsersWithSecurityRoles } from '../../utils/hooks/XrmApi/RetrieveActiveUsersWithSecurityRoles';
import FilterInput from '../../utils/components/FilterInput';

import SecurityIcon from '@mui/icons-material/Security';
import { RetrieveSecurityRole } from '../../utils/hooks/XrmApi/RetrieveSecurityRole';
import { useStateCallback } from '../../utils/hooks/use/useStateCallback';
import { MessageType } from '../../utils/types/Message';
import { ActiveUser } from '../../utils/types/ActiveUser';
import { SecurityRole } from '../../utils/types/SecurityRole';
import PestControlIcon from '@mui/icons-material/PestControl';
import { Env } from '../../utils/global/var';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import AvatarColor from '../../utils/components/AvatarColor';

class ImpersonationButton extends ProcessButton {
    constructor() {
        super(
            'impersonate',
            'Impersonation',
            <PersonSearchIcon />,
            350
        );
        this.process = ImpersonationProcess;
    }
}

const rowHeight = 35;

const ImpersonationProcess = forwardRef<ProcessRef, ProcessProps>(
    function ImpersonationProcess(props: ProcessProps, ref) {

        const isOnPrem: boolean = (Xrm.Utility.getGlobalContext() as any).isOnPremises();

        const [userSelected, setUserSelected] = useStateCallback<ActiveUser | null>(null);
        const [securityRoleSeclected, setSecurityRoleSeclected] = useState<SecurityRole[]>([]);

        const [filter, setFilter] = useState('');

        const [activeUsers, isFetching] = RetrieveActiveUsersWithSecurityRoles(!isOnPrem);

        const extensionId = GetExtensionId();

        const sendNewUserToBackground = (newUser: ActiveUser | null) => {
            const data = { userSelected: newUser, selectedon: new Date(), url: Xrm.Utility.getGlobalContext().getClientUrl(), isOnPrem: isOnPrem };
            chrome.runtime.sendMessage(extensionId, { type: MessageType.IMPERSONATE, data: data },
                function (response) {
                    if (response.success) {
                    }
                }
            );
        }

        const handleSelect = useCallback((user: typeof activeUsers[0]) => () => {
            setUserSelected(
                (oldUser) => oldUser?.systemuserid !== user.systemuserid ? user : null,
                sendNewUserToBackground
            );
        }, [setUserSelected, sendNewUserToBackground]);


        useEffect(() => {
            if (!activeUsers) return;
            chrome.runtime.sendMessage(extensionId, { type: MessageType.GETIMPERSONATION },
                function (existingRules: chrome.declarativeNetRequest.Rule[]) {
                    const url = Xrm.Utility.getGlobalContext().getClientUrl();
                    const currentRule = existingRules.find(r => r.condition.urlFilter?.includes(url) && !r.condition.urlFilter.includes('RemovedAction'));

                    if (currentRule) {
                        const currentAzureId = currentRule.action.requestHeaders?.at(0)?.value;
                        if (currentAzureId) {
                            const impersonateUser = activeUsers.find(u => u.azureObjectId === currentAzureId || u.systemuserid === currentAzureId);
                            setUserSelected(impersonateUser ?? null);

                            props.setBadge(
                                <AvatarColor
                                    fullname={impersonateUser?.fullName}
                                    size={20}
                                    src={impersonateUser?.entityimage_url}
                                    sx={(theme) => ({ border: `2px solid ${theme.palette.background.paper}` })}
                                />
                            );
                        }
                    }
                }
            );
        }, [activeUsers]);


        return (
            <Stack direction='column' spacing={0.5} width='calc(100% - 10px)' padding="10px" height='calc(100% - 10px)'>
                <Stack direction='row' spacing={0.5} width="-webkit-fill-available">
                    <FilterInput fullWidth placeholder='Name or Email address' returnFilterInput={setFilter} />

                    <SecurityRoleMenu securityRoleSeclected={securityRoleSeclected} setSecurityRoleSeclected={setSecurityRoleSeclected} />

                    <Tooltip title={'Hard Reset'}>
                        <IconButton
                            onClick={() => sendNewUserToBackground(null)}
                        >
                            <RestartAltIcon />
                        </IconButton>
                    </Tooltip>

                    {Env.DEBUG &&
                        <IconButton onClick={() => {
                            chrome.runtime.sendMessage(extensionId, { type: MessageType.GETIMPERSONATION },
                                function (existingRules: Promise<chrome.declarativeNetRequest.Rule[]>) {
                                    debugLog('DEBUG: ', existingRules)
                                }
                            );
                        }}>
                            <PestControlIcon />
                        </IconButton>
                    }
                </Stack>
                <Divider />
                {
                    userSelected && activeUsers.length > 0 &&
                    <>
                        <UserItem
                            user={activeUsers.find(user => user.systemuserid === userSelected.systemuserid)!}
                            userSelected={userSelected}
                            handleSelect={handleSelect}
                        />
                        <Divider />
                    </>

                }
                {
                    isFetching ?
                        [...Array(22)].map(() => <Skeleton variant='rounded' height={rowHeight + 'px'} />)
                        :
                        (
                            activeUsers.length > 0 ?
                                <List sx={{ width: '100%', overflowY: 'scroll' }}>
                                    {
                                        activeUsers.map((user) => {

                                            if (securityRoleSeclected.filter(role =>
                                                user.securityRoles.filter(r =>
                                                    r.roleid === role.roleid).length).length !== securityRoleSeclected.length) {
                                                return null;
                                            }

                                            if (!user.fullName.toLowerCase().includes(filter.toLowerCase()) && !user.emailAddress.toLowerCase().includes(filter.toLowerCase())) {
                                                return null;
                                            }

                                            return (
                                                <UserItem
                                                    user={user}
                                                    userSelected={userSelected}
                                                    handleSelect={handleSelect}
                                                />
                                            );
                                        })
                                    }
                                </List>
                                :
                                <Typography variant='caption' textAlign='center' color='grey' fontSize='small'>No enabled {!isOnPrem && "and licensed "}user found</Typography>
                        )
                }
            </Stack>
        );
    }
);


interface UserItemProps {
    user: ActiveUser,
    userSelected: ActiveUser | null,
    handleSelect: (user: ActiveUser) => () => void
}
const UserItem = React.memo((props: UserItemProps) => {
    const { user, userSelected, handleSelect } = props;

    const securityRoleList = useMemo(() => {
        return (
            <ul style={{ fontSize: '1.4em' }}>
                {user.securityRoles.map(s => <li>{s.name}</li>)}
            </ul>
        );
    }, [user]);

    const labelId = `checkbox-list-label-${user.systemuserid}`;
    return (
        <ListItem
            key={user.systemuserid}
            disablePadding
        >
            <Tooltip placement='left' title={securityRoleList}>
                <ListItemButton role={undefined} onClick={handleSelect(user)} dense>
                    <ListItemIcon
                        sx={{
                            minWidth: '28px',
                            mr: 1
                        }}
                    >
                        <Checkbox
                            edge="start"
                            checked={userSelected?.systemuserid === user.systemuserid}
                            tabIndex={-1}
                            disableRipple
                            inputProps={{ 'aria-labelledby': labelId }}
                            sx={{
                                padding: '3px',
                                mr: 1
                            }}
                        />

                        <AvatarColor src={user.entityimage_url} fullname={user.fullName} size={24} />

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
            </Tooltip>
        </ListItem>
    );
});

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
        <>
            <Tooltip title={'Select security roles'}>
                <IconButton
                    onClick={handleClick}
                >
                    <SecurityIcon />
                </IconButton>
            </Tooltip>
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
                    <FilterInput fullWidth placeholder='Filter by name' returnFilterInput={setFilter} defaultValue={filter} />
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
    );
}
interface SecurityRoleItemProps {
    role: SecurityRole
    handleSelect: (role: SecurityRole) => () => void
    securityRoleSeclected: SecurityRole[]
}
const SecurityRoleItem = React.memo((props: SecurityRoleItemProps) => {
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
});

const impersonation = new ImpersonationButton();
export default impersonation;