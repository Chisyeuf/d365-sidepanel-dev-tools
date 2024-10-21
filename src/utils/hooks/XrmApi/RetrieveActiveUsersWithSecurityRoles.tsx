import { useState, useEffect } from 'react'
import { debugLog } from '../../global/common';
import { ActiveUser } from '../../types/ActiveUser';
import { SecurityRole, TeamsSecurityRole } from '../../types/SecurityRole';


export function RetrieveActiveUsersWithSecurityRoles(islicensed: boolean): [ActiveUser[], boolean] {

    const [data, setData] = useState<ActiveUser[]>([]);
    const [isFetching, setFetching] = useState<boolean>(false)

    useEffect(() => {

        async function fetchData() {
            debugLog("RetrieveActiveUsersWithSecurityRoles");

            const result = await Xrm.WebApi.online.retrieveMultipleRecords("systemuser", "?$select=entityimage_url,systemuserid,azureactivedirectoryobjectid,fullname,internalemailaddress&$expand=systemuserroles_association($select=roleid,name,roleidunique),teammembership_association($select=teamid,name)&$filter=(isdisabled eq false" + (islicensed ? " and islicensed eq true" : "") + ")&$orderby=fullname asc");
            // and accessmode eq 0

            const data = await Promise.all(result.entities.filter(user => user.systemuserroles_association.length > 0 || user.teammembership_association.length > 0).map<Promise<ActiveUser>>(async (user) => {

                return await ConvertToActiveUserObject(user);
            }));

            setData(data);
            setFetching(false);
        }
        setData([]);
        setFetching(true);
        fetchData();

    }, []);

    return [data, isFetching];
}

export async function ConvertToActiveUserObject(user:any) {
    return (
        {
            systemuserid: user["systemuserid"],
            fullname: user["fullname"],
            azureObjectId: user["azureactivedirectoryobjectid"],
            emailAddress: user["internalemailaddress"],
            entityimage_url: user["entityimage_url"],
            securityRoles: (user.systemuserroles_association as any[]).map<SecurityRole>((role: any) => {
                return {
                    name: role["name"],
                    roleid: role["roleid"],
                    uniqueid: role["roleidunique"],
                }
            }),
            teamsRoles: await (async () => {
                const teams = await Xrm.WebApi.online.retrieveMultipleRecords("team", `?$select=teamid,name&$expand=teamroles_association($select=roleid,name,roleidunique)&$filter=(${(user.teammembership_association as any[]).map((t: any) => `teamid eq ${t.teamid}`).join(' or ')})`);

                const teamroles = teams.entities.flatMap<TeamsSecurityRole>(team => {
                    return team.teamroles_association.map((role:any) => {
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
                return teamroles;
            })()
        }
    )
}