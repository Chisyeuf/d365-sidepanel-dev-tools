import { useState, useEffect } from 'react'
import { debugLog } from '../../global/common';
import { ActiveUser } from '../../types/ActiveUser';
import { SecurityRole } from '../../types/SecurityRole';


export function RetrieveActiveUsersWithSecurityRoles(islicensed: boolean): [ActiveUser[], boolean] {

    const [data, setData] = useState<ActiveUser[]>([]);
    const [isFetching, setFetching] = useState<boolean>(false)

    useEffect(() => {

        async function fetchData() {
            debugLog("RetrieveActiveUsersWithSecurityRoles");

            const result = await Xrm.WebApi.online.retrieveMultipleRecords("systemuser", "?$select=entityimage_url,systemuserid,azureactivedirectoryobjectid,fullname,internalemailaddress&$expand=systemuserroles_association($select=roleid,name,roleidunique)&$filter=(isdisabled eq false" + (islicensed ? " and islicensed eq true" : "") + ")&$orderby=fullname asc");
            // and accessmode eq 0

            setData(result.entities.filter(user => user.systemuserroles_association.length && user.systemuserroles_association.length > 0).map<ActiveUser>(user => {
                return {
                    systemuserid: user["systemuserid"],
                    fullName: user["fullname"],
                    azureObjectId: user["azureactivedirectoryobjectid"],
                    emailAddress: user["internalemailaddress"],
                    entityimage_url: user["entityimage_url"],
                    securityRoles: (user.systemuserroles_association as any[]).map<SecurityRole>((role: any) => {
                        return {
                            name: role["name"],
                            roleid: role["roleid"],
                            uniqueid: role["roleidunique"],
                        }
                    })
                }
            }));
            setFetching(false);
        }
        setData([]);
        setFetching(true);
        fetchData();

    }, []);

    return [data, isFetching];
}