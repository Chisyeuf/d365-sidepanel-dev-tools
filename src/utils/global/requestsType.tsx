
export type RequestData = { [id: string]: string };
export type Entity = { entityid: string, name: string, logicalname: string };

export enum MSType {
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

export enum MSDateFormat {
    DateOnly = "DateOnly",
    DateAndTime = "DateAndTime",
    Null = "null",
}
export function getMSFormatDateKeyByValue(value: string): MSDateFormat {
    switch (value) {
        case "DateOnly":
            return MSDateFormat.DateOnly;
        case "DateAndTime":
            return MSDateFormat.DateAndTime;
        default:
            return MSDateFormat.Null;
    }
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
        Format: MSDateFormat
    }
}