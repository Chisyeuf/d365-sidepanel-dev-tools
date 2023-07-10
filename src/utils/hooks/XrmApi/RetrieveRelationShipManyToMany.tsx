import { useState, useEffect, useMemo } from 'react'
import { debugLog } from '../../global/common';
import { RelationShipMetadata, RelationShipMetadataManyToMany } from '../../types/requestsType';

export function RetrieveRelationShipManyToMany(entityname: string): [RelationShipMetadataManyToMany[], boolean] {

    const [data, setData] = useState<RelationShipMetadataManyToMany[]>([])
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const _entityname = useMemo(() => entityname, [entityname]);

    useEffect(() => {
        debugLog("RetrieveRelationShipManyToMany");
        if (!_entityname) return;
        async function fetchData() {
            const response = await fetch(
                Xrm.Utility.getGlobalContext().getClientUrl() +
                "/api/data/v9.2/EntityDefinitions(LogicalName='" +
                _entityname + "')/ManyToManyRelationships?$select=SchemaName,RelationshipType,IsCustomRelationship,IsValidForAdvancedFind,Entity1LogicalName,Entity1IntersectAttribute,Entity2LogicalName,Entity2IntersectAttribute,IntersectEntityName,Entity1NavigationPropertyName,Entity2NavigationPropertyName", {
                method: "GET",
                headers: {
                    "OData-MaxVersion": "4.0",
                    "OData-Version": "4.0",
                    "Content-Type": "application/json; charset=utf-8",
                    "Accept": "application/json",
                    "Prefer": "odata.include-annotations=*"
                }
            });

            const results = await response.json();
            // results.value?.filter((r: any) => r?.IsPrimaryId != false)
            results.value?.sort((a: any, b: any) => {
                var n = a.DisplayName?.UserLocalizedLabel?.Label?.localeCompare(b.DisplayName?.UserLocalizedLabel?.Label);
                if (n != null && n !== 0) {
                    return n;
                }
                return a.SchemaName.localeCompare(b.SchemaName);
            });

            // const relationShips: RelationShipMetadataManyToMany[] = results.value?.map((relationShip: any) => {
            //     const t: RelationShipMetadataManyToMany = {
            //         Entity1IntersectAttribute: relationShip.Entity1IntersectAttribute,
            //         Entity1LogicalName: relationShip.Entity1LogicalName,
            //         Entity2IntersectAttribute: relationShip.Entity2IntersectAttribute,
            //         Entity2LogicalName: relationShip.Entity2LogicalName,
            //         IntersectEntityName: relationShip.IntersectEntityName,
            //         IsCustomRelationship: relationShip.IsCustomRelationship,
            //         IsValidForAdvancedFind: relationShip.IsValidForAdvancedFind,
            //         RelationshipType: relationShip.RelationshipType,
            //         SchemaName: relationShip.SchemaName,
            //     };
            //     return t;
            // });
            setData(results.value)
            setIsFetching(false)
        }
        setIsFetching(true)
        setData([])
        fetchData()

    }, [_entityname]);

    return [data, isFetching];
}