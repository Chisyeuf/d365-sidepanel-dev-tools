import { SecurityRole, TeamsSecurityRole } from "./SecurityRole"

export interface ActiveUser {
    systemuserid: string
    fullname?: string
    azureObjectId?: string
    emailAddress?: string
    securityRoles: SecurityRole[]
    teamsRoles?: TeamsSecurityRole[]
    entityimage_url: string
}