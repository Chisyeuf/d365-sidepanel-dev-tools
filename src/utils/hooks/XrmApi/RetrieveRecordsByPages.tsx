import { useState, useEffect, useMemo } from 'react'

export function RetrieveRecordsByPages(entityname: string, attributesList: string[], filter: string, page: number, maxRow: number, pageSize: number = 100) {

    var storage: { nextLink: string, records: any[] }[] = new Array(Math.ceil(maxRow / pageSize)).fill({});
    const [data, setData] = useState<any[]>([])
    const [isFetching, setFetching] = useState<boolean>(false)

    const attributes = useMemo(() => attributesList.join(","), [attributesList]);
    const _entityname = entityname;
    const _filter = filter
    const _page = page

    useEffect(() => {
        console.log("RetrieveRecordsByPages");
        if (!_entityname || !attributes || attributes.length === 0) return;
        // if (attributes.indexOf(_entityname + "id") == -1) return;

        function getPreviousLink(page: number) {
            if (storage.at(page - 1)?.nextLink) {
                return storage.at(page - 1)?.nextLink ?? ""
            }
            else {

            }
        }

        async function fetchData() {
            if (storage.at(_page)?.records?.length) {
                setData(storage.at(_page)?.records ?? [])
                setFetching(false)
            }
            else {
                const link = getPreviousLink(_page)
                const options: string =
                    "?$select=" + attributes +
                    (link ? "&" + link : "") +
                    (_filter ? "&$filter=" + _filter : "")

                const result = await Xrm.WebApi.online.retrieveMultipleRecords(_entityname, options, pageSize);
                setData(result.entities)
                let linkIndex: number = result.nextLink.indexOf("$skiptoken")
                let url: string = result.nextLink.substring(linkIndex)
                storage[_page] = { nextLink: url, records: result.entities }
                setFetching(false)
            }
        }
        setFetching(true)
        fetchData();

    }, [attributes, _filter, page]);

    useEffect(() => {
        storage = new Array(Math.ceil(maxRow / pageSize)).fill({})
        setData([])
    }, [_entityname, _filter])

    return { data, isFetching };
}