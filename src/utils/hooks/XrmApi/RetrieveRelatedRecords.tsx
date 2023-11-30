import { useState, useEffect, useMemo } from 'react'
import { GetPrimaryIdAttribute, GetPrimaryNameAttribute, debugLog } from '../../global/common';
import { RetrievePrimaryIdAttribute } from './RetrievePrimaryIdAttribute';
import { RetrievePrimaryNameAttribute } from './RetrievePrimaryNameAttribute';
import { LookupValue } from '../../types/LookupValue';
import { RelatedRecordRequest } from '../../types/requestsType';
import { Dictionary } from 'lodash';
import { useDictionnary } from '../use/useDictionnary';

export function RetrieveRelatedRecords(entityName: string, recordId: string | undefined, relatedRecords: RelatedRecordRequest[]): [{ [relationshipName: string]: LookupValue[] | null }, boolean] {

    const [data, setData] = useState<{ [relationshipName: string]: LookupValue[] | null }>({});
    const [isFetching, setIsFetching] = useState<boolean>(false);

    const _referencedRecordid = useMemo(() => recordId, [recordId]);
    const _referencedEntityName = useMemo(() => entityName, [entityName]);

    const { dict: relatedRecordPrimaryAttributes, setDict: setRelatedRecordPrimaryAttributes, setValue: setRelatedRecordPrimaryAttributesItem } = useDictionnary<{ primaryId: string }>({});
    const [init, setInit] = useState(false);

    // const [_relatedRecordsExpand, setRelatedRecordExpand] = useState<string>('');
    useEffect(() => {
        setInit(false);
        setRelatedRecordPrimaryAttributes({});
        Promise.all(relatedRecords.map(async r => {
            const primaryIdAttribute = await GetPrimaryIdAttribute(r.entityName);
            // const primaryNameAttribute = await GetPrimaryNameAttribute(r.entityName);
            setRelatedRecordPrimaryAttributesItem(r.navigationPropertyName, { primaryId: primaryIdAttribute });
            // return `${r.navigationPropertyName}($select=${primaryIdAttribute ?? ''})`
        })).then(() => {
            setInit(true);
        });
    }, [relatedRecords]);

    const primaryIdReferencedEntity = RetrievePrimaryIdAttribute(_referencedEntityName);

    useEffect(() => {

        if (!_referencedEntityName || !_referencedRecordid || !primaryIdReferencedEntity || !init) {
            setData({});
            setIsFetching(false);
            return;
        }
        async function fetchData() {

            if (!_referencedEntityName || !_referencedRecordid || !primaryIdReferencedEntity || !init) return;


            const expand = Object.entries(relatedRecordPrimaryAttributes).map(([key, value]) => `${key}($select=${value.primaryId})`);

            const results = await Xrm.WebApi.online.retrieveRecord(_referencedEntityName, _referencedRecordid, "?$select=" + primaryIdReferencedEntity + "&$expand=" + expand);
            
            const computedResult: { [relationshipName: string]: LookupValue[] | null } = {};

            relatedRecords.forEach(r => {
                const relationshipAttributeContent = results[r.navigationPropertyName];
                if (relationshipAttributeContent instanceof Array) {
                    computedResult[r.relationshipSchemaName] =
                        relationshipAttributeContent.map((relatedRecord: any) => {
                            const primaryAttributes = relatedRecordPrimaryAttributes[r.relationshipSchemaName];
                            const primaryId = primaryAttributes?.primaryId;
                            // const primaryName = primaryAttributes?.primaryName;
                            const t: LookupValue = {
                                // name: primaryName ? relatedRecord[primaryName] : undefined,
                                id: primaryId ? relatedRecord[primaryId] : '',
                                entityType: r.entityName,
                            }
                            return t;
                        }) ?? null;
                }
                else {
                    const primaryAttributes = relatedRecordPrimaryAttributes[r.navigationPropertyName];
                    const primaryId = primaryAttributes?.primaryId;
                    console.log(relatedRecords, r.relationshipSchemaName, primaryAttributes);
                    computedResult[r.relationshipSchemaName] = relationshipAttributeContent ? [{
                        // name: primaryName ? relatedRecord[primaryName] : undefined,
                        id: primaryId ? relationshipAttributeContent[primaryId] : '',
                        entityType: r.entityName,
                    }] : null;
                }
            });

            setData(computedResult);
            setIsFetching(false);
        }

        setIsFetching(true);
        setData({});
        fetchData();

    }, [_referencedRecordid, primaryIdReferencedEntity, init]);

    return [data, isFetching];
}