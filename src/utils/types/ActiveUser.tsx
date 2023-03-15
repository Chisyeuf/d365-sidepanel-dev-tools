import { SecurityRole } from "./SecurityRole"

export interface ActiveUser {
    systemuserid: string
    fullName: string
    azureObjectId: string
    emailAddress: string
    securityRoles: SecurityRole[]
}