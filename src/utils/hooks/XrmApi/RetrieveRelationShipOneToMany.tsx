import { useState, useEffect, useMemo } from 'react'
import { debugLog } from '../../global/common';
import { RelationShipMetadata, RelationShipMetadataOneToMany } from '../../types/requestsType';

export function RetrieveRelationShipOneToMany(entityname: string): [RelationShipMetadataOneToMany[], boolean] {

    const [data, setData] = useState<RelationShipMetadataOneToMany[]>([])
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const _entityname = useMemo(() => entityname, [entityname]);

    useEffect(() => {
        debugLog("RetrieveRelationShipOneToMany");
        if (!_entityname) return;
        async function fetchData() {
            const response = await fetch(
                Xrm.Utility.getGlobalContext().getClientUrl() +
                "/api/data/v9.0/EntityDefinitions(LogicalName='" +
                _entityname + "')/OneToManyRelationships?$select=SchemaName,RelationshipType,IsCustomRelationship,IsValidForAdvancedFind,ReferencedAttribute,ReferencedEntity,ReferencingAttribute,ReferencingEntity,ReferencedEntityNavigationPropertyName,ReferencingEntityNavigationPropertyName,CascadeConfiguration", {
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

            results.value?.sort((a: any, b: any) => {
                var n = a.DisplayName?.UserLocalizedLabel?.Label?.localeCompare(b.DisplayName?.UserLocalizedLabel?.Label);
                if (n != null && n !== 0) {
                    return n;
                }
                return a.SchemaName.localeCompare(b.SchemaName);
            });
            
            setData(results.value)
            setIsFetching(false)
        }
        setIsFetching(true)
        setData([])
        fetchData()

    }, [_entityname]);

    return [data, isFetching];
}