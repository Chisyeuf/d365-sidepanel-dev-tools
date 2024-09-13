export interface SecurityRole {
    name: string
    roleid: string
    uniqueid: string
}

export interface TeamsSecurityRole extends SecurityRole {
    teamid:string
    teamname:string
}