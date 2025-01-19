
export const metadataGrid_valueToBoolean = (value: any) => value?.["Value"] ? "true" : "false";
export const metadataGrid_valueToLabel = (value: any) => value?.["UserLocalizedLabel"]?.["Label"];
export const metadataGrid_valueToValue = (value: any) => value?.["Value"];
export const metadataGrid_cascadeConfigToValue = (value: any) => {
    if (value) {
        const result = [value.Behavior, value.Label?.UserLocalizedLabel?.Label];
        return result.filter(r => r).join(': ');
    }
    return undefined
};