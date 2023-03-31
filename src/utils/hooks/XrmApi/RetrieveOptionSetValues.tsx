// import { useState, useEffect } from 'react'
// import { debugLog } from '../../global/common';
// import { OptionSetValue } from '../../types/OptionSetValue';
// import { MSType } from '../../types/requestsType';



// export function RetrieveOptionSetValues(entityname: string, fieldname: string) {

//     const [data, setData] = useState<OptionSetValue[]>();

//     useEffect(() => {
//         debugLog("RetrieveOptionSetValues");
//         if (!entityname) return;
//         async function fetchData() {
//             const results: OptionSetValue[] = Object.values((await Xrm.Utility.getEntityMetadata('opportunity', ['tls_p2list'])).Attributes.get(0).OptionSet) as any;

//             const values: OptionSetValue[] = [];

//             setData(values);
//         }
//         setData([])
//         fetchData();

//     }, [fieldname]);

//     return data;
// }