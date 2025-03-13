import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { ProcessProps, ProcessButton, ProcessRef } from '../../utils/global/.processClass';

import { debugLog } from '../../utils/global/common';

import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import { ConvertToActiveUserObject, RetrieveActiveUsersWithSecurityRoles } from '../../utils/hooks/XrmApi/RetrieveActiveUsersWithSecurityRoles';
import FilterInput from '../../utils/components/FilterInput';

import SecurityIcon from '@mui/icons-material/Security';
import { RetrieveSecurityRole } from '../../utils/hooks/XrmApi/RetrieveSecurityRole';
import { useStateCallback } from '../../utils/hooks/use/useStateCallback';
import { MessageType } from '../../utils/types/Message';
import { ActiveUser } from '../../utils/types/ActiveUser';
import { SecurityRole, TeamsSecurityRole } from '../../utils/types/SecurityRole';
import PestControlIcon from '@mui/icons-material/PestControl';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import AvatarColor from '../../utils/components/AvatarColor';
import { ProviderContext } from 'notistack';
import { NoMaxWidthTooltip } from '../../utils/components/NoMaxWidthTooltip';
import MuiVirtuoso from '../../utils/components/MuiVirtuoso';
import { useSpDevTools } from '../../utils/global/spContext';
import { LinearProgress } from '@mui/material';
import DontShowInfo from '../../utils/components/DontShowInfo';
import MessageManager from '../../utils/global/MessageManager';

import ExtensionIcon from '@mui/icons-material/Extension';

class ImpersonationButton extends ProcessButton {
    constructor() {
        super(
            'impersonate',
            'Impersonation',
            <PersonSearchIcon />,
            350
        );
        this.process = ImpersonationProcess;
        this.description = <>
            <Typography><i>Empower yourself with the ability to impersonate any user on your environment.</i></Typography>
            <Typography>The list of users you can impersonate depends on the environment type:</Typography>
            <List sx={{ listStyleType: 'disc', ml: 3, pt: 0 }}>
                <Typography component='li'><b>Online</b>: Enabled users with valid licenses associated with a security role.</Typography>
                <Typography component='li'><b>On-Premise</b>: Enabled users associated with a security role.</Typography>
            </List>
            <Typography>You can <b>filter</b> the list by <b>name</b>, <b>email address</b> and even with <b>security roles</b>.</Typography>
            <Typography>You can also check each user's security by hovering over their entry in the list.</Typography>
        </>
    }

    onExtensionLoad(snackbarProviderContext: ProviderContext): void {

        MessageManager.sendMessage(MessageType.GETIMPERSONATION).then(
            async function (existingRules: chrome.declarativeNetRequest.Rule[] | null) {
                const url = Xrm.Utility.getGlobalContext().getClientUrl();
                const currentRule = existingRules?.find(r => r.condition.urlFilter?.includes(url) && !r.condition.urlFilter.includes('RemovedAction'));

                if (currentRule) {
                    const currentAzureIdOrUserId = currentRule.action.requestHeaders?.at(0)?.value;

                    if (currentAzureIdOrUserId) {

                        const result = await Xrm.WebApi.online.retrieveMultipleRecords("systemuser", `?$select=systemuserid,fullname&$filter=(systemuserid eq ${currentAzureIdOrUserId} or azureactivedirectoryobjectid eq ${currentAzureIdOrUserId})&$expand=systemuserroles_association($select=roleid,name,roleidunique),teammembership_association($select=teamid,name)`);
                        if (result.entities.length > 0) {
                            const user: ActiveUser = await ConvertToActiveUserObject(result.entities[0]);

                            snackbarProviderContext.enqueueSnackbar(<>You are impersonating <b>{user.fullname}</b> ({user.systemuserid})</>, {
                                variant: 'detailsFile',
                                detailsVariant: 'info',
                                persist: true,
                                detailsNode: <RolesDisplayList user={user} />
                            })
                        }
                    }
                }
            }
        );
    }
}

const rowHeight = 35;

const ImpersonationProcess = forwardRef<ProcessRef, ProcessProps>(
    function ImpersonationProcess(props: ProcessProps, ref) {
        const { setBadge } = props;

        const { isDebug } = useSpDevTools();

        const isOnPrem: boolean = (Xrm.Utility.getGlobalContext() as any).isOnPremises();

        const [selectedUser, setUserSelected] = useStateCallback<ActiveUser | null>(null);
        const [securityRoleSelected, setSecurityRoleSeclected] = useState<SecurityRole[]>([]);

        const [filter, setFilter] = useState('');

        const { activeUsers, isFetching } = RetrieveActiveUsersWithSecurityRoles(!isOnPrem);

        const loadedActiveUsers = useMemo(() => activeUsers.filter(user => user.teamsRoles).length, [activeUsers]);
        const totalActiveUsers = useMemo(() => activeUsers.length, [activeUsers.length]);
        const completion = useMemo(() => totalActiveUsers > 0 ? Math.round((loadedActiveUsers / totalActiveUsers) * 100) : 0, [loadedActiveUsers, totalActiveUsers]);


        const sendNewUserToBackground = useCallback((newUser: ActiveUser | null) => {
            const data = { userSelected: newUser, selectedon: new Date(), url: Xrm.Utility.getGlobalContext().getClientUrl(), isOnPrem: isOnPrem };
            MessageManager.sendMessage(MessageType.IMPERSONATE, data);
        }, [isOnPrem]);

        const handleSelect = useCallback((user: typeof activeUsers[0]) => () => {
            setUserSelected(
                (oldUser) => oldUser?.systemuserid !== user.systemuserid ? user : null,
                sendNewUserToBackground
            );
        }, [sendNewUserToBackground, setUserSelected]);


        useEffect(() => {
            if (!activeUsers) return;
            MessageManager.sendMessage(MessageType.GETIMPERSONATION).then(
                function (existingRules: chrome.declarativeNetRequest.Rule[] | null) {
                    const url = Xrm.Utility.getGlobalContext().getClientUrl();
                    const currentRule = existingRules?.find(r => r.condition.urlFilter?.includes(url) && !r.condition.urlFilter.includes('RemovedAction'));

                    if (currentRule) {
                        const currentAzureId = currentRule.action.requestHeaders?.at(0)?.value;
                        if (currentAzureId) {
                            const impersonateUser = activeUsers.find(u => u.azureObjectId === currentAzureId || u.systemuserid === currentAzureId);
                            setUserSelected(impersonateUser ?? null);

                            setBadge(
                                <AvatarColor
                                    fullname={impersonateUser?.fullname}
                                    size={20}
                                    src={impersonateUser?.entityimage_url}
                                    sx={(theme) => ({ border: `2px solid ${theme.palette.background.paper}` })}
                                />
                            );
                        }
                    }
                }
            );
        }, [activeUsers, setUserSelected, setBadge]);


        const filteredActiveUsers = useMemo(() => {
            return activeUsers.filter(user => {

                if (securityRoleSelected.filter(selectedRole =>
                    user.securityRoles.filter(
                        securityRole => securityRole.roleid === selectedRole.roleid
                    ).length +
                    (user.teamsRoles?.filter(
                        teamRole => teamRole.roleid === selectedRole.roleid
                    ).length ?? 0)
                ).length !== securityRoleSelected.length) {
                    return false;
                }

                if (!user.fullname?.toLowerCase().includes(filter.toLowerCase()) && !user.emailAddress?.toLowerCase().includes(filter.toLowerCase())) {
                    return false;
                }
                return true;
            })
        }, [activeUsers, filter, securityRoleSelected]);

        const debugFn = useCallback(() => {
            debugLog("DEBUG: Impersonation - activeUsers object:", activeUsers);

            MessageManager.sendMessage(MessageType.GETIMPERSONATION).then(
                function (existingRules: chrome.declarativeNetRequest.Rule[] | null) {
                    debugLog('DEBUG: Impersonation - session rule currently applied:', existingRules);
                }
            );
        }, [activeUsers]);


        return (
            <Stack direction='column' spacing={0.5} padding="10px" height='calc(100% - 20px)'>

                <DontShowInfo storageName={`${props.id}-maininfo`} displayOpenOptionButton>
                    <Typography variant='body2'>If you made a mistake and can no longer access this tool, you can reset the impersonation by clicking on the extensions button (<ExtensionIcon fontSize='inherit' />) in your browser toolbar and opening the extension, which will show you the options.</Typography>
                </DontShowInfo>

                <Stack direction='row' spacing={0.5} width="-webkit-fill-available">
                    <FilterInput fullWidth placeholder='Name or Email address' returnFilterInput={setFilter} />

                    <SecurityRoleMenu securityRoleSeclected={securityRoleSelected} setSecurityRoleSeclected={setSecurityRoleSeclected} />

                    <Tooltip title={'Hard Reset'}>
                        <IconButton
                            onClick={() => sendNewUserToBackground(null)}
                        >
                            <RestartAltIcon />
                        </IconButton>
                    </Tooltip>

                    {isDebug.value &&
                        <IconButton onClick={debugFn}>
                            <PestControlIcon />
                        </IconButton>
                    }
                </Stack>
                <Divider />

                {
                    completion < 100 &&
                    <Box>
                        <Typography
                            variant="body2"
                            sx={{ color: 'text.secondary' }}
                        >
                            <i>Fetching teams security roles...</i>
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                                <LinearProgress variant="determinate" value={completion} />
                            </Box>
                            <Box sx={{ minWidth: 35 }}>
                                <Typography
                                    variant="body2"
                                    sx={{ color: 'text.secondary' }}
                                >{`${completion || 0}%`}</Typography>
                            </Box>
                        </Box>
                    </Box>
                }

                {
                    selectedUser && activeUsers.length > 0 &&
                    <>
                        <UserItem
                            user={activeUsers.find(user => user.systemuserid === selectedUser.systemuserid)!}
                            userSelected={selectedUser}
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
                                <List sx={{ width: '100%', height: '100%' }}>
                                    <MuiVirtuoso
                                        data={filteredActiveUsers}
                                        itemContent={(index, user) => {
                                            return (
                                                <UserItem
                                                    user={user}
                                                    userSelected={selectedUser}
                                                    handleSelect={handleSelect}
                                                />
                                            );
                                        }}
                                    />
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
        return <RolesDisplayList user={user} />;
    }, [user]);

    const labelId = `checkbox-list-label-${user.systemuserid}`;
    return (
        <ListItem
            key={user.systemuserid}
            disablePadding
        >
            <NoMaxWidthTooltip placement='left' title={securityRoleList}>
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

                        <AvatarColor
                            src={user.entityimage_url}
                            fullname={user.fullname}
                            size={24}
                            loading={!user.teamsRoles}
                            circularProgressRatio={1.33}
                        />

                    </ListItemIcon>
                    <ListItemText
                        id={labelId}
                        primary={user.fullname}
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
            </NoMaxWidthTooltip>
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
interface RolesDisplayListProps {
    user: ActiveUser
}
const RolesDisplayList = React.memo((props: RolesDisplayListProps) => {
    const { user } = props;

    return (
        <List dense subheader={<><b>User roles</b>:</>} sx={{ fontSize: "1.15em" }}>
            {user.securityRoles.map(s => <ListItem sx={{ display: 'list-item', pt: 0, pb: 0 }}><ListItemText primary={s.name} /></ListItem>)}
            {!user.teamsRoles && <ListItem sx={{ display: 'list-item', pt: 0, pb: 0 }}><ListItemText primary={<i>Fetching teams security roles...</i>} /></ListItem>}
            {
                user.teamsRoles && Object.values(user.teamsRoles.reduce((result: { [key: string]: TeamsSecurityRole[] }, currentItem) => {
                    // Retrieve attribute value to group by
                    const groupKey = currentItem["teamid"];
                    // Initialize the group if not existing
                    if (!result[groupKey]) {
                        result[groupKey] = [];
                    }
                    // Add element to group
                    result[groupKey].push(currentItem);
                    return result;
                }, {})).map((roles) => {
                    return (
                        <>
                            {
                                roles.map(r =>
                                    <ListItem sx={{ display: 'list-item', pt: 0, pb: 0 }}>
                                        <ListItemText primary={<>{r.name} <Typography sx={{ opacity: 0.75 }} variant='caption'>(team <b><i>{roles[0]?.teamname}</i></b> inheritance)</Typography></>} />
                                    </ListItem>
                                )
                            }
                        </>
                    )
                })
            }
        </List>
    )
});

const impersonation = new ImpersonationButton();
export default impersonation;