
export type RequestData = { [id: string]: string };
export type Entity = { entityid: string, name: string, logicalname: string };

export enum MSType {
    Uniqueidentifier = "Uniqueidentifier",
    Lookup = "Microsoft.Dynamics.CRM.LookupAttributeMetadata",
    String = "Microsoft.Dynamics.CRM.StringAttributeMetadata",
    Memo = "Microsoft.Dynamics.CRM.MemoAttributeMetadata",
    Decimal = "Microsoft.Dynamics.CRM.DecimalAttributeMetadata",
    Double = "Microsoft.Dynamics.CRM.DoubleAttributeMetadata",
    Money = "Microsoft.Dynamics.CRM.MoneyAttributeMetadata",
    Integer = "Microsoft.Dynamics.CRM.IntegerAttributeMetadata",
    BigInt = "Microsoft.Dynamics.CRM.BigIntAttributeMetadata",
    Boolean = "Microsoft.Dynamics.CRM.BooleanAttributeMetadata",
    DateTime = "Microsoft.Dynamics.CRM.DateTimeAttributeMetadata",
    Status = "Microsoft.Dynamics.CRM.StatusAttributeMetadata",
    State = "Microsoft.Dynamics.CRM.StateAttributeMetadata",
    Picklist = "Microsoft.Dynamics.CRM.PicklistAttributeMetadata",
    MultiSelectPicklist = "Microsoft.Dynamics.CRM.MultiSelectPicklistAttributeMetadata",
    Image = "Microsoft.Dynamics.CRM.ImageAttributeMetadata",
    Null = "null",
}
export function getMSTypeKeyByValue(value: string): MSType {
    switch (value) {
        case "Uniqueidentifier":
            return MSType.Uniqueidentifier;
        case "Microsoft.Dynamics.CRM.LookupAttributeMetadata":
            return MSType.Lookup;
        case "Microsoft.Dynamics.CRM.StringAttributeMetadata":
            return MSType.String;
        case "Microsoft.Dynamics.CRM.MemoAttributeMetadata":
            return MSType.Memo;
        case "Microsoft.Dynamics.CRM.DecimalAttributeMetadata":
            return MSType.Decimal;
        case "Microsoft.Dynamics.CRM.DoubleAttributeMetadata":
            return MSType.Double;
        case "Microsoft.Dynamics.CRM.MoneyAttributeMetadata":
            return MSType.Money;
        case "Microsoft.Dynamics.CRM.IntegerAttributeMetadata":
            return MSType.Integer;
        case "Microsoft.Dynamics.CRM.BigIntAttributeMetadata":
            return MSType.BigInt;
        case "Microsoft.Dynamics.CRM.BooleanAttributeMetadata":
            return MSType.Boolean;
        case "Microsoft.Dynamics.CRM.DateTimeAttributeMetadata":
            return MSType.DateTime;
        case "Microsoft.Dynamics.CRM.StatusAttributeMetadata":
            return MSType.Status;
        case "Microsoft.Dynamics.CRM.StateAttributeMetadata":
            return MSType.State;
        case "Microsoft.Dynamics.CRM.PicklistAttributeMetadata":
            return MSType.Picklist;
        case "Microsoft.Dynamics.CRM.MultiSelectPicklistAttributeMetadata":
            return MSType.MultiSelectPicklist;
        case "Microsoft.Dynamics.CRM.ImageAttributeMetadata":
            return MSType.Image;
        default:
            return MSType.Null;
    }
}
export function getReadableMSType(value: MSType): string {
    switch (value) {
        case "Uniqueidentifier":
            return "Uniqueidentifier";
        case "Microsoft.Dynamics.CRM.LookupAttributeMetadata":
            return "Lookup";
        case "Microsoft.Dynamics.CRM.StringAttributeMetadata":
            return "String";
        case "Microsoft.Dynamics.CRM.MemoAttributeMetadata":
            return "Memo";
        case "Microsoft.Dynamics.CRM.DecimalAttributeMetadata":
            return "Decimal";
        case "Microsoft.Dynamics.CRM.DoubleAttributeMetadata":
            return "Double";
        case "Microsoft.Dynamics.CRM.MoneyAttributeMetadata":
            return "Money";
        case "Microsoft.Dynamics.CRM.IntegerAttributeMetadata":
            return "Integer";
        case "Microsoft.Dynamics.CRM.BigIntAttributeMetadata":
            return "BigInt";
        case "Microsoft.Dynamics.CRM.BooleanAttributeMetadata":
            return "Boolean";
        case "Microsoft.Dynamics.CRM.DateTimeAttributeMetadata":
            return "DateTime";
        case "Microsoft.Dynamics.CRM.StatusAttributeMetadata":
            return "Status";
        case "Microsoft.Dynamics.CRM.StateAttributeMetadata":
            return "State";
        case "Microsoft.Dynamics.CRM.PicklistAttributeMetadata":
            return "Picklist";
        case "Microsoft.Dynamics.CRM.MultiSelectPicklistAttributeMetadata":
            return "MultiSelectPicklist";
        case "Microsoft.Dynamics.CRM.ImageAttributeMetadata":
            return "Image";
        default:
            return "None";
    }
}

export enum MSDateFormat {
    DateOnly = "DateOnly",
    DateAndTime = "DateAndTime",
    None = "None"
}
export function getMSFormatDateKeyByValue(value: string): MSDateFormat {
    switch (value) {
        case "DateOnly":
            return MSDateFormat.DateOnly;
        case "DateAndTime":
            return MSDateFormat.DateAndTime;
        default:
            return MSDateFormat.None;
    }
}

export const enum StringAttributeFormat {
    Email = "Email",
    Phone = "Phone",
    Text = "Text",
    TextArea = "TextArea",
    TickerSymbol = "TickerSymbol",
    URL = "Url",
}

export type AttributeMetadata = {
    LogicalName: string,
    DisplayName: string,
    SchemaName: string,
    MStype: MSType,
    IsValidForCreate: boolean,
    IsValidForForm: boolean,
    IsValidForGrid: boolean,
    IsValidForRead: boolean,
    IsValidForUpdate: boolean,
    IsValidODataAttribute: boolean,
    Parameters: {
        MinValue: number,
        MaxValue: number,
        Precision: number,
        MaxLength: number,
        Target: string,
        Format: string
    }
}

interface RelationShipMetadataCommon {
    SchemaName: string,
    IsCustomRelationship: boolean,
    IsValidForAdvancedFind: boolean,
    RelationshipType: RelationshipType,
}

export interface RelationShipMetadataManyToMany extends RelationShipMetadataCommon {
    RelationshipType: RelationshipType.ManyToManyRelationship
    Entity1LogicalName: string,
    Entity1IntersectAttribute: string,
    Entity1NavigationPropertyName: string,
    Entity2LogicalName: string,
    Entity2IntersectAttribute: string,
    Entity2NavigationPropertyName: string,
    IntersectEntityName: string,
}

interface RelationShipMetadataOneToCommon extends RelationShipMetadataCommon {
    ReferencedAttribute: string,
    ReferencedEntity: string,
    ReferencingAttribute: string,
    ReferencingEntity: string,
    ReferencedEntityNavigationPropertyName: string,
    ReferencingEntityNavigationPropertyName: string,
    CascadeConfiguration: CascadeConfiguration,
}

export interface RelationShipMetadataOneToMany extends RelationShipMetadataOneToCommon {
    RelationshipType: RelationshipType.OneToManyRelationship,
}

export interface RelationShipMetadataManyToOne extends RelationShipMetadataOneToCommon {
    RelationshipType: RelationshipType.ManyToOneRelationship,
}

export type RelationShipMetadata = RelationShipMetadataManyToMany | RelationShipMetadataOneToMany | RelationShipMetadataManyToOne;



type CascadeConfiguration = {
    Assign: CascadeConfigurationEnum,
    Delete: CascadeConfigurationEnum,
    Archive: CascadeConfigurationEnum,
    Merge: CascadeConfigurationEnum,
    Reparent: CascadeConfigurationEnum,
    Share: CascadeConfigurationEnum,
    Unshare: CascadeConfigurationEnum,
    RollupView: CascadeConfigurationEnum,
}

export enum RelationshipType {
    ManyToManyRelationship = "ManyToManyRelationship",
    OneToManyRelationship = "OneToManyRelationship",
    ManyToOneRelationship = "ManyToOneRelationship",
}

export type CascadeConfigurationEnum = 'Cascade' | 'NoCascade';


export type RelatedRecordRequest = {
    relationshipSchemaName: string,
    entityName: string,
    navigationPropertyName: string
}