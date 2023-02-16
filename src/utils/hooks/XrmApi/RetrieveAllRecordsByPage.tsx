import { GridFilterModel, GridSortDirection, GridSortItem, GridSortModel } from '@mui/x-data-grid'
import { useState, useEffect, useMemo } from 'react'
import { debugLog } from '../../global/common'
import { RetrievePrimaryIdAttribute } from './RetrievePrimaryIdAttribute'
import { RetrievePrimaryNameAttribute } from './RetrievePrimaryNameAttribute'


const skiptokenString = (pageNumber: number | string) => ("&$skiptoken=%3Ccookie%20pagenumber%3D%22" + pageNumber + "%22%20%2F%3E")
const filterString = (filter: string | undefined) => (filter && filter !== '' ? "&$filter=" + filter : "")
const orderbyString = (orderby: string | undefined) => (orderby && orderby !== '' ? "&$orderby=" + orderby : "")
const guidregex = /^[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?$/

export function RetrieveAllRecordsByPage(entityname: string, select: string[], page: number, pageSize: number = 100, filter?: string, orderBy?: GridSortModel): [any[], boolean] {

    const [data, setData] = useState<any[]>([])
    const [isFetching, setFetching] = useState<boolean>(false)

    const primaryNameLogicalName = RetrievePrimaryNameAttribute(entityname)
    const idAttribute = RetrievePrimaryIdAttribute(entityname)

    const _entityname = entityname
    const _select = useMemo(() => select.join(","), [select])
    const _page = page
    const _pageSize = pageSize
    const _filter = useMemo(() => {
        if (!filter || filter === '' || !primaryNameLogicalName || primaryNameLogicalName === '' || !idAttribute || idAttribute === '') return 
        if (guidregex.test(filter))
            return idAttribute + ' eq ' + filter
        else
            return "contains(" + primaryNameLogicalName + ",'" + filter + "')"
    }, [primaryNameLogicalName, filter, idAttribute])
    // const _filter = useMemo(() => {
    //     return filter?.items.map(item => {
    //         return item.columnField + " " + item.operatorValue + " " + item.value
    //     }).join(filter.linkOperator)
    // }, [filter])
    const _orderBy = useMemo(() => {
        return orderBy?.map(item => {
            return item.field + " " + item.sort
        }).join(',')
    }, [orderBy])

    useEffect(() => {

        if (!_entityname || !_select || _select.length === 0) return;

        // if (_select.indexOf(_entityname + "id") == -1) return;

        async function fetchData() {
            debugLog("RetrieveAllRecordsByPage");

            const options: string =
                "?$select=" + _select +
                (_filter ? filterString(_filter) : '') +
                orderbyString(_orderBy) +
                skiptokenString(_page + 1)

            const result = await Xrm.WebApi.online.retrieveMultipleRecords(_entityname, options, _pageSize);

            setData(result.entities)
            setFetching(false)
        }
        setData([])
        setFetching(true)
        fetchData();

    }, [_select, _page, _pageSize, _filter, _orderBy]);

    useEffect(() => {
        setData([])
    }, [_entityname])

    return [data, isFetching];
}