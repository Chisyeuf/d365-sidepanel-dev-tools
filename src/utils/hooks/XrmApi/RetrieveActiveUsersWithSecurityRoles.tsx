import { useState, useEffect } from 'react'
import { debugLog } from '../../global/common';
import { ActiveUser } from '../../types/ActiveUser';
import { SecurityRole, TeamsSecurityRole } from '../../types/SecurityRole';
import { useDictionnary } from '../use/useDictionnary';


export function RetrieveActiveUsersWithSecurityRoles(islicensed: boolean) {

    const { values: activeUsers, setValue: setActiveUser, setDict: setActiveUsers } = useDictionnary<ActiveUser>({});
    const [isFetching, setFetching] = useState<boolean>(false);

    useEffect(() => {

        async function fetchData() {
            debugLog("RetrieveActiveUsersWithSecurityRoles");

            const result = await Xrm.WebApi.online.retrieveMultipleRecords("systemuser", "?$select=entityimage_url,systemuserid,azureactivedirectoryobjectid,fullname,internalemailaddress&$expand=systemuserroles_association($select=roleid,name,roleidunique),teammembership_association($select=teamid,name)&$filter=(isdisabled eq false" + (islicensed ? " and islicensed eq true" : "") + ")&$orderby=fullname asc");

            const retrievedUsers = result.entities.filter(user => user.systemuserroles_association.length > 0 || user.teammembership_association.length > 0);
            setActiveUsers(Object.fromEntries(retrievedUsers.map(user => (
                [user["systemuserid"], {
                    systemuserid: user["systemuserid"],
                    fullname: user["fullname"],
                    azureObjectId: user["azureactivedirectoryobjectid"],
                    emailAddress: user["internalemailaddress"],
                    entityimage_url: user["entityimage_url"],
                    securityRoles: (user.systemuserroles_association as any[])?.map<SecurityRole>((role: any) => {
                        return {
                            name: role["name"],
                            roleid: role["roleid"],
                            uniqueid: role["roleidunique"],
                        }
                    }),
                    teamsRoles: undefined
                }]
            ))));

            setFetching(false);

            retrievedUsers.forEach(async (user) => {
                const activeUser = await ConvertToActiveUserObject(user);
                setActiveUser(activeUser.systemuserid, activeUser);
            });
        }
        setFetching(true);
        setActiveUsers({});
        fetchData();

    }, [islicensed, setActiveUser, setActiveUsers]);

    return { activeUsers, isFetching };
}

const FILTER_THRESHOLD = 15;
export async function ConvertToActiveUserObject(user: any) {
    return (
        {
            systemuserid: user["systemuserid"],
            fullname: user["fullname"],
            azureObjectId: user["azureactivedirectoryobjectid"],
            emailAddress: user["internalemailaddress"],
            entityimage_url: user["entityimage_url"],
            securityRoles: (user.systemuserroles_association as any[])?.map<SecurityRole>((role: any) => {
                return {
                    name: role["name"],
                    roleid: role["roleid"],
                    uniqueid: role["roleidunique"],
                }
            }),
            teamsRoles: await (async () => {
                let teamroles: TeamsSecurityRole[] = [];
                const filter = (user.teammembership_association as any[]).map((t: any) => `teamid eq ${t.teamid}`);

                while (filter.length > 0) {
                    const nextFilter = filter.splice(0, FILTER_THRESHOLD);
                    const teams = await Xrm.WebApi.online.retrieveMultipleRecords("team", `?$select=teamid,name&$expand=teamroles_association($select=roleid,name,roleidunique)&$filter=(${nextFilter.join(' or ')})`);

                    const teamRoles = teams.entities.flatMap<TeamsSecurityRole>(team => {
                        return team.teamroles_association.map((role: any) => {
                            return {
                                name: role["name"],
                                roleid: role["roleid"],
                                uniqueid: role["roleidunique"],
                                teamid: team["teamid"],
                                teamname: team["name"],
                            }
                        }
                        )
                    });

                    teamroles = teamroles.concat(teamRoles);
                }

                return teamroles;
            })()
        }
    )
}