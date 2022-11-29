// import { useState, useEffect } from 'react'
// import { AttributeMetadata, MSType, getMSTypeKeyByValue, getMSFormatDateKeyByValue, UtilityAttributeMetadata } from '../../global/requestsType';

// export function UtilityRetrieveAttributesMetaData(entityname: string): [AttributeMetadata[], boolean] {

//     const [data, setData] = useState<AttributeMetadata[]>([]);
//     const [isFetching, setIsFetching] = useState<boolean>(false)
//     const _entityname = entityname

//     useEffect(() => {
//         console.log("RetrieveAttributesMetaData");
//         if (!entityname) return;
//         async function fetchData() {
//             const entityF: any = await Xrm.Utility.getEntityMetadata('opportunity')
//             const attributesNameList: string[] = entityF._entityDescriptor.AttributeNames
//             const resultsRaw: any = (await Xrm.Utility.getEntityMetadata('opportunity', attributesNameList)).Attributes
//             const resultArray = resultsRaw.getAll()?.filter((a: any) => {
//                 return a.DisplayName &&
//                     a.attributeDescriptor.IsValidODataAttribute &&
//                     a.attributeDescriptor.IsValidForRead &&
//                     a.attributeDescriptor.IsValidForRead &&
//                     (a.AttributeType != XrmEnum.AttributeTypeCode.Uniqueidentifier && a.LogicalName != _entityname + "id")
//             })

//             resultArray?.sort((a: any, b: any) => {
//                 let aName = a.DisplayName ?? a.LogicalName
//                 let bName = b.DisplayName ?? b.LogicalName
//                 return aName.localeCompare(bName);
//             });

//             const dataM: AttributeMetadata[] = resultArray?.map((attribute: any) => {
//                 const t: AttributeMetadata = {
//                     LogicalName: attribute.LogicalName,
//                     DisplayName: attribute.DisplayName,
//                     MStype: attribute.AttributeType,
//                     SchemaName: "",
//                     IsValidForCreate: attribute.attributeDescriptor.IsValidForCreate,
//                     IsValidForForm: attribute.attributeDescriptor.IsValidForForm,
//                     IsValidForGrid: attribute.attributeDescriptor.IsValidForGrid,
//                     IsValidForRead: attribute.attributeDescriptor.IsValidForRead,
//                     IsValidForUpdate: attribute.attributeDescriptor.IsValidForUpdate,
//                     IsValidODataAttribute: attribute.attributeDescriptor.IsValidODataAttribute,
//                     Parameters: {
//                         MinValue: attribute.attributeDescriptor.MinValue,
//                         MaxValue: attribute.attributeDescriptor.MaxValue,
//                         Precision: attribute.attributeDescriptor.Precision,
//                         MaxLength: attribute.attributeDescriptor.MaxLength,
//                         Target: attribute.attributeDescriptor.Targets?.at(0),
//                         Format: attribute.attributeDescriptor.Format,
//                         // OptionSet: attribute.OptionSet ? Object.values(attribute.OptionSet) : null
//                     }
//                 };
//                 return t
//             });
//             setData(dataM)
//             setIsFetching(false)
//         }
//         setIsFetching(true)
//         setData([])
//         fetchData()

//     }, [_entityname]);

//     return [data, isFetching];
// }

// export { }