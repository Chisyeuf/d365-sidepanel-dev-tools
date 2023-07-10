import { useState, useMemo, useEffect } from 'react';
import { debugLog } from '../../global/common';
import { RelationShipMetadata, RelationShipMetadataManyToOne, RelationShipMetadataOneToMany, RelationshipType } from '../../types/requestsType';

export function RetrieveRelationShipManyToOne(entityname: string): [RelationShipMetadataManyToOne[], boolean] {

    const [data, setData] = useState<RelationShipMetadataManyToOne[]>([])
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const _entityname = useMemo(() => entityname, [entityname]);

    useEffect(() => {
        debugLog("RetrieveRelationShipManyToOne");
        if (!_entityname) return;
        async function fetchData() {
            const response = await fetch(
                Xrm.Utility.getGlobalContext().getClientUrl() +
                "/api/data/v9.2/EntityDefinitions(LogicalName='" +
                _entityname + "')/ManyToOneRelationships?$select=SchemaName,RelationshipType,IsCustomRelationship,IsValidForAdvancedFind,ReferencedAttribute,ReferencedEntity,ReferencingAttribute,ReferencingEntity,ReferencedEntityNavigationPropertyName,ReferencingEntityNavigationPropertyName,CascadeConfiguration", {
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

            // const relationShips: RelationShipMetadataOneToMany[] = results.value?.map((relationShip: any) => {
            //     const t: RelationShipMetadataOneToMany = {
            //         CascadeConfiguration: relationShip.CascadeConfiguration,
            //         IsCustomRelationship: relationShip.IsCustomRelationship,
            //         IsValidForAdvancedFind: relationShip.IsValidForAdvancedFind,
            //         ReferencedAttribute: relationShip.ReferencedAttribute,
            //         ReferencedEntity: relationShip.ReferencedEntity,
            //         ReferencedEntityNavigationPropertyName: relationShip.ReferencedEntityNavigationPropertyName,
            //         ReferencingAttribute: relationShip.ReferencingAttribute,
            //         ReferencingEntity: relationShip.ReferencingEntity,
            //         ReferencingEntityNavigationPropertyName: relationShip.ReferencingEntityNavigationPropertyName,
            //         RelationshipType: relationShip.RelationshipType,
            //         SchemaName: relationShip.Entity1IntersectAttribute,

            //     };
            //     return t;
            // });
            setData(results.value.map((r: RelationShipMetadataOneToMany) => {
                return {
                    ...r,
                    RelationshipType: RelationshipType.ManyToOneRelationship
                }
            }))
            setIsFetching(false)
        }
        setIsFetching(true)
        setData([])
        fetchData()

    }, [_entityname]);

    return [data, isFetching];
}