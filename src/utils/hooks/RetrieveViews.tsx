import { useState, useEffect } from 'react'

export type ViewRetrieved = {
    isdefault: boolean,
    fetchxml: string,
    layoutjson: string,
    name: string,
    savedqueryid: string
}

interface Cell {
    Name: string;
    Width: number;
    RelatedEntityName: string;
    DisableMetaDataBinding: boolean;
    LabelId: string;
    IsHidden: boolean;
    DisableSorting: boolean;
    AddedBy: string;
    Desc: string;
    CellType: string;
    ImageProviderWebresource: string;
    ImageProviderFunctionName: string;
}

interface Row {
    Name: string;
    Id: string;
    Cells: Cell[];
    MultiObjectIdField: string;
    LayoutStyle: string;
}

export interface Layout {
    Name: string;
    Object: number;
    Rows: Row[];
    CustomControlDescriptions: any[];
    Jump: string;
    Select: boolean;
    Icon: boolean;
    Preview: boolean;
    IconRenderer: string;
}

export function RetrieveViews(entityname: string) {

    const [data, setData] = useState<ViewRetrieved[]>();
    const _entityname = entityname;

    useEffect(() => {        
        if (!_entityname) return;
        async function fetchData() {
            const result = await Xrm.WebApi.online.retrieveMultipleRecords("savedquery", "?$select=isdefault,fetchxml,layoutjson,name&$filter=returnedtypecode eq '" + _entityname + "'&$orderby=name asc");
            setData(result?.entities);
        }
        fetchData();

    }, [_entityname]);

    return data;
}